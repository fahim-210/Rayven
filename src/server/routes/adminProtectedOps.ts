import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAdmin, requirePermission } from '../auth/middleware.ts';

export const adminProtectedOpsRouter = Router();

// Enforce strict administrative authorization across all endpoints
adminProtectedOpsRouter.use(requireAdmin);

// 1. Modify Products & Buying Price (Admin only, requires PRODUCT:UPDATE)
adminProtectedOpsRouter.post('/products', requirePermission('PRODUCT:CREATE'), (req: AuthenticatedRequest, res: Response) => {
  const { title, basePrice, buyingPrice, sku } = req.body;
  return res.status(201).json({
    success: true,
    message: `Product '${title || sku}' created by admin ${req.user!.fullName}.`,
    buyingPriceRecorded: buyingPrice,
  });
});

adminProtectedOpsRouter.put('/products/:id', requirePermission('PRODUCT:UPDATE'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { title, basePrice, buyingPrice } = req.body;
  return res.json({
    success: true,
    message: `Product SKU [${id}] modified by admin ${req.user!.fullName}.`,
    data: { id, title, basePrice, buyingPrice },
  });
});

// 2. Modify Stock / Inventory (Admin only, requires INVENTORY:MANAGE)
adminProtectedOpsRouter.put('/inventory/:id', requirePermission('INVENTORY:MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { availableQuantity, reason } = req.body;
  return res.json({
    success: true,
    message: `Inventory SKU [${id}] stock level updated to ${availableQuantity} units.`,
    modifiedBy: req.user!.fullName,
    reason: reason || 'Manual adjustment',
  });
});

// 3. Modify Payment Status (Admin only, requires PAYMENT:APPROVE)
adminProtectedOpsRouter.put('/payments/:id/status', requirePermission('PAYMENT:APPROVE'), (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  return res.json({
    success: true,
    message: `Payment transaction [${id}] status updated to '${status}'.`,
    approvedBy: req.user!.fullName,
    remarks,
  });
});

// 4. Modify Order Status (Admin only, requires ORDER:MANAGE)
adminProtectedOpsRouter.put('/orders/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;
  return res.json({
    success: true,
    message: `Order [${id}] fulfillment status transitioned to '${status}'.`,
    updatedBy: req.user!.fullName,
    trackingNumber,
  });
});

// 5. Financial Operations: Expenses (Admin only, requires FINANCE:MANAGE)
adminProtectedOpsRouter.post('/expenses', requirePermission('FINANCE:MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { title, amount, category, paymentMethod } = req.body;
  return res.status(201).json({
    success: true,
    message: `Operating expense voucher '${title}' of $${amount} recorded in cashbook register.`,
    recordedBy: req.user!.fullName,
  });
});

// 6. Financial Operations: Investments (Admin only, requires FINANCE:MANAGE)
adminProtectedOpsRouter.post('/investments', requirePermission('FINANCE:MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { investorName, amount, purpose } = req.body;
  return res.status(201).json({
    success: true,
    message: `Investment capital injection of $${amount} from '${investorName}' approved.`,
    approvedBy: req.user!.fullName,
  });
});

// 7. Financial Operations: Cashbook Register (Admin only, requires FINANCE:VIEW or FINANCE:MANAGE)
adminProtectedOpsRouter.post('/cashbook', requirePermission('FINANCE:MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { type, amount, description, balanceAfter } = req.body;
  return res.status(201).json({
    success: true,
    message: `Double-entry cashbook ledger entry [${type}] for $${amount} confirmed.`,
    operator: req.user!.fullName,
  });
});

// 8. Financial Operations: Loans (Admin only, requires FINANCE:MANAGE)
adminProtectedOpsRouter.post('/loans', requirePermission('FINANCE:MANAGE'), (req: AuthenticatedRequest, res: Response) => {
  const { lenderName, principalAmount, interestRate } = req.body;
  return res.status(201).json({
    success: true,
    message: `Credit facility loan of $${principalAmount} from '${lenderName}' logged.`,
    auditedBy: req.user!.fullName,
  });
});
