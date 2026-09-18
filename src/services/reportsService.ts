import { storeService } from './storeService.ts';
import {
  ReportType,
  ReportDateFilter,
  Order,
  InventoryItem,
  Expense,
  PurchaseOrder,
  Supplier,
  Investment,
  Loan,
  CashbookEntry,
} from '../types/index.ts';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

export function getDateRange(filter: ReportDateFilter, customStart?: string, customEnd?: string): DateRange {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (filter) {
    case 'today':
      return { startDate: todayStart, endDate: todayEnd, label: 'Today' };

    case 'yesterday': {
      const yStart = new Date(todayStart);
      yStart.setDate(yStart.getDate() - 1);
      const yEnd = new Date(todayEnd);
      yEnd.setDate(yEnd.getDate() - 1);
      return { startDate: yStart, endDate: yEnd, label: 'Yesterday' };
    }

    case 'last_7_days': {
      const s = new Date(todayStart);
      s.setDate(s.getDate() - 6);
      return { startDate: s, endDate: todayEnd, label: 'Last 7 Days' };
    }

    case 'this_month': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { startDate: s, endDate: todayEnd, label: 'This Month' };
    }

    case 'previous_month': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { startDate: s, endDate: e, label: 'Previous Month' };
    }

    case 'custom': {
      const s = customStart ? new Date(customStart) : new Date(todayStart.getTime() - 30 * 86400000);
      const e = customEnd ? new Date(`${customEnd}T23:59:59.999`) : todayEnd;
      return {
        startDate: isNaN(s.getTime()) ? todayStart : s,
        endDate: isNaN(e.getTime()) ? todayEnd : e,
        label: `${s.toISOString().slice(0, 10)} to ${e.toISOString().slice(0, 10)}`,
      };
    }

    default:
      return { startDate: todayStart, endDate: todayEnd, label: 'Today' };
  }
}

export function isDateInRange(dateStr: string | undefined, range: DateRange): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d >= range.startDate && d <= range.endDate;
}

export const reportsService = {
  // 1. Sales Report
  getSalesReport(filter: ReportDateFilter, customStart?: string, customEnd?: string) {
    const range = getDateRange(filter, customStart, customEnd);
    const allOrders = storeService.getOrders().filter((o) => !o.isDeleted);
    const filteredOrders = allOrders.filter((o) => isDateInRange(o.createdAt, range));

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const grossSales = filteredOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalDiscounts = filteredOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
    const deliveryRevenue = filteredOrders.reduce((sum, o) => sum + (o.shippingFee || 0), 0);
    const totalAmountCollected = filteredOrders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);
    const totalDue = filteredOrders.reduce((sum, o) => sum + (o.remainingDue || 0), 0);
    const ordersCount = filteredOrders.length;
    const aov = ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;

    let totalUnitsSold = 0;
    const productSalesMap: Record<string, { title: string; units: number; revenue: number; club: string }> = {};

    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        totalUnitsSold += item.quantity;
        const key = item.productTitle || item.variantSku;
        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            title: item.productTitle,
            units: 0,
            revenue: 0,
            club: 'Partner Club',
          };
        }
        productSalesMap[key].units += item.quantity;
        productSalesMap[key].revenue += item.subtotal;
      });
    });

    const topKits = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);

    // Group sales by date for charts
    const dailyMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    filteredOrders.forEach((o) => {
      const d = o.createdAt.slice(0, 10);
      if (!dailyMap[d]) {
        dailyMap[d] = { date: d, revenue: 0, orders: 0 };
      }
      dailyMap[d].revenue += o.totalAmount;
      dailyMap[d].orders += 1;
    });

    const trendData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    return {
      range,
      totalRevenue,
      grossSales,
      totalDiscounts,
      deliveryRevenue,
      totalAmountCollected,
      totalDue,
      ordersCount,
      aov,
      totalUnitsSold,
      topKits,
      trendData,
      orders: filteredOrders,
    };
  },

  // 2. Profit Report
  getProfitReport(filter: ReportDateFilter, customStart?: string, customEnd?: string) {
    const range = getDateRange(filter, customStart, customEnd);
    const allOrders = storeService.getOrders().filter((o) => !o.isDeleted && o.status !== 'CANCELLED');
    const filteredOrders = allOrders.filter((o) => isDateInRange(o.createdAt, range));
    const products = storeService.getProducts();

    // Cost price map by product SKU or ID
    const costMap: Record<string, number> = {};
    products.forEach((p) => {
      costMap[p.id] = p.costPrice || Math.round(p.basePrice * 0.45);
      costMap[p.title] = p.costPrice || Math.round(p.basePrice * 0.45);
    });

    let totalRevenue = 0;
    let totalCogs = 0;
    let totalUnits = 0;

    const kitProfitMap: Record<
      string,
      { title: string; units: number; revenue: number; cost: number; grossProfit: number; marginPct: number }
    > = {};

    filteredOrders.forEach((o) => {
      totalRevenue += o.totalAmount;
      o.items.forEach((item) => {
        totalUnits += item.quantity;
        const unitCost = costMap[item.productTitle] || 600;
        const lineCost = unitCost * item.quantity;
        totalCogs += lineCost;

        const key = item.productTitle;
        if (!kitProfitMap[key]) {
          kitProfitMap[key] = {
            title: item.productTitle,
            units: 0,
            revenue: 0,
            cost: 0,
            grossProfit: 0,
            marginPct: 0,
          };
        }
        kitProfitMap[key].units += item.quantity;
        kitProfitMap[key].revenue += item.subtotal;
        kitProfitMap[key].cost += lineCost;
      });
    });

    Object.values(kitProfitMap).forEach((kp) => {
      kp.grossProfit = kp.revenue - kp.cost;
      kp.marginPct = kp.revenue > 0 ? Math.round((kp.grossProfit / kp.revenue) * 100) : 0;
    });

    const grossProfit = totalRevenue - totalCogs;
    const grossMarginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

    // Expenses in range
    const allExpenses = storeService.getExpenses().filter((e) => !e.isDeleted);
    const filteredExpenses = allExpenses.filter((e) => isDateInRange(e.expenseDate || e.date, range));
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    const netProfit = grossProfit - totalExpenses;
    const netMarginPct = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

    return {
      range,
      totalRevenue,
      totalCogs,
      grossProfit,
      grossMarginPct,
      totalExpenses,
      netProfit,
      netMarginPct,
      totalUnits,
      kitProfits: Object.values(kitProfitMap).sort((a, b) => b.grossProfit - a.grossProfit),
      expenses: filteredExpenses,
    };
  },

  // 3. Expense Report
  getExpenseReport(filter: ReportDateFilter, customStart?: string, customEnd?: string) {
    const range = getDateRange(filter, customStart, customEnd);
    const allExpenses = storeService.getExpenses().filter((e) => !e.isDeleted);
    const filtered = allExpenses.filter((e) => isDateInRange(e.expenseDate || e.date, range));

    const totalExpense = filtered.reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown
    const categoryMap: Record<string, { category: string; amount: number; count: number }> = {};
    filtered.forEach((e) => {
      const cat = e.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, amount: 0, count: 0 };
      }
      categoryMap[cat].amount += e.amount;
      categoryMap[cat].count += 1;
    });

    // Payment method breakdown
    const methodMap: Record<string, number> = {};
    filtered.forEach((e) => {
      const m = e.paymentMethod || 'Cash';
      methodMap[m] = (methodMap[m] || 0) + e.amount;
    });

    const categories = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
    const paymentMethods = Object.entries(methodMap).map(([method, amount]) => ({ method, amount }));

    return {
      range,
      totalExpense,
      voucherCount: filtered.length,
      categories,
      paymentMethods,
      expenses: filtered,
    };
  },

  // 4. Inventory Report
  getInventoryReport() {
    const inventory = storeService.getInventory();
    const products = storeService.getProducts().filter((p) => !p.isDeleted);

    const totalSkus = inventory.length;
    const totalAvailable = inventory.reduce((sum, i) => sum + (i.available ?? i.availableQuantity ?? 0), 0);
    const totalReserved = inventory.reduce((sum, i) => sum + (i.reserved ?? i.reservedStock ?? 0), 0);
    const totalSold = inventory.reduce((sum, i) => sum + (i.sold ?? 0), 0);
    const totalDamaged = inventory.reduce((sum, i) => sum + (i.damaged ?? 0), 0);
    const totalLost = inventory.reduce((sum, i) => sum + (i.lost ?? 0), 0);

    // Asset valuation
    const stockValuationCost = inventory.reduce((sum, i) => {
      const qty = i.available ?? 0;
      const cost = i.costPerUnit || 600;
      return sum + qty * cost;
    }, 0);

    const stockPotentialRetail = inventory.reduce((sum, i) => {
      const qty = i.available ?? 0;
      const price = i.sellingPrice || 1400;
      return sum + qty * price;
    }, 0);

    const lowStockItems = inventory.filter(
      (i) => (i.available ?? 0) <= (i.safetyStock ?? i.reorderPoint ?? 10) && (i.available ?? 0) > 0
    );
    const outOfStockItems = inventory.filter((i) => (i.available ?? 0) <= 0);

    return {
      totalSkus,
      totalAvailable,
      totalReserved,
      totalSold,
      totalDamaged,
      totalLost,
      stockValuationCost,
      stockPotentialRetail,
      potentialGrossMargin: stockPotentialRetail - stockValuationCost,
      lowStockCount: lowStockItems.length,
      outOfStockCount: outOfStockItems.length,
      lowStockItems,
      outOfStockItems,
      inventory,
    };
  },

  // 5. Purchase Report
  getPurchaseReport(filter: ReportDateFilter, customStart?: string, customEnd?: string) {
    const range = getDateRange(filter, customStart, customEnd);
    const allPurchases = storeService.getPurchases().filter((p) => !p.isDeleted);
    const filtered = allPurchases.filter((p) => isDateInRange(p.purchaseDate || p.orderedDate, range));

    const totalSpend = filtered.reduce((sum, p) => sum + p.totalCost, 0);
    const totalPaid = filtered.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalDue = filtered.reduce((sum, p) => sum + p.supplierDue, 0);
    const totalPOs = filtered.length;

    // Supplier spend breakdown
    const supplierMap: Record<string, { supplierName: string; poCount: number; spend: number; due: number }> = {};
    filtered.forEach((p) => {
      const s = p.supplierName || 'Unknown Supplier';
      if (!supplierMap[s]) {
        supplierMap[s] = { supplierName: s, poCount: 0, spend: 0, due: 0 };
      }
      supplierMap[s].poCount += 1;
      supplierMap[s].spend += p.totalCost;
      supplierMap[s].due += p.supplierDue;
    });

    return {
      range,
      totalSpend,
      totalPaid,
      totalDue,
      totalPOs,
      supplierBreakdown: Object.values(supplierMap).sort((a, b) => b.spend - a.spend),
      purchases: filtered,
    };
  },

  // 6. Order Report
  getOrderReport(filter: ReportDateFilter, customStart?: string, customEnd?: string) {
    const range = getDateRange(filter, customStart, customEnd);
    const allOrders = storeService.getOrders().filter((o) => !o.isDeleted);
    const filtered = allOrders.filter((o) => isDateInRange(o.createdAt, range));

    const totalOrders = filtered.length;
    const statusCounts: Record<string, number> = {
      PENDING_PAYMENT: 0,
      PAYMENT_SUBMITTED: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      PACKED: 0,
      IN_HUB: 0,
      OUT_FOR_DELIVERY: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    };

    filtered.forEach((o) => {
      const st = o.status || 'PENDING_PAYMENT';
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    });

    // Division breakdown
    const divisionMap: Record<string, number> = {};
    filtered.forEach((o) => {
      const div = o.division || o.district || 'Dhaka';
      divisionMap[div] = (divisionMap[div] || 0) + 1;
    });

    const divisionStats = Object.entries(divisionMap).map(([division, count]) => ({ division, count }));

    return {
      range,
      totalOrders,
      statusCounts,
      divisionStats,
      orders: filtered,
    };
  },

  // 7. Payment Report
  getPaymentReport(filter: ReportDateFilter, customStart?: string, customEnd?: string) {
    const range = getDateRange(filter, customStart, customEnd);
    const allOrders = storeService.getOrders().filter((o) => !o.isDeleted);
    const filteredOrders = allOrders.filter((o) => isDateInRange(o.createdAt, range));

    let totalCollected = 0;
    let advanceTotal = 0;
    let fullPaymentTotal = 0;
    const methodBreakdown: Record<string, { count: number; amount: number }> = {
      bKash: { count: 0, amount: 0 },
      Nagad: { count: 0, amount: 0 },
      Rocket: { count: 0, amount: 0 },
      Cash: { count: 0, amount: 0 },
    };

    let approvedCount = 0;
    let rejectedCount = 0;
    let reviewCount = 0;

    const allSubmissions: Array<{
      orderNumber: string;
      customerName: string;
      method: string;
      amount: number;
      trxId: string;
      phone: string;
      status: string;
      date: string;
    }> = [];

    filteredOrders.forEach((o) => {
      totalCollected += o.amountPaid || 0;
      if (o.paymentOption === 'FULL_PAYMENT') {
        fullPaymentTotal += o.amountPaid || 0;
      } else {
        advanceTotal += o.amountPaid || 0;
      }

      (o.paymentSubmissions || []).forEach((s) => {
        const m = s.method || 'bKash';
        if (!methodBreakdown[m]) {
          methodBreakdown[m] = { count: 0, amount: 0 };
        }
        methodBreakdown[m].count += 1;
        methodBreakdown[m].amount += s.amountPaid;

        if (s.status === 'APPROVED') approvedCount++;
        else if (s.status === 'REJECTED') rejectedCount++;
        else reviewCount++;

        allSubmissions.push({
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          method: s.method,
          amount: s.amountPaid,
          trxId: s.transactionId,
          phone: s.senderPhone,
          status: s.status,
          date: s.submittedAt || o.createdAt,
        });
      });
    });

    const totalSubmissions = approvedCount + rejectedCount + reviewCount;
    const approvalRate = totalSubmissions > 0 ? Math.round((approvedCount / totalSubmissions) * 100) : 100;

    return {
      range,
      totalCollected,
      advanceTotal,
      fullPaymentTotal,
      methodBreakdown,
      approvedCount,
      rejectedCount,
      reviewCount,
      approvalRate,
      submissions: allSubmissions,
    };
  },

  // 8. Customer Due Report
  getCustomerDueReport() {
    const orders = storeService.getOrders().filter((o) => !o.isDeleted && o.status !== 'CANCELLED');
    const dueOrders = orders.filter((o) => (o.remainingDue || 0) > 0);

    const totalDue = dueOrders.reduce((sum, o) => sum + o.remainingDue, 0);
    const totalOrdersWithDue = dueOrders.length;

    // Division breakdown
    const divisionDueMap: Record<string, { count: number; totalDue: number }> = {};
    dueOrders.forEach((o) => {
      const div = o.division || o.district || 'Dhaka';
      if (!divisionDueMap[div]) {
        divisionDueMap[div] = { count: 0, totalDue: 0 };
      }
      divisionDueMap[div].count += 1;
      divisionDueMap[div].totalDue += o.remainingDue;
    });

    return {
      totalDue,
      totalOrdersWithDue,
      divisionDueBreakdown: Object.entries(divisionDueMap).map(([division, data]) => ({ division, ...data })),
      dueOrders: dueOrders.sort((a, b) => b.remainingDue - a.remainingDue),
    };
  },

  // 9. Supplier Due Report
  getSupplierDueReport() {
    const suppliers = storeService.getSuppliers().filter((s) => !s.isDeleted);
    const dueSuppliers = suppliers.filter((s) => (s.supplierDue || 0) > 0);

    const totalSupplierDue = suppliers.reduce((sum, s) => sum + (s.supplierDue || 0), 0);
    const totalSpend = suppliers.reduce((sum, s) => sum + (s.totalSpend || 0), 0);
    const totalPaid = suppliers.reduce((sum, s) => sum + (s.totalPaid || Math.max(0, s.totalSpend - s.supplierDue)), 0);

    return {
      totalSupplierDue,
      totalSpend,
      totalPaid,
      suppliersWithDueCount: dueSuppliers.length,
      suppliers: dueSuppliers.sort((a, b) => b.supplierDue - a.supplierDue),
      allSuppliers: suppliers,
    };
  },

  // 10. Investment Report
  getInvestmentReport() {
    const investments = storeService.getInvestments();
    const withdrawals = storeService.getWithdrawals();

    const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
    const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const netRetainedCapital = totalInvested - totalWithdrawals;

    // Founders vs External
    const ownerInvestments = investments.filter((i) => i.investorType === 'OWNER');
    const externalInvestments = investments.filter((i) => i.investorType === 'EXTERNAL');

    const totalOwnerCapital = ownerInvestments.reduce((sum, i) => sum + i.amount, 0);
    const totalExternalCapital = externalInvestments.reduce((sum, i) => sum + i.amount, 0);

    // Individual breakdown
    const investorMap: Record<string, { investor: string; type: string; total: number; equityPct: number; notes: string }> = {};
    investments.forEach((i) => {
      const name = i.investor || i.investorName || 'Investor';
      if (!investorMap[name]) {
        investorMap[name] = {
          investor: name,
          type: i.investorType,
          total: 0,
          equityPct: i.sharePercentage || i.equityShare || 0,
          notes: i.notes || '',
        };
      }
      investorMap[name].total += i.amount;
    });

    return {
      totalInvested,
      totalWithdrawals,
      netRetainedCapital,
      totalOwnerCapital,
      totalExternalCapital,
      investors: Object.values(investorMap),
      investments,
      withdrawals,
    };
  },

  // 11. Loan Report
  getLoanReport() {
    const loans = storeService.getLoans();
    const totalBorrowed = loans.reduce((sum, l) => sum + l.principal, 0);
    const totalRepaid = loans.reduce((sum, l) => sum + l.amountRepaid, 0);
    const activeLoans = loans.filter((l) => l.status === 'ACTIVE');
    const totalOutstanding = activeLoans.reduce(
      (sum, l) => sum + (l.balanceRemaining ?? Math.max(0, l.principal - l.amountRepaid)),
      0
    );

    return {
      totalBorrowed,
      totalRepaid,
      totalOutstanding,
      activeLoansCount: activeLoans.length,
      closedLoansCount: loans.filter((l) => l.status === 'PAID_OFF').length,
      loans,
    };
  },
};
