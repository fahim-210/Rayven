export {
  RoleType,
  OrderStatus,
  PaymentStatus,
  PaymentGateway,
  InventoryTransactionType,
  CashTransactionType,
  CashTransactionCategory,
  LoanStatus,
  ReturnStatus,
  ExchangeStatus,
} from '@prisma/client';

export type {
  User,
  Role,
  Permission,
  RolePermission,
  Customer,
  Admin,
  Category,
  Club,
  Season,
  Size,
  Product,
  ProductImage,
  ProductVariant,
  VariantPriceHistory,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Address,
  SavedAddress,
  Order,
  OrderItem,
  OrderStatusHistory,
  PaymentMethod,
  Payment,
  PaymentSubmission,
  PaymentStatusHistory,
  Inventory,
  InventoryTransaction,
  Supplier,
  Purchase,
  PurchaseItem,
  Return,
  ReturnItem,
  Exchange,
  Expense,
  Investment,
  Withdrawal,
  CashTransaction,
  Loan,
  LoanRepayment,
  Review,
  Notification,
  ActivityLog,
  RecycleBin,
  BusinessSettings,
  Prisma,
} from '@prisma/client';

// Composite & Rich View Types
export type ProductWithDetails = import('@prisma/client').Product & {
  category: import('@prisma/client').Category;
  club: import('@prisma/client').Club | null;
  season: import('@prisma/client').Season | null;
  images: import('@prisma/client').ProductImage[];
  variants: (import('@prisma/client').ProductVariant & {
    size: import('@prisma/client').Size;
    inventory: import('@prisma/client').Inventory | null;
  })[];
  reviews?: import('@prisma/client').Review[];
};

export type OrderWithDetails = import('@prisma/client').Order & {
  customer: (import('@prisma/client').Customer & {
    user: import('@prisma/client').User;
  }) | null;
  shippingAddress: import('@prisma/client').Address;
  billingAddress: import('@prisma/client').Address | null;
  items: (import('@prisma/client').OrderItem & {
    variant: import('@prisma/client').ProductVariant & {
      product: import('@prisma/client').Product;
      size: import('@prisma/client').Size;
    };
  })[];
  payments: (import('@prisma/client').Payment & {
    submissions: import('@prisma/client').PaymentSubmission[];
  })[];
  returns: import('@prisma/client').Return[];
  exchanges: import('@prisma/client').Exchange[];
};
