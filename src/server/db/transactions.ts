import {
  PrismaClient,
  Prisma,
  PaymentStatus,
  OrderStatus,
  InventoryTransactionType,
  CashTransactionType,
  CashTransactionCategory,
  ReturnStatus,
  ExchangeStatus,
} from '@prisma/client';
import { prisma as defaultPrisma } from './prisma.ts';

// ----------------------------------------------------
// 1. PAYMENT APPROVAL TRANSACTION
// ----------------------------------------------------

export interface ApprovePaymentParams {
  paymentId: string;
  adminId: string;
  accountName?: string;
  notes?: string;
}

export async function approvePaymentTransaction(
  params: ApprovePaymentParams,
  client: PrismaClient = defaultPrisma
) {
  const { paymentId, adminId, accountName = 'bKash Merchant', notes } = params;

  return await client.$transaction(async (tx) => {
    // 1. Fetch current payment
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: true, submissions: true },
    });

    if (!payment) {
      throw new Error(`Payment with ID ${paymentId} not found.`);
    }

    if (payment.status === PaymentStatus.APPROVED) {
      throw new Error(`Payment ${payment.paymentNumber} is already approved.`);
    }

    // 2. Update payment status to APPROVED
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.APPROVED,
        notes: notes || payment.notes,
        updatedAt: new Date(),
      },
    });

    // 3. Mark any associated pending submissions as APPROVED
    await tx.paymentSubmission.updateMany({
      where: { paymentId, status: PaymentStatus.UNDER_REVIEW },
      data: { status: PaymentStatus.APPROVED },
    });

    // 4. Create audit trail in PaymentStatusHistory
    await tx.paymentStatusHistory.create({
      data: {
        paymentId,
        fromStatus: payment.status,
        toStatus: PaymentStatus.APPROVED,
        changedByAdminId: adminId,
        reason: notes || 'Payment verified and approved by admin',
      },
    });

    // 5. Update Order payment status & confirm order if pending
    const updatedOrder = await tx.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: PaymentStatus.APPROVED,
        orderStatus:
          payment.order.orderStatus === OrderStatus.PENDING_PAYMENT
            ? OrderStatus.CONFIRMED
            : payment.order.orderStatus,
      },
    });

    // 6. Record order status history if order was confirmed
    if (payment.order.orderStatus === OrderStatus.PENDING_PAYMENT) {
      await tx.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          fromStatus: OrderStatus.PENDING_PAYMENT,
          toStatus: OrderStatus.CONFIRMED,
          notes: `Order automatically confirmed upon payment approval (${payment.paymentNumber})`,
          changedById: adminId,
        },
      });
    }

    // 7. Record Cash Inflow (SALES_REVENUE) in CashTransaction
    const cashTxNumber = `CTX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const cashTransaction = await tx.cashTransaction.create({
      data: {
        transactionNumber: cashTxNumber,
        type: CashTransactionType.DEBIT, // Debit = Cash Inflow
        category: CashTransactionCategory.SALES_REVENUE,
        amount: payment.amount,
        accountName,
        description: `Sales revenue received for Order ${payment.order.orderNumber}`,
        referenceType: 'ORDER_PAYMENT',
        referenceId: payment.id,
        orderPaymentId: payment.id,
        recordedByAdminId: adminId,
      },
    });

    // 8. Log Admin Activity
    await tx.activityLog.create({
      data: {
        adminId,
        action: 'PAYMENT_APPROVED',
        entity: 'Payment',
        entityId: payment.id,
        metadata: {
          paymentNumber: payment.paymentNumber,
          orderNumber: payment.order.orderNumber,
          amount: Number(payment.amount),
          cashTransactionNumber: cashTxNumber,
        },
      },
    });

    return {
      payment: updatedPayment,
      order: updatedOrder,
      cashTransaction,
    };
  });
}

// ----------------------------------------------------
// 2. ORDER CONFIRMATION & INVENTORY RESERVATION
// ----------------------------------------------------

export interface ConfirmOrderParams {
  orderId: string;
  adminId?: string;
  notes?: string;
}

export async function confirmOrderTransaction(
  params: ConfirmOrderParams,
  client: PrismaClient = defaultPrisma
) {
  const { orderId, adminId, notes } = params;

  return await client.$transaction(async (tx) => {
    // 1. Fetch order with items and variants
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: { inventory: true },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found.`);
    }

    if (order.orderStatus === OrderStatus.CANCELLED) {
      throw new Error(`Cannot confirm a cancelled order (${order.orderNumber}).`);
    }

    // 2. Size-aware inventory check & reservation
    for (const item of order.items) {
      const inventory = item.variant.inventory;

      if (!inventory) {
        throw new Error(
          `Inventory record missing for variant ${item.variant.sku} (Size ${item.sizeCode}).`
        );
      }

      if (inventory.availableQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.productTitle} (${item.sizeCode}). Available: ${inventory.availableQuantity}, Required: ${item.quantity}.`
        );
      }

      // Reserve stock: decrease available, increase reserved
      const previousAvailable = inventory.availableQuantity;
      const newAvailable = inventory.availableQuantity - item.quantity;
      const newReserved = inventory.reservedQuantity + item.quantity;

      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          availableQuantity: newAvailable,
          reservedQuantity: newReserved,
        },
      });

      // Record immutable Inventory Transaction
      await tx.inventoryTransaction.create({
        data: {
          variantId: item.variantId,
          transactionType: InventoryTransactionType.ORDER_RESERVED,
          quantityChange: -item.quantity,
          previousAvailable,
          newAvailable,
          referenceType: 'ORDER',
          referenceId: order.id,
          notes: `Stock reserved for Order ${order.orderNumber}`,
          performedById: adminId,
        },
      });
    }

    // 3. Update Order status
    const previousStatus = order.orderStatus;
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.CONFIRMED,
        adminNotes: notes || order.adminNotes,
      },
    });

    // 4. Create Order Status History
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: previousStatus,
        toStatus: OrderStatus.CONFIRMED,
        notes: notes || 'Order confirmed and inventory reserved',
        changedById: adminId,
      },
    });

    // 5. Create Activity Log
    if (adminId) {
      await tx.activityLog.create({
        data: {
          adminId,
          action: 'ORDER_CONFIRMED',
          entity: 'Order',
          entityId: order.id,
          metadata: {
            orderNumber: order.orderNumber,
            itemCount: order.items.length,
          },
        },
      });
    }

    return updatedOrder;
  });
}

// ----------------------------------------------------
// 3. SIZE-AWARE INVENTORY CHANGE TRANSACTION
// ----------------------------------------------------

export interface AdjustInventoryParams {
  variantId: string;
  transactionType: InventoryTransactionType;
  quantityChange: number; // positive to add stock, negative to reduce
  referenceType?: string;
  referenceId?: string;
  performedById?: string;
  notes?: string;
}

export async function recordInventoryChangeTransaction(
  params: AdjustInventoryParams,
  client: PrismaClient = defaultPrisma
) {
  const {
    variantId,
    transactionType,
    quantityChange,
    referenceType,
    referenceId,
    performedById,
    notes,
  } = params;

  return await client.$transaction(async (tx) => {
    // 1. Fetch variant and inventory
    const variant = await tx.productVariant.findUnique({
      where: { id: variantId },
      include: { inventory: true, product: true, size: true },
    });

    if (!variant) {
      throw new Error(`Product variant ${variantId} not found.`);
    }

    let inventory = variant.inventory;

    // Create inventory bucket if not exists
    if (!inventory) {
      inventory = await tx.inventory.create({
        data: {
          productId: variant.productId,
          variantId: variant.id,
          sizeId: variant.sizeId,
          availableQuantity: 0,
          reservedQuantity: 0,
          soldQuantity: 0,
          returnedQuantity: 0,
          damagedQuantity: 0,
          lostQuantity: 0,
          totalQuantity: 0,
        },
      });
    }

    const previousAvailable = inventory.availableQuantity;
    let newAvailable = inventory.availableQuantity;
    let newReserved = inventory.reservedQuantity;
    let newSold = inventory.soldQuantity;
    let newReturned = inventory.returnedQuantity;
    let newDamaged = inventory.damagedQuantity;
    let newLost = inventory.lostQuantity;

    // Adjust specific stock bucket based on transaction type
    switch (transactionType) {
      case InventoryTransactionType.PURCHASE_RECEIPT:
      case InventoryTransactionType.MANUAL_ADJUSTMENT:
        newAvailable += quantityChange;
        break;

      case InventoryTransactionType.ORDER_RESERVED:
        newAvailable -= Math.abs(quantityChange);
        newReserved += Math.abs(quantityChange);
        break;

      case InventoryTransactionType.ORDER_FULFILLED:
        newReserved -= Math.abs(quantityChange);
        newSold += Math.abs(quantityChange);
        break;

      case InventoryTransactionType.ORDER_CANCELLED_RELEASE:
        newReserved -= Math.abs(quantityChange);
        newAvailable += Math.abs(quantityChange);
        break;

      case InventoryTransactionType.CUSTOMER_RETURN:
        newReturned += Math.abs(quantityChange);
        newAvailable += Math.abs(quantityChange);
        break;

      case InventoryTransactionType.DAMAGED_WRITE_OFF:
        newAvailable -= Math.abs(quantityChange);
        newDamaged += Math.abs(quantityChange);
        break;

      case InventoryTransactionType.LOST_WRITE_OFF:
        newAvailable -= Math.abs(quantityChange);
        newLost += Math.abs(quantityChange);
        break;

      case InventoryTransactionType.EXCHANGE_IN:
        newAvailable += Math.abs(quantityChange);
        break;

      case InventoryTransactionType.EXCHANGE_OUT:
        newAvailable -= Math.abs(quantityChange);
        newSold += Math.abs(quantityChange);
        break;
    }

    if (newAvailable < 0) {
      throw new Error(
        `Adjustment would result in negative available inventory (${newAvailable}) for SKU ${variant.sku}.`
      );
    }

    const newTotal = newAvailable + newReserved + newDamaged + newLost;

    // 2. Update Inventory record
    const updatedInventory = await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        availableQuantity: newAvailable,
        reservedQuantity: Math.max(0, newReserved),
        soldQuantity: newSold,
        returnedQuantity: newReturned,
        damagedQuantity: newDamaged,
        lostQuantity: newLost,
        totalQuantity: newTotal,
        lastRestockedAt:
          transactionType === InventoryTransactionType.PURCHASE_RECEIPT
            ? new Date()
            : inventory.lastRestockedAt,
      },
    });

    // 3. Create Immutable Inventory Transaction
    const invTx = await tx.inventoryTransaction.create({
      data: {
        variantId,
        transactionType,
        quantityChange,
        previousAvailable,
        newAvailable,
        referenceType,
        referenceId,
        performedById,
        notes: notes || `Inventory transaction: ${transactionType}`,
      },
    });

    return {
      inventory: updatedInventory,
      transaction: invTx,
    };
  });
}

// ----------------------------------------------------
// 4. PURCHASE & RECEIPT TRANSACTION
// ----------------------------------------------------

export interface CreatePurchaseItemInput {
  variantId: string;
  quantityOrdered: number;
  unitBuyingPrice: number | Prisma.Decimal;
}

export interface CreatePurchaseParams {
  supplierId: string;
  adminId: string;
  items: CreatePurchaseItemInput[];
  shippingCost?: number;
  taxCost?: number;
  paidAmount?: number;
  notes?: string;
}

export async function createPurchaseTransaction(
  params: CreatePurchaseParams,
  client: PrismaClient = defaultPrisma
) {
  const {
    supplierId,
    adminId,
    items,
    shippingCost = 0,
    taxCost = 0,
    paidAmount = 0,
    notes,
  } = params;

  return await client.$transaction(async (tx) => {
    // 1. Calculate item costs
    let subtotal = new Prisma.Decimal(0);
    const purchaseItemsData = items.map((item) => {
      const unitCost = new Prisma.Decimal(item.unitBuyingPrice.toString());
      const totalCost = unitCost.mul(item.quantityOrdered);
      subtotal = subtotal.add(totalCost);
      return {
        variantId: item.variantId,
        quantityOrdered: item.quantityOrdered,
        unitBuyingPrice: unitCost,
        totalCost,
      };
    });

    const totalCost = subtotal.add(shippingCost).add(taxCost);
    const dueAmount = totalCost.sub(paidAmount);
    const poNumber = `PO-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // 2. Create Purchase Order
    const purchase = await tx.purchase.create({
      data: {
        purchaseNumber: poNumber,
        supplierId,
        status: 'PENDING',
        subtotal,
        shippingCost: new Prisma.Decimal(shippingCost),
        taxCost: new Prisma.Decimal(taxCost),
        totalCost,
        paidAmount: new Prisma.Decimal(paidAmount),
        dueAmount,
        managedByAdminId: adminId,
        notes,
        items: {
          create: purchaseItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // 3. Update Supplier balance & count
    await tx.supplier.update({
      where: { id: supplierId },
      data: {
        totalPurchasesCount: { increment: 1 },
        totalPayable: { increment: dueAmount },
      },
    });

    // 4. Record Cash Outflow if paid immediately
    if (paidAmount > 0) {
      const cashTxNumber = `CTX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await tx.cashTransaction.create({
        data: {
          transactionNumber: cashTxNumber,
          type: CashTransactionType.CREDIT, // Credit = Cash Outflow
          category: CashTransactionCategory.PURCHASE_PAYMENT,
          amount: new Prisma.Decimal(paidAmount),
          accountName: 'City Bank Operating',
          description: `Supplier payment for Purchase Order ${poNumber}`,
          referenceType: 'PURCHASE',
          referenceId: purchase.id,
          purchaseId: purchase.id,
          recordedByAdminId: adminId,
        },
      });
    }

    // 5. Activity log
    await tx.activityLog.create({
      data: {
        adminId,
        action: 'PURCHASE_CREATED',
        entity: 'Purchase',
        entityId: purchase.id,
        metadata: {
          purchaseNumber: poNumber,
          totalCost: Number(totalCost),
          itemCount: items.length,
        },
      },
    });

    return purchase;
  });
}

export interface ReceivePurchaseParams {
  purchaseId: string;
  adminId: string;
  notes?: string;
}

export async function receivePurchaseTransaction(
  params: ReceivePurchaseParams,
  client: PrismaClient = defaultPrisma
) {
  const { purchaseId, adminId, notes } = params;

  return await client.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: { items: true },
    });

    if (!purchase) {
      throw new Error(`Purchase ${purchaseId} not found.`);
    }

    if (purchase.status === 'RECEIVED') {
      throw new Error(`Purchase ${purchase.purchaseNumber} has already been received.`);
    }

    // 1. Restock each variant in inventory
    for (const item of purchase.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        include: { inventory: true },
      });

      if (!variant) continue;

      let inventory = variant.inventory;
      if (!inventory) {
        inventory = await tx.inventory.create({
          data: {
            productId: variant.productId,
            variantId: variant.id,
            sizeId: variant.sizeId,
            availableQuantity: 0,
            totalQuantity: 0,
          },
        });
      }

      const previousAvailable = inventory.availableQuantity;
      const newAvailable = inventory.availableQuantity + item.quantityOrdered;
      const newTotal = inventory.totalQuantity + item.quantityOrdered;

      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          availableQuantity: newAvailable,
          totalQuantity: newTotal,
          lastRestockedAt: new Date(),
        },
      });

      // Update variant's current buying price and price history
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { currentBuyingPrice: item.unitBuyingPrice },
      });

      await tx.variantPriceHistory.create({
        data: {
          variantId: item.variantId,
          buyingPrice: item.unitBuyingPrice,
          sellingPrice: variant.currentSellingPrice,
          reason: `Updated from PO ${purchase.purchaseNumber}`,
          changedByUserId: adminId,
        },
      });

      // Log Inventory Transaction
      await tx.inventoryTransaction.create({
        data: {
          variantId: item.variantId,
          transactionType: InventoryTransactionType.PURCHASE_RECEIPT,
          quantityChange: item.quantityOrdered,
          previousAvailable,
          newAvailable,
          referenceType: 'PURCHASE',
          referenceId: purchase.id,
          notes: `Stock received from PO ${purchase.purchaseNumber}`,
          performedById: adminId,
        },
      });
    }

    // 2. Mark Purchase as RECEIVED
    const updatedPurchase = await tx.purchase.update({
      where: { id: purchaseId },
      data: {
        status: 'RECEIVED',
        receivedDate: new Date(),
        notes: notes || purchase.notes,
      },
    });

    // 3. Activity Log
    await tx.activityLog.create({
      data: {
        adminId,
        action: 'PURCHASE_RECEIVED',
        entity: 'Purchase',
        entityId: purchase.id,
        metadata: {
          purchaseNumber: purchase.purchaseNumber,
        },
      },
    });

    return updatedPurchase;
  });
}

// ----------------------------------------------------
// 5. CUSTOMER RETURN & REFUND TRANSACTION
// ----------------------------------------------------

export interface ProcessReturnParams {
  returnId: string;
  adminId: string;
  approve: boolean;
  refundAmount?: number;
  refundMethod?: string;
  restockItems?: boolean;
  notes?: string;
}

export async function processReturnTransaction(
  params: ProcessReturnParams,
  client: PrismaClient = defaultPrisma
) {
  const {
    returnId,
    adminId,
    approve,
    refundAmount,
    refundMethod = 'BKASH',
    restockItems = true,
    notes,
  } = params;

  return await client.$transaction(async (tx) => {
    const returnRecord = await tx.return.findUnique({
      where: { id: returnId },
      include: { items: true, order: true },
    });

    if (!returnRecord) {
      throw new Error(`Return request ${returnId} not found.`);
    }

    if (returnRecord.status !== ReturnStatus.PENDING) {
      throw new Error(
        `Return ${returnRecord.returnNumber} has already been processed with status ${returnRecord.status}.`
      );
    }

    if (!approve) {
      // Reject return
      const rejected = await tx.return.update({
        where: { id: returnId },
        data: {
          status: ReturnStatus.REJECTED,
          approvedByAdminId: adminId,
          resolvedAt: new Date(),
          notes: notes || 'Return request rejected by admin inspection',
        },
      });

      await tx.activityLog.create({
        data: {
          adminId,
          action: 'RETURN_REJECTED',
          entity: 'Return',
          entityId: returnId,
          metadata: { returnNumber: returnRecord.returnNumber },
        },
      });

      return rejected;
    }

    // Approve return
    const approvedRefund =
      refundAmount !== undefined
        ? new Prisma.Decimal(refundAmount)
        : returnRecord.refundAmount || new Prisma.Decimal(0);

    // 1. Restock items into inventory if condition is restockable
    if (restockItems) {
      for (const item of returnRecord.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { inventory: true },
        });

        if (variant?.inventory) {
          const prev = variant.inventory.availableQuantity;
          const next = prev + item.quantity;

          await tx.inventory.update({
            where: { id: variant.inventory.id },
            data: {
              availableQuantity: next,
              returnedQuantity: variant.inventory.returnedQuantity + item.quantity,
              totalQuantity: variant.inventory.totalQuantity + item.quantity,
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              variantId: item.variantId,
              transactionType: InventoryTransactionType.CUSTOMER_RETURN,
              quantityChange: item.quantity,
              previousAvailable: prev,
              newAvailable: next,
              referenceType: 'RETURN',
              referenceId: returnRecord.id,
              notes: `Customer return restocked (${returnRecord.returnNumber})`,
              performedById: adminId,
            },
          });

          await tx.returnItem.update({
            where: { id: item.id },
            data: { restocked: true },
          });
        }
      }
    }

    // 2. Record Cash Outflow (RETURN_REFUND)
    if (approvedRefund.gt(0)) {
      const cashTxNumber = `CTX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await tx.cashTransaction.create({
        data: {
          transactionNumber: cashTxNumber,
          type: CashTransactionType.CREDIT, // Outflow
          category: CashTransactionCategory.RETURN_REFUND,
          amount: approvedRefund,
          accountName: refundMethod === 'BKASH' ? 'bKash Merchant' : 'City Bank Operating',
          description: `Customer refund for Return ${returnRecord.returnNumber}`,
          referenceType: 'RETURN',
          referenceId: returnRecord.id,
          returnId: returnRecord.id,
          recordedByAdminId: adminId,
        },
      });
    }

    // 3. Update return record
    const updatedReturn = await tx.return.update({
      where: { id: returnId },
      data: {
        status: ReturnStatus.REFUNDED,
        refundAmount: approvedRefund,
        refundMethod,
        approvedByAdminId: adminId,
        resolvedAt: new Date(),
        notes: notes || returnRecord.notes,
      },
    });

    // 4. Update order status to RETURNED if all items returned
    await tx.order.update({
      where: { id: returnRecord.orderId },
      data: { orderStatus: OrderStatus.RETURNED },
    });

    // 5. Activity Log
    await tx.activityLog.create({
      data: {
        adminId,
        action: 'RETURN_APPROVED_AND_REFUNDED',
        entity: 'Return',
        entityId: returnRecord.id,
        metadata: {
          returnNumber: returnRecord.returnNumber,
          refundAmount: Number(approvedRefund),
          restocked: restockItems,
        },
      },
    });

    return updatedReturn;
  });
}

// ----------------------------------------------------
// 6. EXCHANGE TRANSACTION
// ----------------------------------------------------

export interface ProcessExchangeParams {
  exchangeId: string;
  adminId: string;
  approve: boolean;
  notes?: string;
}

export async function processExchangeTransaction(
  params: ProcessExchangeParams,
  client: PrismaClient = defaultPrisma
) {
  const { exchangeId, adminId, approve, notes } = params;

  return await client.$transaction(async (tx) => {
    const exchange = await tx.exchange.findUnique({
      where: { id: exchangeId },
      include: {
        originalVariant: { include: { inventory: true } },
        replacementVariant: { include: { inventory: true } },
        order: true,
      },
    });

    if (!exchange) {
      throw new Error(`Exchange request ${exchangeId} not found.`);
    }

    if (exchange.status !== ExchangeStatus.PENDING) {
      throw new Error(`Exchange ${exchange.exchangeNumber} has already been processed.`);
    }

    if (!approve) {
      return await tx.exchange.update({
        where: { id: exchangeId },
        data: {
          status: ExchangeStatus.REJECTED,
          reason: notes || 'Exchange rejected by administrator',
        },
      });
    }

    // Check replacement stock
    const replInventory = exchange.replacementVariant.inventory;
    if (!replInventory || replInventory.availableQuantity < exchange.quantity) {
      throw new Error(
        `Insufficient inventory for replacement item (SKU ${exchange.replacementVariant.sku}). Available: ${replInventory?.availableQuantity || 0}`
      );
    }

    // 1. Restock original variant
    if (exchange.originalVariant.inventory) {
      const origInv = exchange.originalVariant.inventory;
      const prevOrig = origInv.availableQuantity;
      const nextOrig = prevOrig + exchange.quantity;

      await tx.inventory.update({
        where: { id: origInv.id },
        data: {
          availableQuantity: nextOrig,
          returnedQuantity: origInv.returnedQuantity + exchange.quantity,
          totalQuantity: origInv.totalQuantity + exchange.quantity,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          variantId: exchange.originalVariantId,
          transactionType: InventoryTransactionType.EXCHANGE_IN,
          quantityChange: exchange.quantity,
          previousAvailable: prevOrig,
          newAvailable: nextOrig,
          referenceType: 'EXCHANGE',
          referenceId: exchange.id,
          notes: `Original jersey received for exchange (${exchange.exchangeNumber})`,
          performedById: adminId,
        },
      });
    }

    // 2. Deduct replacement variant
    const prevRepl = replInventory.availableQuantity;
    const nextRepl = prevRepl - exchange.quantity;

    await tx.inventory.update({
      where: { id: replInventory.id },
      data: {
        availableQuantity: nextRepl,
        soldQuantity: replInventory.soldQuantity + exchange.quantity,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        variantId: exchange.replacementVariantId,
        transactionType: InventoryTransactionType.EXCHANGE_OUT,
        quantityChange: -exchange.quantity,
        previousAvailable: prevRepl,
        newAvailable: nextRepl,
        referenceType: 'EXCHANGE',
        referenceId: exchange.id,
        notes: `Replacement jersey dispatched for exchange (${exchange.exchangeNumber})`,
        performedById: adminId,
      },
    });

    // 3. Record price difference financial transaction if applicable
    if (exchange.priceDifference.gt(0)) {
      // Customer paid extra
      const ctxNum = `CTX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await tx.cashTransaction.create({
        data: {
          transactionNumber: ctxNum,
          type: CashTransactionType.DEBIT,
          category: CashTransactionCategory.SALES_REVENUE,
          amount: exchange.priceDifference,
          accountName: 'bKash Merchant',
          description: `Price difference received for Exchange ${exchange.exchangeNumber}`,
          referenceType: 'EXCHANGE',
          referenceId: exchange.id,
          recordedByAdminId: adminId,
        },
      });
    } else if (exchange.priceDifference.lt(0)) {
      // Store refunded difference
      const ctxNum = `CTX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      await tx.cashTransaction.create({
        data: {
          transactionNumber: ctxNum,
          type: CashTransactionType.CREDIT,
          category: CashTransactionCategory.RETURN_REFUND,
          amount: exchange.priceDifference.abs(),
          accountName: 'bKash Merchant',
          description: `Price difference refunded for Exchange ${exchange.exchangeNumber}`,
          referenceType: 'EXCHANGE',
          referenceId: exchange.id,
          recordedByAdminId: adminId,
        },
      });
    }

    // 4. Update exchange status
    const updatedExchange = await tx.exchange.update({
      where: { id: exchangeId },
      data: {
        status: ExchangeStatus.APPROVED,
      },
    });

    // 5. Activity log
    await tx.activityLog.create({
      data: {
        adminId,
        action: 'EXCHANGE_APPROVED',
        entity: 'Exchange',
        entityId: exchange.id,
        metadata: {
          exchangeNumber: exchange.exchangeNumber,
          originalSku: exchange.originalVariant.sku,
          replacementSku: exchange.replacementVariant.sku,
        },
      },
    });

    return updatedExchange;
  });
}

// ----------------------------------------------------
// 7. FINANCIAL OPERATIONS (Cashflow, Expense, Loan, Investment)
// ----------------------------------------------------

export interface RecordFinancialParams {
  type: CashTransactionType;
  category: CashTransactionCategory;
  amount: number | Prisma.Decimal;
  accountName: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  adminId: string;
  expenseId?: string;
  investmentId?: string;
  withdrawalId?: string;
  loanId?: string;
  loanRepaymentId?: string;
}

export async function recordFinancialOperationTransaction(
  params: RecordFinancialParams,
  client: PrismaClient = defaultPrisma
) {
  const {
    type,
    category,
    amount,
    accountName,
    description,
    referenceType,
    referenceId,
    adminId,
    expenseId,
    investmentId,
    withdrawalId,
    loanId,
    loanRepaymentId,
  } = params;

  return await client.$transaction(async (tx) => {
    const decAmount = new Prisma.Decimal(amount.toString());
    const txNumber = `CTX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const cashTx = await tx.cashTransaction.create({
      data: {
        transactionNumber: txNumber,
        type,
        category,
        amount: decAmount,
        accountName,
        description,
        referenceType,
        referenceId,
        recordedByAdminId: adminId,
        expenseId,
        investmentId,
        withdrawalId,
        loanId,
        loanRepaymentId,
      },
    });

    // If linked to Loan Repayment, update loan balance
    if (loanRepaymentId && loanId) {
      await tx.loan.update({
        where: { id: loanId },
        data: {
          amountRepaid: { increment: decAmount },
        },
      });
    }

    // Activity Log
    await tx.activityLog.create({
      data: {
        adminId,
        action: 'FINANCIAL_TRANSACTION_RECORDED',
        entity: 'CashTransaction',
        entityId: cashTx.id,
        metadata: {
          transactionNumber: txNumber,
          type,
          category,
          amount: Number(decAmount),
          accountName,
        },
      },
    });

    return cashTx;
  });
}
