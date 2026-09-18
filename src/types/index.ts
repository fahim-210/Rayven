/**
 * RAYVEN - Football Jerseys & Premium Athletic Brand
 * Global TypeScript definitions & Domain Interfaces
 */

// ----------------------------------------------------
// USER & AUTH TYPES
// ----------------------------------------------------

export type UserRole = 'CUSTOMER' | 'CASHIER' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  createdAt: string;
  adminProfile?: {
    employeeId?: string;
    department?: string;
    accessLevel?: string;
    twoFactorEnabled?: boolean;
    lastLoginIp?: string;
  };
  customerProfile?: {
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
      country?: string;
    };
    loyaltyTier?: string;
    points?: number;
  };
}

export interface UserAddress {
  id: string;
  userId: string;
  isDefault: boolean;
  label: 'Home' | 'Work' | 'Billing';
  recipientName: string;
  street1: string;
  street2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// ----------------------------------------------------
// E-COMMERCE CATALOG TYPES
// ----------------------------------------------------

export type KitType = 'Home' | 'Away' | 'Third' | 'Goalkeeper' | 'Retro' | 'Training';
export type JerseySize = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | 'XXL' | '3XL';

export interface Club {
  id: string;
  slug: string;
  name: string;
  shortCode: string;
  league: string;
  country: string;
  crestUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  size: JerseySize;
  color?: string;
  priceOverride?: number;
  stockQuantity: number;
  barcode?: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  title: string;
  subtitle?: string;
  description: string;
  details?: string;
  categoryId: string;
  categoryName?: string;
  clubId?: string;
  clubName?: string;
  season?: string;
  kitType?: KitType;
  jerseyType?: 'Player Version' | 'Fan Version' | 'Retro Classic' | 'Training Edition' | string;
  stockStatus?: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Pre-Order' | 'Limited Drop';
  basePrice: number;
  comparePrice?: number;
  costPrice: number; // ERP internal cost
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isActive?: boolean;
  rating?: number;
  reviewsCount?: number;
  totalSold?: number;
  isArchived?: boolean;
  material?: string;
  allowCustomization?: boolean;
  customizationOptions?: {
    defaultPrice?: number;
    popularPlayers?: { name: string; number: string; position?: string }[];
  };
  sizeChart?: SizeGuideData | string;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export interface SizeMeasurement {
  size: JerseySize;
  chestCm: number;
  lengthCm: number;
  shoulderCm: number;
  recommendedHeightCm: string;
  chestInches: number;
  lengthInches: number;
  shoulderInches: number;
  recommendedHeightInches: string;
}

export interface SizeGuideData {
  id: string;
  jerseyType: 'Player Version' | 'Fan Version' | 'Retro Classic' | string;
  title: string;
  fitDescription: string;
  modelMeasurements?: string;
  measurements: SizeMeasurement[];
  updatedAt: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  productName: string;
  verified: boolean;
  avatarUrl?: string;
  fitFeedback?: string;
}

// ----------------------------------------------------
// CART & ORDERS
// ----------------------------------------------------

export interface CartItemCustomization {
  playerPrint?: string;
  playerName?: string;
  playerNumber?: string;
  badgePatch?: string;
}

export interface CartItem {
  id: string; // cart item UUID
  product: Product;
  variant: ProductVariant;
  quantity: number;
  customization?: CartItemCustomization;
}

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'IN_HUB'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'PENDING'
  | 'DISPATCHED'
  | 'IN_TRANSIT';

export type PaymentStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'UNPAID'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type ManualPaymentMethod = 'bKash' | 'Nagad' | 'Rocket';

export interface PaymentSubmission {
  id: string;
  orderId: string;
  method: ManualPaymentMethod;
  amountPaid: number;
  senderPhone: string;
  transactionId: string;
  paymentDateTime: string;
  screenshotUrl?: string;
  note?: string;
  status: PaymentStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface PaymentMethodConfig {
  id: ManualPaymentMethod;
  name: string;
  accountNumber: string;
  accountType: 'Merchant' | 'Personal' | 'Agent';
  isActive: boolean;
  instructions: string;
  qrCodeUrl?: string;
}

export interface CustomerNotification {
  id: string;
  userId?: string;
  orderId?: string;
  title: string;
  message: string;
  type:
    | 'order_placed'
    | 'payment_submitted'
    | 'payment_approved'
    | 'payment_rejected'
    | 'order_confirmed'
    | 'packed'
    | 'in_hub'
    | 'out_for_delivery'
    | 'delivered';
  isRead: boolean;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productTitle: string;
  productImage?: string;
  variantSku: string;
  variantSize: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  customBadge?: string;
  playerPrint?: string;
  playerName?: string;
  playerNumber?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail?: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  subtotal: number;
  shippingFee: number;
  taxFee: number;
  discountAmount: number;
  totalAmount: number;
  minimumAdvance: number;
  amountPaid: number;
  remainingDue: number;
  paymentOption?: 'ADVANCE_ONLY' | 'FULL_PAYMENT';
  currency: string;
  trackingNumber?: string;
  carrierName?: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: UserAddress;
  division?: string;
  district?: string;
  areaThana?: string;
  fullAddress?: string;
  deliveryInstructions?: string;
  paymentSubmissions?: PaymentSubmission[];
  activeSubmission?: PaymentSubmission;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

// ----------------------------------------------------
// ERP / INVENTORY / PROCUREMENT / FINANCIALS
// ----------------------------------------------------

export interface InventoryQuantitySnapshot {
  available: number;
  reserved: number;
  sold: number;
  returned: number;
  damaged: number;
  lost: number;
}

export type StockFlowType =
  | 'PURCHASE'
  | 'PURCHASE_RESTOCK'
  | 'ORDER_RESERVED'
  | 'ORDER_CANCELLED'
  | 'ORDER_DELIVERED'
  | 'RETURN_TO_AVAILABLE'
  | 'RETURN_TO_DAMAGED'
  | 'DAMAGE'
  | 'LOST'
  | 'MANUAL_ADJUSTMENT';

export interface InventoryItem {
  id: string;
  productId?: string;
  variantId: string;
  productTitle: string;
  sku: string;
  variantSku?: string;
  size: JerseySize;

  // Size-aware stock buckets
  available: number;
  reserved: number;
  sold: number;
  returned: number;
  damaged: number;
  lost: number;

  // Legacy compatibility helpers
  currentStock: number;
  availableQuantity?: number;
  reservedStock: number;
  reservedQuantity?: number;

  reorderPoint: number;
  safetyStock?: number;
  costPerUnit: number; // Buying Price
  sellingPrice?: number; // Retail Selling Price
  club?: string;
  warehouseLocation: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  updatedAt?: string;
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  productTitle: string;
  variantSku: string;
  size: JerseySize | string;
  type: StockFlowType;
  quantity: number;
  previousQuantity: InventoryQuantitySnapshot;
  newQuantity: InventoryQuantitySnapshot;
  reason: string;
  admin: string;
  timestamp: string;
  reference: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  paymentTerms?: string;
  activeOrdersCount: number;
  totalSpend: number;
  totalPaid?: number;
  supplierDue: number; // outstanding payable balance to supplier
  notes?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchaseItem {
  id?: string;
  productId: string;
  productTitle: string;
  sku?: string;
  variantSku?: string;
  size: JerseySize | string;
  quantity: number;
  buyingPrice: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'DRAFT' | 'ORDERED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';

  // Primary variant procurement fields
  productId?: string;
  productTitle?: string;
  size?: JerseySize | string;
  quantity?: number;
  buyingPrice?: number;

  totalCost: number;
  amountPaid: number;
  supplierDue: number;
  purchaseDate: string;
  orderedDate?: string;
  expectedDate?: string;
  expectedDeliveryDate?: string;
  notes?: string;
  createdBy: string;

  itemsCount: number;
  items: PurchaseItem[];
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchaseInput {
  supplierId: string;
  productId: string;
  size: JerseySize | string;
  quantity: number;
  buyingPrice: number;
  totalCost?: number;
  amountPaid: number;
  supplierDue?: number;
  purchaseDate: string;
  notes?: string;
  adminName?: string;
}

export interface CreateSupplierInput {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  email?: string;
  country?: string;
  paymentTerms?: string;
  adminName?: string;
}

export interface UpdateSupplierInput {
  name?: string;
  phone?: string;
  address?: string;
  notes?: string;
  email?: string;
  country?: string;
  paymentTerms?: string;
  isActive?: boolean;
  adminName?: string;
}

export interface CashbookEntry {
  id: string;
  entryNumber: string;
  type: 'DEBIT' | 'CREDIT';
  entryType?: 'INFLOW' | 'OUTFLOW';
  category: string;
  amount: number;
  account: string;
  description: string;
  recordedBy: string;
  entryDate: string;
  date?: string;
  timestamp?: string;
  referenceCode?: string;
  balance?: number;
  balanceAfter?: number;
  createdAt?: string;
}

export interface Expense {
  id: string;
  voucherNo: string;
  voucherNumber?: string;
  category: string;
  title: string;
  amount: number;
  expenseDate: string;
  date?: string;
  description?: string;
  paymentMethod: string;
  paidTo?: string;
  payee?: string;
  paidVia?: string;
  notes?: string;
  addedBy: string;
  status?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  createdAt?: string;
}

export interface CreateExpenseInput {
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  notes?: string;
  addedBy?: string;
}

export type InvestorType = 'OWNER' | 'EXTERNAL';

export interface Investment {
  id: string;
  investmentNumber: string;
  investor: string;
  investorName?: string;
  investorType: InvestorType;
  amount: number;
  date: string;
  fundingDate?: string;
  dateInvested?: string;
  notes?: string;
  equityShare?: number;
  sharePercentage?: number;
  roundType?: string;
  status: 'ACTIVE' | 'MATURED';
  addedBy?: string;
  createdAt?: string;
}

export interface CreateOwnerInvestmentInput {
  investor: string;
  amount: number;
  date: string;
  notes?: string;
  addedBy?: string;
}

export interface CreateExternalInvestmentInput {
  name: string;
  investmentAmount: number;
  sharePercentage: number;
  date: string;
  notes?: string;
  addedBy?: string;
}

export interface Withdrawal {
  id: string;
  withdrawalNumber: string;
  person: string;
  amount: number;
  date: string;
  reason: string;
  notes?: string;
  addedBy?: string;
  createdAt?: string;
}

export interface CreateWithdrawalInput {
  person: string;
  amount: number;
  date: string;
  reason: string;
  notes?: string;
  addedBy?: string;
}

export interface LoanRepayment {
  id: string;
  loanId: string;
  repaymentNumber: string;
  amount: number;
  date: string;
  notes?: string;
  recordedBy: string;
  referenceCode: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  loanNumber: string;
  lender: string;
  lenderName?: string;
  principal: number;
  principalAmount?: number;
  balanceRemaining?: number;
  interest?: number;
  interestRate?: number;
  termMonths?: number;
  amountRepaid: number;
  monthlyPayment?: number;
  status: 'ACTIVE' | 'PAID_OFF' | 'DEFAULTED';
  dueDate: string;
  startDate?: string;
  date?: string;
  notes?: string;
  repayments?: LoanRepayment[];
  addedBy?: string;
  createdAt?: string;
}

export interface CreateLoanInput {
  lender: string;
  amount: number;
  date: string;
  interest?: number;
  interestRate?: number;
  dueDate?: string;
  notes?: string;
  addedBy?: string;
}

export interface RepayLoanInput {
  loanId: string;
  amount: number;
  date: string;
  notes?: string;
  addedBy?: string;
}

export interface ReturnRequest {
  id: string;
  returnNumber: string;
  rmaNumber?: string;
  orderNumber: string;
  customerName: string;
  status: 'REQUESTED' | 'APPROVED' | 'INSPECTED' | 'REFUNDED' | 'REJECTED' | 'RESTOCKED' | 'DEFECTIVE';
  refundAmount: number;
  reason: string;
  requestedAt: string;
  productId?: string;
  variantSku?: string;
  variantSize?: string;
  quantity?: number;
  adminNotes?: string;
}

export interface ActivityLog {
  id: string;
  admin?: string;
  userName?: string;
  action: string;
  entity?: string; // e.g. 'Order', 'Payment', 'Stock', 'Expense', 'Product', 'Supplier', 'Loan', 'Investment', 'Settings', 'AdminUser'
  module?: string;
  recordId?: string;
  previousValue?: string | number | null;
  newValue?: string | number | null;
  timestamp: string;
  ipAddress?: string;
  relatedEntity?: string;
  details?: string;
}

export type AdminNotificationType =
  | 'new_order'
  | 'payment_verification'
  | 'low_stock'
  | 'return'
  | 'exchange'
  | 'important_activity'
  | 'activity';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  relatedId?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  severity?: 'info' | 'warning' | 'critical' | 'success';
}

export interface BusinessSettings {
  name: string;
  tagline: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: {
    hqAddress: string;
    warehouseAddress: string;
    city: string;
    country: string;
  };
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
  };
  paymentNumbers: {
    bkash: {
      number: string;
      type: 'Merchant' | 'Personal' | 'Agent';
      isActive: boolean;
      instructions: string;
    };
    nagad: {
      number: string;
      type: 'Merchant' | 'Personal' | 'Agent';
      isActive: boolean;
      instructions: string;
    };
    rocket: {
      number: string;
      type: 'Merchant' | 'Personal' | 'Agent';
      isActive: boolean;
      instructions: string;
    };
  };
  deliveryCharge: {
    insideDhaka: number;
    outsideDhaka: number;
    subDhaka: number;
    freeDeliveryThreshold: number;
  };
  policies: {
    returnPolicy: string;
    exchangePolicy: string;
    privacyPolicy: string;
    termsAndConditions: string;
  };
  orderSettings: {
    autoCancelUnpaidHours: number;
    advancePaymentRequired: boolean;
    minimumAdvanceAmount: number;
    enableDiscounts: boolean;
  };
}

export type ReportDateFilter =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'this_month'
  | 'previous_month'
  | 'custom';

export type ReportType =
  | 'sales'
  | 'profit'
  | 'expense'
  | 'inventory'
  | 'purchase'
  | 'order'
  | 'payment'
  | 'customer_due'
  | 'supplier_due'
  | 'investment'
  | 'loan';

export interface SoftDeletedItem {
  id: string;
  entityType:
    | 'product'
    | 'order'
    | 'supplier'
    | 'purchase'
    | 'expense'
    | 'Product'
    | 'Order'
    | 'Supplier'
    | 'Purchase'
    | 'Expense';
  recordId?: string;
  title: string;
  identifier: string; // SKU, Order#, Supplier Code, PO#, Voucher#
  deletedAt: string;
  deletedBy: string;
  originalData: any;
  financialImpact?: string;
  canPermanentlyDelete?: boolean;
}

// ----------------------------------------------------
// APPLICATION & ROUTER
// ----------------------------------------------------

export type AppRoute =
  // Public Storefront
  | '/'
  | '/shop'
  | '/clubs'
  | '/product/[slug]'
  | '/cart'
  | '/checkout'
  | '/payment/[orderId]'
  | '/about'
  | '/contact'
  // Customer Account
  | '/account'
  | '/orders'
  | '/orders/[id]'
  | '/wishlist'
  // Admin ERP
  | '/admin'
  | '/admin/products'
  | '/admin/inventory'
  | '/admin/purchases'
  | '/admin/suppliers'
  | '/admin/orders'
  | '/admin/returns'
  | '/admin/expenses'
  | '/admin/investments'
  | '/admin/cashbook'
  | '/admin/loans'
  | '/admin/reports'
  | '/admin/notifications'
  | '/admin/activity-logs'
  | '/admin/recycle-bin'
  | '/admin/business'
  | '/admin/backup'
  | '/admin/profile'
  | '/admin/users'
  // Design System Showcase
  | '/design-system';

export interface RouteMeta {
  path: AppRoute;
  title: string;
  section: 'customer' | 'account' | 'admin' | 'dev';
  description?: string;
  requiresAuth?: boolean;
  requiredRole?: UserRole[];
}
