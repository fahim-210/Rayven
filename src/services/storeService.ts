import {
  INITIAL_PRODUCTS,
  INITIAL_CLUBS,
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_SUPPLIERS,
  INITIAL_PURCHASES,
  INITIAL_CASHBOOK,
  INITIAL_EXPENSES,
  INITIAL_LOANS,
  INITIAL_INVESTMENTS,
  INITIAL_WITHDRAWALS,
  INITIAL_RETURNS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_INVENTORY_TRANSACTIONS,
} from '../data/mockData.ts';
import { MOCK_PRODUCTS, MOCK_CLUBS, MOCK_REVIEWS } from '../data/mockStoreData.ts';
import { DEFAULT_PAYMENT_CONFIGS } from '../data/paymentSettingsData.ts';
import { getDeliveryChargeForDivision } from '../data/bangladeshGeoData.ts';
import {
  Product,
  Club,
  Category,
  Order,
  OrderItem,
  InventoryItem,
  Supplier,
  PurchaseOrder,
  CashbookEntry,
  Expense,
  Loan,
  Investment,
  Withdrawal,
  ReturnRequest,
  ActivityLog,
  CustomerReview,
  PaymentMethodConfig,
  PaymentSubmission,
  CustomerNotification,
  OrderStatus,
  PaymentStatus,
  ManualPaymentMethod,
  InventoryTransaction,
  StockFlowType,
  InventoryQuantitySnapshot,
  JerseySize,
  CreatePurchaseInput,
  CreateSupplierInput,
  UpdateSupplierInput,
  PurchaseItem,
  CreateExpenseInput,
  CreateOwnerInvestmentInput,
  CreateExternalInvestmentInput,
  CreateWithdrawalInput,
  CreateLoanInput,
  RepayLoanInput,
  LoanRepayment,
  InvestorType,
  BusinessSettings,
  AdminNotification,
  SoftDeletedItem,
} from '../types/index.ts';

export const BUSINESS_OWNERS = [
  'Alex Mercer',
  'Tarek Rahman',
  'Fahim Shahriar',
] as const;

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  name: 'RAYVEN',
  tagline: 'Technical Matchwear & Elite Football Apparel',
  logoUrl: '',
  contactEmail: 'contact@rayven-football.com',
  contactPhone: '+880 1712-345678',
  whatsappNumber: '+880 1712-345678',
  address: {
    hqAddress: 'House 42, Road 11, Block D, Banani',
    warehouseAddress: 'Plot 18, Sector 3, Uttara Export Zone',
    city: 'Dhaka',
    country: 'Bangladesh',
  },
  socialMedia: {
    facebook: 'https://facebook.com/rayven.football',
    instagram: 'https://instagram.com/rayven.football',
    twitter: 'https://twitter.com/rayven_football',
    youtube: 'https://youtube.com/@rayvenfootball',
  },
  paymentNumbers: {
    bkash: {
      number: '01712-345678',
      type: 'Personal',
      isActive: true,
      instructions:
        'Open bKash app or dial *247#. Select "Send Money". Send to RAYVEN wallet 01712-345678. Enter order number in reference. Copy TrxID and submit.',
    },
    nagad: {
      number: '01812-345678',
      type: 'Personal',
      isActive: true,
      instructions:
        'Open Nagad app or dial *167#. Select "Send Money". Send to RAYVEN account 01812-345678. Copy Nagad TrxID and submit.',
    },
    rocket: {
      number: '01912-345678-9',
      type: 'Personal',
      isActive: true,
      instructions:
        'Open DBBL Rocket app. Send Money to 12-digit account 01912-345678-9. Copy transaction code and submit below.',
    },
  },
  deliveryCharge: {
    insideDhaka: 70,
    outsideDhaka: 130,
    subDhaka: 100,
    freeDeliveryThreshold: 4000,
  },
  policies: {
    returnPolicy:
      '7-day hassle-free returns on unworn items with original tags and packaging intact. Custom player-printed jerseys cannot be returned unless manufacturing defect.',
    exchangePolicy: 'Size exchanges supported within 5 days of delivery subject to warehouse stock availability.',
    privacyPolicy: 'We strictly protect customer phone numbers, delivery addresses, and payment references with encryption.',
    termsAndConditions:
      'All orders confirmed after advance verification are dispatched within 24-48 hours via premium tracked courier.',
  },
  orderSettings: {
    autoCancelUnpaidHours: 48,
    advancePaymentRequired: true,
    minimumAdvanceAmount: 120,
    enableDiscounts: true,
  },
};

export interface OrderValidationInput {
  items: {
    productId: string;
    variantId: string;
    quantity: number;
    customization?: {
      playerName?: string;
      playerNumber?: string;
      playerPrint?: string;
      badgePatch?: string;
    };
  }[];
  delivery: {
    division?: string;
    district?: string;
    areaThana?: string;
    fullAddress: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryInstructions?: string;
  };
  paymentOption: 'ADVANCE_ONLY' | 'FULL_PAYMENT';
  couponCode?: string;
}

export interface CalculatedOrderSummary {
  isValid: boolean;
  errors: string[];
  productTotal: number;
  deliveryCharge: number;
  discount: number;
  totalOrderAmount: number;
  minimumAdvance: number;
  payNow: number;
  remainingDue: number;
  verifiedItems: OrderItem[];
}

const STORAGE_ORDERS_KEY = 'rayven_orders_v2';
const STORAGE_PAYMENT_SETTINGS_KEY = 'rayven_payment_settings_v2';
const STORAGE_NOTIFICATIONS_KEY = 'rayven_notifications_v2';
const STORAGE_PRODUCTS_KEY = 'rayven_products_v2';
const STORAGE_INVENTORY_KEY = 'rayven_inventory_v2';
const STORAGE_INVENTORY_TRANSACTIONS_KEY = 'rayven_inventory_transactions_v2';
const STORAGE_SUPPLIERS_KEY = 'rayven_suppliers_v2';
const STORAGE_PURCHASES_KEY = 'rayven_purchases_v2';
const STORAGE_CASHBOOK_KEY = 'rayven_cashbook_v2';
const STORAGE_EXPENSES_KEY = 'rayven_expenses_v2';
const STORAGE_LOANS_KEY = 'rayven_loans_v2';
const STORAGE_INVESTMENTS_KEY = 'rayven_investments_v2';
const STORAGE_WITHDRAWALS_KEY = 'rayven_withdrawals_v2';
const STORAGE_LOGS_KEY = 'rayven_activity_logs_v2';
const STORAGE_BUSINESS_SETTINGS_KEY = 'rayven_business_settings_v2';
const STORAGE_ADMIN_NOTIFICATIONS_KEY = 'rayven_admin_notifications_v2';
const STORAGE_RECYCLE_BIN_KEY = 'rayven_recycle_bin_v2';

class StoreService {
  private products: Product[] = this.loadInitialProducts();
  private clubs: Club[] = [
    ...MOCK_CLUBS,
    ...INITIAL_CLUBS.filter((ic) => !MOCK_CLUBS.some((mc) => mc.id === ic.id)),
  ];
  private categories: Category[] = [...INITIAL_CATEGORIES];
  private orders: Order[] = this.loadInitialOrders();
  private inventory: InventoryItem[] = this.loadInitialInventory();
  private inventoryTransactions: InventoryTransaction[] = this.loadInitialTransactions();
  private suppliers: Supplier[] = this.loadInitialSuppliers();
  private purchases: PurchaseOrder[] = this.loadInitialPurchases();
  private cashbook: CashbookEntry[] = this.loadInitialCashbook();
  private expenses: Expense[] = this.loadInitialExpenses();
  private loans: Loan[] = this.loadInitialLoans();
  private investments: Investment[] = this.loadInitialInvestments();
  private withdrawals: Withdrawal[] = this.loadInitialWithdrawals();
  private returns: ReturnRequest[] = [...INITIAL_RETURNS];
  private logs: ActivityLog[] = this.loadInitialLogs();
  private reviews: CustomerReview[] = [...MOCK_REVIEWS];
  private businessSettings: BusinessSettings = this.loadInitialBusinessSettings();
  private paymentConfigs: PaymentMethodConfig[] = this.loadPaymentConfigs();
  private notifications: CustomerNotification[] = this.loadInitialNotifications();
  private adminNotifications: AdminNotification[] = this.loadInitialAdminNotifications();
  private recycleBin: SoftDeletedItem[] = this.loadInitialRecycleBin();

  private loadInitialProducts(): Product[] {
    try {
      const stored = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [
      ...MOCK_PRODUCTS,
      ...INITIAL_PRODUCTS.filter((ip) => !MOCK_PRODUCTS.some((mp) => mp.id === ip.id)),
    ].map((p) => ({
      ...p,
      isActive: p.isActive ?? true,
      costPrice: p.costPrice ?? (p.basePrice ? Math.round(p.basePrice * 0.45) : 500),
    }));
  }

  saveProducts(): void {
    try {
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(this.products));
    } catch {
      // Ignore
    }
  }

  private loadInitialInventory(): InventoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_INVENTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...INITIAL_INVENTORY];
  }

  saveInventory(): void {
    try {
      localStorage.setItem(STORAGE_INVENTORY_KEY, JSON.stringify(this.inventory));
    } catch {
      // Ignore
    }
  }

  private loadInitialTransactions(): InventoryTransaction[] {
    try {
      const stored = localStorage.getItem(STORAGE_INVENTORY_TRANSACTIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...INITIAL_INVENTORY_TRANSACTIONS];
  }

  saveTransactions(): void {
    try {
      localStorage.setItem(STORAGE_INVENTORY_TRANSACTIONS_KEY, JSON.stringify(this.inventoryTransactions));
    } catch {
      // Ignore
    }
  }

  private loadInitialOrders(): Order[] {
    try {
      const stored = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...INITIAL_ORDERS];
  }

  private saveOrders(): void {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.orders));
    } catch {
      // Ignore
    }
  }

  private loadPaymentConfigs(): PaymentMethodConfig[] {
    try {
      const stored = localStorage.getItem(STORAGE_PAYMENT_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...DEFAULT_PAYMENT_CONFIGS];
  }

  private savePaymentConfigs(): void {
    try {
      localStorage.setItem(STORAGE_PAYMENT_SETTINGS_KEY, JSON.stringify(this.paymentConfigs));
    } catch {
      // Ignore
    }
  }

  private loadInitialNotifications(): CustomerNotification[] {
    try {
      const stored = localStorage.getItem(STORAGE_NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [
      {
        id: 'notif_01',
        orderId: 'ord_01',
        title: 'Order Confirmed & Packed',
        message: 'Your order RYV-849102-1049 advance payment of ৳70 was approved and packed for dispatch.',
        type: 'packed',
        isRead: false,
        createdAt: '2026-09-14T11:15:00Z',
      },
      {
        id: 'notif_02',
        orderId: 'ord_02',
        title: 'Payment Under Review',
        message: 'Your Nagad payment submission (TrxID: NGD98412760) for order RYV-849103-2941 is currently under review by admin.',
        type: 'payment_submitted',
        isRead: false,
        createdAt: '2026-09-15T14:35:00Z',
      },
      {
        id: 'notif_03',
        orderId: 'ord_03',
        title: 'Payment Verification Rejected',
        message: 'Payment for RYV-849104-5512 was rejected. Please review the reason and resubmit.',
        type: 'payment_rejected',
        isRead: false,
        createdAt: '2026-09-16T09:40:00Z',
      },
    ];
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem(STORAGE_NOTIFICATIONS_KEY, JSON.stringify(this.notifications));
    } catch {
      // Ignore
    }
  }

  private loadInitialBusinessSettings(): BusinessSettings {
    try {
      const stored = localStorage.getItem(STORAGE_BUSINESS_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          return { ...DEFAULT_BUSINESS_SETTINGS, ...parsed };
        }
      }
    } catch {
      // Ignore
    }
    return { ...DEFAULT_BUSINESS_SETTINGS };
  }

  saveBusinessSettings(): void {
    try {
      localStorage.setItem(STORAGE_BUSINESS_SETTINGS_KEY, JSON.stringify(this.businessSettings));
    } catch {
      // Ignore
    }
  }

  private loadInitialAdminNotifications(): AdminNotification[] {
    try {
      const stored = localStorage.getItem(STORAGE_ADMIN_NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [
      {
        id: 'admin_notif_01',
        type: 'payment_verification',
        title: 'Payment Verification Required',
        message: 'bKash payment for order RYV-849103-2941 (৳120) requires review (TrxID: NGD98412760).',
        relatedId: 'ord_02',
        link: '/admin/orders',
        isRead: false,
        createdAt: '2026-09-15T14:40:00Z',
        severity: 'warning',
      },
      {
        id: 'admin_notif_02',
        type: 'low_stock',
        title: 'Low Stock Alert: Arsenal 24/25 Home (Size M)',
        message: 'Available stock is only 2 units (below safety reorder threshold of 10).',
        relatedId: 'prod_04',
        link: '/admin/inventory',
        isRead: false,
        createdAt: '2026-09-16T10:15:00Z',
        severity: 'critical',
      },
      {
        id: 'admin_notif_03',
        type: 'new_order',
        title: 'New Website Order Placed',
        message: 'Order RYV-849102-1049 placed by Tanvir Ahmed for ৳3,450.',
        relatedId: 'ord_01',
        link: '/admin/orders',
        isRead: true,
        createdAt: '2026-09-14T11:00:00Z',
        severity: 'info',
      },
      {
        id: 'admin_notif_04',
        type: 'return',
        title: 'New Return Request Submitted',
        message: 'Return RMA-2026-001 submitted by customer for size exchange inspection.',
        relatedId: 'ret_01',
        link: '/admin/returns',
        isRead: false,
        createdAt: '2026-09-16T12:30:00Z',
        severity: 'warning',
      },
      {
        id: 'admin_notif_05',
        type: 'exchange',
        title: 'Size Exchange Requested',
        message: 'Customer requested exchange for Manchester City 24/25 Away Jersey (Size L -> XL).',
        relatedId: 'ret_02',
        link: '/admin/returns',
        isRead: false,
        createdAt: '2026-09-16T15:20:00Z',
        severity: 'info',
      },
      {
        id: 'admin_notif_06',
        type: 'important_activity',
        title: 'Critical Governance Action',
        message: 'Super Admin Alex Mercer verified financial year cash reconciliation.',
        relatedId: 'log_01',
        link: '/admin/governance/activity-logs',
        isRead: true,
        createdAt: '2026-09-16T16:00:00Z',
        severity: 'info',
      },
    ];
  }

  saveAdminNotifications(): void {
    try {
      localStorage.setItem(STORAGE_ADMIN_NOTIFICATIONS_KEY, JSON.stringify(this.adminNotifications));
    } catch {
      // Ignore
    }
  }

  private loadInitialRecycleBin(): SoftDeletedItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_RECYCLE_BIN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  }

  saveRecycleBin(): void {
    try {
      localStorage.setItem(STORAGE_RECYCLE_BIN_KEY, JSON.stringify(this.recycleBin));
    } catch {
      // Ignore
    }
  }

  private loadInitialSuppliers(): Supplier[] {
    try {
      const stored = localStorage.getItem(STORAGE_SUPPLIERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...INITIAL_SUPPLIERS].map((s) => ({
      ...s,
      isActive: s.isActive ?? true,
      supplierDue: s.supplierDue ?? 0,
      totalSpend: s.totalSpend ?? 0,
      totalPaid: s.totalPaid ?? Math.max(0, (s.totalSpend || 0) - (s.supplierDue || 0)),
      notes: s.notes || '',
    }));
  }

  saveSuppliers(): void {
    try {
      localStorage.setItem(STORAGE_SUPPLIERS_KEY, JSON.stringify(this.suppliers));
    } catch {
      // Ignore
    }
  }

  private loadInitialPurchases(): PurchaseOrder[] {
    try {
      const stored = localStorage.getItem(STORAGE_PURCHASES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...INITIAL_PURCHASES];
  }

  savePurchases(): void {
    try {
      localStorage.setItem(STORAGE_PURCHASES_KEY, JSON.stringify(this.purchases));
    } catch {
      // Ignore
    }
  }

  private loadInitialCashbook(): CashbookEntry[] {
    try {
      const stored = localStorage.getItem(STORAGE_CASHBOOK_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...INITIAL_CASHBOOK];
  }

  saveCashbook(): void {
    try {
      localStorage.setItem(STORAGE_CASHBOOK_KEY, JSON.stringify(this.cashbook));
    } catch {
      // Ignore
    }
  }

  private loadInitialExpenses(): Expense[] {
    try {
      const stored = localStorage.getItem(STORAGE_EXPENSES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...INITIAL_EXPENSES];
  }

  saveExpenses(): void {
    try {
      localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(this.expenses));
    } catch {
      // Ignore
    }
  }

  private loadInitialInvestments(): Investment[] {
    try {
      const stored = localStorage.getItem(STORAGE_INVESTMENTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...INITIAL_INVESTMENTS];
  }

  saveInvestments(): void {
    try {
      localStorage.setItem(STORAGE_INVESTMENTS_KEY, JSON.stringify(this.investments));
    } catch {
      // Ignore
    }
  }

  private loadInitialWithdrawals(): Withdrawal[] {
    try {
      const stored = localStorage.getItem(STORAGE_WITHDRAWALS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...INITIAL_WITHDRAWALS];
  }

  saveWithdrawals(): void {
    try {
      localStorage.setItem(STORAGE_WITHDRAWALS_KEY, JSON.stringify(this.withdrawals));
    } catch {
      // Ignore
    }
  }

  private loadInitialLoans(): Loan[] {
    try {
      const stored = localStorage.getItem(STORAGE_LOANS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...INITIAL_LOANS];
  }

  saveLoans(): void {
    try {
      localStorage.setItem(STORAGE_LOANS_KEY, JSON.stringify(this.loans));
    } catch {
      // Ignore
    }
  }

  private loadInitialLogs(): ActivityLog[] {
    try {
      const stored = localStorage.getItem(STORAGE_LOGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore
    }
    return [...INITIAL_ACTIVITY_LOGS];
  }

  saveLogs(): void {
    try {
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(this.logs));
    } catch {
      // Ignore
    }
  }

  // --------------------------------------------------------------------------
  // PRODUCTS & CATALOG
  // --------------------------------------------------------------------------
  getProducts(): Product[] {
    return this.products.filter((p) => !p.isArchived && !p.isDeleted);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  getFeaturedProducts(): Product[] {
    return this.products.filter((p) => p.isFeatured && !p.isArchived);
  }

  getNewArrivals(): Product[] {
    return this.products.filter((p) => p.isNewArrival && !p.isArchived);
  }

  getBestSellers(): Product[] {
    return this.products.filter((p) => p.isBestSeller && !p.isArchived);
  }

  getClubs(): Club[] {
    return this.clubs;
  }

  getPopularClubs(): Club[] {
    return this.clubs.slice(0, 8);
  }

  getCustomerReviews(): CustomerReview[] {
    return this.reviews;
  }

  getCategories(): Category[] {
    return this.categories;
  }

  createProduct(data: {
    title: string;
    subtitle?: string;
    description: string;
    details?: string;
    clubId?: string;
    clubName?: string;
    season: string;
    categoryId: string;
    categoryName?: string;
    kitType?: any;
    jerseyType?: string;
    costPrice: number; // Buying price (cost)
    basePrice: number; // Selling price
    comparePrice?: number;
    material?: string;
    allowCustomization?: boolean;
    customizationOptions?: {
      defaultPrice?: number;
      popularPlayers?: { name: string; number: string; position?: string }[];
    };
    sizeChart?: any;
    sizes: { size: JerseySize; initialStock: number; sku?: string }[];
    images: { id: string; url: string; altText?: string; isPrimary: boolean; sortOrder: number }[];
    isActive?: boolean;
    adminName?: string;
  }): { success: boolean; product?: Product; error?: string } {
    if (!data.title?.trim()) {
      return { success: false, error: 'Product title is required.' };
    }
    if (data.costPrice < 0 || data.basePrice < 0) {
      return { success: false, error: 'Prices cannot be negative.' };
    }

    const productId = `prd_${Date.now()}`;
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const prefix = (data.clubName || 'RYV').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'RVN');
    const masterSku = `${prefix}-${data.season ? data.season.slice(-2) : '25'}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    const variants = (data.sizes || []).map((s, idx) => ({
      id: `var_${Date.now()}_${s.size.toLowerCase()}_${idx}`,
      productId,
      size: s.size,
      sku: s.sku || `${masterSku}-${s.size}`,
      stockQuantity: s.initialStock || 0,
    }));

    const newProduct: Product = {
      id: productId,
      title: data.title.trim(),
      slug,
      sku: masterSku,
      subtitle: data.subtitle?.trim() || `${data.clubName || 'Official'} Match Grade Edition`,
      description: data.description.trim(),
      details: data.details?.trim() || data.material || 'Breathable high-performance match kit.',
      categoryId: data.categoryId || 'cat_01',
      categoryName: data.categoryName || 'Match Kits',
      clubId: data.clubId,
      clubName: data.clubName,
      season: data.season || '2024/25',
      kitType: data.kitType || 'Home',
      jerseyType: data.jerseyType || 'Player Version',
      costPrice: Number(data.costPrice) || 0,
      basePrice: Number(data.basePrice) || 0,
      comparePrice: data.comparePrice ? Number(data.comparePrice) : undefined,
      material: data.material || '100% Recycled Aeroknit Poly Jacquard',
      allowCustomization: data.allowCustomization ?? true,
      customizationOptions: data.customizationOptions || { defaultPrice: 100 },
      sizeChart: data.sizeChart,
      isActive: data.isActive ?? true,
      isFeatured: false,
      isNewArrival: true,
      createdAt: new Date().toISOString(),
      images: data.images && data.images.length > 0 ? data.images : [
        {
          id: `img_${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80',
          altText: data.title,
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      variants,
    };

    this.products.unshift(newProduct);
    this.saveProducts();

    // Auto-create size-aware inventory records for each variant
    for (const v of variants) {
      const initialQty = v.stockQuantity || 0;
      const invItem: InventoryItem = {
        id: `inv_${Date.now()}_${v.size.toLowerCase()}_${Math.random().toString(36).substring(2, 6)}`,
        productId: newProduct.id,
        variantId: v.id,
        productTitle: newProduct.title,
        sku: v.sku,
        variantSku: v.sku,
        size: v.size,
        available: initialQty,
        reserved: 0,
        sold: 0,
        returned: 0,
        damaged: 0,
        lost: 0,
        currentStock: initialQty,
        availableQuantity: initialQty,
        reservedStock: 0,
        reservedQuantity: 0,
        reorderPoint: 15,
        safetyStock: 10,
        costPerUnit: newProduct.costPrice,
        sellingPrice: newProduct.basePrice,
        warehouseLocation: 'Bin Main Warehouse',
        status: initialQty <= 10 ? (initialQty === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK') : 'IN_STOCK',
        updatedAt: new Date().toISOString(),
      };
      this.inventory.push(invItem);

      if (initialQty > 0) {
        this.inventoryTransactions.unshift({
          id: `trx_${Date.now()}_${v.size}`,
          productId: newProduct.id,
          productTitle: newProduct.title,
          variantSku: v.sku,
          size: v.size,
          type: 'PURCHASE',
          quantity: initialQty,
          previousQuantity: { available: 0, reserved: 0, sold: 0, returned: 0, damaged: 0, lost: 0 },
          newQuantity: { available: initialQty, reserved: 0, sold: 0, returned: 0, damaged: 0, lost: 0 },
          reason: 'Initial stock intake upon product catalog creation',
          admin: data.adminName || 'Alex Mercer (Inventory Lead)',
          timestamp: new Date().toISOString(),
          reference: `CAT-NEW-${newProduct.sku}`,
        });
      }
    }

    this.saveInventory();
    this.saveTransactions();
    this.logActivity(`Created product ${newProduct.title} (${newProduct.sku})`, 'PRODUCTS', data.adminName || 'Alex Mercer');

    return { success: true, product: newProduct };
  }

  updateProduct(
    id: string,
    updates: Partial<Product> & {
      sizes?: { size: JerseySize; initialStock?: number; sku?: string }[];
      adminName?: string;
    }
  ): { success: boolean; product?: Product; error?: string } {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, error: 'Product not found.' };

    const current = this.products[idx];
    const updated: Product = {
      ...current,
      ...updates,
      costPrice: updates.costPrice !== undefined ? Number(updates.costPrice) : current.costPrice,
      basePrice: updates.basePrice !== undefined ? Number(updates.basePrice) : current.basePrice,
      comparePrice: updates.comparePrice !== undefined ? Number(updates.comparePrice) : current.comparePrice,
    };

    // If sizes was provided, ensure variants & inventory items exist
    if (updates.sizes && Array.isArray(updates.sizes)) {
      for (const s of updates.sizes) {
        let variant = updated.variants.find((v) => v.size === s.size);
        if (!variant) {
          const varId = `var_${Date.now()}_${s.size.toLowerCase()}`;
          const varSku = s.sku || `${updated.sku}-${s.size}`;
          variant = {
            id: varId,
            productId: updated.id,
            size: s.size,
            sku: varSku,
            stockQuantity: s.initialStock || 0,
          };
          updated.variants.push(variant);

          const invItem: InventoryItem = {
            id: `inv_${Date.now()}_${s.size.toLowerCase()}`,
            productId: updated.id,
            variantId: varId,
            productTitle: updated.title,
            sku: varSku,
            variantSku: varSku,
            size: s.size,
            available: s.initialStock || 0,
            reserved: 0,
            sold: 0,
            returned: 0,
            damaged: 0,
            lost: 0,
            currentStock: s.initialStock || 0,
            availableQuantity: s.initialStock || 0,
            reservedStock: 0,
            reservedQuantity: 0,
            reorderPoint: 15,
            safetyStock: 10,
            costPerUnit: updated.costPrice,
            sellingPrice: updated.basePrice,
            warehouseLocation: 'Bin Main Warehouse',
            status: (s.initialStock || 0) <= 10 ? 'LOW_STOCK' : 'IN_STOCK',
            updatedAt: new Date().toISOString(),
          };
          this.inventory.push(invItem);
        }
      }
    }

    // Sync prices and title to inventory items for this product
    for (const inv of this.inventory) {
      if (inv.productId === updated.id || updated.variants.some((v) => v.id === inv.variantId || v.sku === inv.sku)) {
        inv.productTitle = updated.title;
        inv.costPerUnit = updated.costPrice;
        inv.sellingPrice = updated.basePrice;
      }
    }

    this.products[idx] = updated;
    this.saveProducts();
    this.saveInventory();
    this.logActivity(`Updated product ${updated.title} (${updated.sku})`, 'PRODUCTS', updates.adminName || 'Alex Mercer');

    return { success: true, product: updated };
  }

  toggleProductActive(id: string, adminName?: string): { success: boolean; product?: Product; isActive?: boolean } {
    const product = this.products.find((p) => p.id === id);
    if (!product) return { success: false };

    product.isActive = product.isActive === undefined ? false : !product.isActive;
    this.saveProducts();
    this.logActivity(
      `${product.isActive ? 'Activated' : 'Deactivated'} product ${product.title}`,
      'PRODUCTS',
      adminName || 'Alex Mercer'
    );
    return { success: true, product, isActive: product.isActive };
  }

  deleteProduct(id: string, adminName?: string): { success: boolean; error?: string } {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, error: 'Product not found' };

    const deleted = this.products[idx];
    deleted.isArchived = true;
    deleted.isActive = false;
    this.saveProducts();

    this.logActivity(`Archived product ${deleted.title} (${deleted.sku})`, 'PRODUCTS', adminName || 'Alex Mercer');
    return { success: true };
  }

  // --------------------------------------------------------------------------
  // SERVER VALIDATION & PRICING ENGINE
  // "Never trust product price, delivery charge, discount, total, stock from browser"
  // --------------------------------------------------------------------------
  validateAndCalculateOrder(input: OrderValidationInput): CalculatedOrderSummary {
    const errors: string[] = [];
    const verifiedItems: OrderItem[] = [];
    let productTotal = 0;

    if (!input.items || input.items.length === 0) {
      errors.push('Cart is empty. Please add items to checkout.');
    }

    // 1. Verify products, variants, and real inventory stock
    for (const item of input.items || []) {
      const product = this.getProductById(item.productId);
      if (!product) {
        errors.push(`Product #${item.productId} was not found in catalog.`);
        continue;
      }

      const variant = product.variants.find((v) => v.id === item.variantId);
      if (!variant) {
        errors.push(`Size variant for ${product.title} is invalid.`);
        continue;
      }

      // Quantity validations
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Invalid quantity for ${product.title}. Must be greater than 0.`);
        continue;
      }

      if (item.quantity > variant.stockQuantity) {
        errors.push(
          `Requested ${item.quantity} units of ${product.title} (${variant.size}), but only ${variant.stockQuantity} are available in stock.`
        );
        continue;
      }

      // Calculate unit price strictly from database
      const baseUnit = variant.priceOverride ?? product.basePrice;
      let customizationSurcharge = 0;

      if (product.allowCustomization !== false && item.customization) {
        if (item.customization.playerName || item.customization.playerNumber) {
          customizationSurcharge += product.customizationOptions?.defaultPrice || 150; // or ৳150 / $15
        }
        if (item.customization.badgePatch && item.customization.badgePatch !== 'none') {
          customizationSurcharge += 100;
        }
      }

      const lineUnitPrice = baseUnit + customizationSurcharge;
      const lineSubtotal = lineUnitPrice * item.quantity;
      productTotal += lineSubtotal;

      verifiedItems.push({
        id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderId: '', // populated on creation
        variantId: variant.id,
        productTitle: product.title,
        productImage: product.images[0]?.url,
        variantSku: variant.sku,
        variantSize: variant.size,
        unitPrice: lineUnitPrice,
        quantity: item.quantity,
        subtotal: lineSubtotal,
        customBadge: item.customization?.badgePatch,
        playerPrint: item.customization?.playerPrint,
        playerName: item.customization?.playerName,
        playerNumber: item.customization?.playerNumber,
      });
    }

    // 2. Server delivery charge calculation
    const deliveryCharge = getDeliveryChargeForDivision(input.delivery.division);

    // 3. Server discount calculation
    let discount = 0;
    if (input.couponCode) {
      const normalizedCode = input.couponCode.trim().toUpperCase();
      if (normalizedCode === 'RAYVEN10') {
        discount = Math.round(productTotal * 0.1);
      } else if (normalizedCode === 'WELCOME100') {
        discount = Math.min(100, productTotal);
      }
    }

    const totalOrderAmount = Math.max(0, productTotal + deliveryCharge - discount);
    const minimumAdvance = deliveryCharge; // minimum advance is delivery charge (৳70 or ৳120)

    let payNow = minimumAdvance;
    let remainingDue = totalOrderAmount - minimumAdvance;

    if (input.paymentOption === 'FULL_PAYMENT') {
      payNow = totalOrderAmount;
      remainingDue = 0;
    }

    return {
      isValid: errors.length === 0,
      errors,
      productTotal,
      deliveryCharge,
      discount,
      totalOrderAmount,
      minimumAdvance,
      payNow,
      remainingDue,
      verifiedItems,
    };
  }

  // --------------------------------------------------------------------------
  // ORDER CREATION
  // --------------------------------------------------------------------------
  createOrder(
    input: OrderValidationInput,
    userId?: string
  ): { success: boolean; order?: Order; errors?: string[] } {
    const calculation = this.validateAndCalculateOrder(input);
    if (!calculation.isValid) {
      return { success: false, errors: calculation.errors };
    }

    const newOrderId = `ord_${Date.now()}`;
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    const newOrderNumber = `RYV-${timestamp}-${random}`;

    // Reserve inventory stock using size-aware stock flow engine
    for (const item of input.items) {
      const product = this.getProductById(item.productId);
      if (product) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant) {
          variant.stockQuantity = Math.max(0, variant.stockQuantity - item.quantity);
          this.recordStockFlow({
            productId: product.id,
            variantSku: variant.sku,
            size: variant.size,
            type: 'ORDER_RESERVED',
            quantity: item.quantity,
            reason: `Online order reservation for ${newOrderNumber}`,
            reference: newOrderNumber,
            admin: 'System (Checkout Engine)',
          });
        }
      }
    }

    const orderItems: OrderItem[] = calculation.verifiedItems.map((item) => ({
      ...item,
      orderId: newOrderId,
    }));

    const newOrder: Order = {
      id: newOrderId,
      orderNumber: newOrderNumber,
      userId: userId || (input.delivery.customerEmail ? `usr_${input.delivery.customerPhone}` : undefined),
      customerName: input.delivery.customerName,
      customerEmail: input.delivery.customerEmail,
      customerPhone: input.delivery.customerPhone,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING',
      subtotal: calculation.productTotal,
      shippingFee: calculation.deliveryCharge,
      taxFee: 0,
      discountAmount: calculation.discount,
      totalAmount: calculation.totalOrderAmount,
      minimumAdvance: calculation.minimumAdvance,
      amountPaid: 0,
      remainingDue: calculation.totalOrderAmount,
      paymentOption: input.paymentOption,
      currency: 'BDT',
      division: input.delivery.division,
      district: input.delivery.district,
      areaThana: input.delivery.areaThana,
      fullAddress: input.delivery.fullAddress,
      deliveryInstructions: input.delivery.deliveryInstructions,
      createdAt: new Date().toISOString(),
      items: orderItems,
      shippingAddress: {
        id: `addr_${Date.now()}`,
        userId: userId || 'guest',
        isDefault: false,
        label: 'Home',
        recipientName: input.delivery.customerName,
        street1: input.delivery.fullAddress,
        city: input.delivery.district || input.delivery.division || 'Bangladesh',
        state: input.delivery.division || '',
        postalCode: '1000',
        country: 'Bangladesh',
        phone: input.delivery.customerPhone,
      },
      paymentSubmissions: [],
    };

    this.orders.unshift(newOrder);
    this.saveOrders();

    // Create customer notification
    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: newOrder.userId,
      orderId: newOrder.id,
      title: 'Order Placed • Awaiting Advance Payment',
      message: `Your order ${newOrder.orderNumber} has been recorded. Complete advance payment of ${calculation.payNow === calculation.minimumAdvance ? `৳${calculation.minimumAdvance}` : `৳${calculation.payNow}`} to proceed to review.`,
      type: 'order_placed',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, order: newOrder };
  }

  // --------------------------------------------------------------------------
  // MANUAL PAYMENT VERIFICATION SYSTEM
  // --------------------------------------------------------------------------
  getPaymentMethodConfigs(): PaymentMethodConfig[] {
    return this.paymentConfigs;
  }

  getActivePaymentMethodConfigs(): PaymentMethodConfig[] {
    return this.paymentConfigs.filter((c) => c.isActive);
  }

  updatePaymentMethodConfig(id: ManualPaymentMethod, updates: Partial<PaymentMethodConfig>): void {
    const idx = this.paymentConfigs.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.paymentConfigs[idx] = { ...this.paymentConfigs[idx], ...updates };
      this.savePaymentConfigs();
    }
  }

  checkTransactionIdExists(transactionId: string): boolean {
    const cleanTrx = transactionId.trim().toUpperCase();
    for (const order of this.orders) {
      if (order.paymentSubmissions) {
        for (const sub of order.paymentSubmissions) {
          if (sub.transactionId.trim().toUpperCase() === cleanTrx) {
            return true;
          }
        }
      }
    }
    return false;
  }

  submitManualPayment(
    orderId: string,
    submission: {
      method: ManualPaymentMethod;
      amountPaid: number;
      senderPhone: string;
      transactionId: string;
      paymentDateTime: string;
      screenshotUrl?: string;
      note?: string;
    }
  ): { success: boolean; error?: string; order?: Order } {
    const order = this.getOrderById(orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    // Require fields
    if (!submission.method || !submission.amountPaid || !submission.senderPhone || !submission.transactionId) {
      return { success: false, error: 'Payment method, amount, sender phone, and transaction ID are required.' };
    }

    const cleanTrx = submission.transactionId.trim().toUpperCase();

    // Check unique transaction ID across all submissions (except current re-submitted attempt if any)
    const isDuplicate = this.orders.some((o) =>
      (o.paymentSubmissions || []).some(
        (s) => s.transactionId.trim().toUpperCase() === cleanTrx && s.orderId !== order.id
      )
    );

    if (isDuplicate) {
      return {
        success: false,
        error: `Transaction ID "${submission.transactionId}" has already been submitted to another order. Please provide your unique payment confirmation.`,
      };
    }

    // Create submission record
    const newSubmission: PaymentSubmission = {
      id: `sub_${Date.now()}`,
      orderId: order.id,
      method: submission.method,
      amountPaid: Number(submission.amountPaid),
      senderPhone: submission.senderPhone.trim(),
      transactionId: cleanTrx,
      paymentDateTime: submission.paymentDateTime || new Date().toLocaleString(),
      screenshotUrl: submission.screenshotUrl,
      note: submission.note,
      status: 'UNDER_REVIEW',
      submittedAt: new Date().toISOString(),
    };

    if (!order.paymentSubmissions) {
      order.paymentSubmissions = [];
    }
    order.paymentSubmissions.unshift(newSubmission);
    order.activeSubmission = newSubmission;
    order.paymentMethod = submission.method;
    order.paymentStatus = 'UNDER_REVIEW';
    order.status = 'PENDING_PAYMENT'; // Never confirm yet

    this.saveOrders();

    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: order.userId,
      orderId: order.id,
      title: 'Payment Submitted for Verification',
      message: `Your ${submission.method} payment of ৳${submission.amountPaid} (TrxID: ${cleanTrx}) is under review by admin.`,
      type: 'payment_submitted',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, order };
  }

  adminApprovePayment(
    orderId: string,
    submissionId: string,
    adminName: string = 'RAYVEN Finance Admin'
  ): { success: boolean; order?: Order; error?: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const submission = order.paymentSubmissions?.find((s) => s.id === submissionId) || order.activeSubmission;
    if (!submission) return { success: false, error: 'Payment submission not found' };

    submission.status = 'APPROVED';
    submission.reviewedAt = new Date().toISOString();
    submission.reviewedBy = adminName;

    order.activeSubmission = submission;
    order.paymentStatus = 'APPROVED';
    order.status = 'CONFIRMED';
    order.amountPaid = (order.amountPaid || 0) + submission.amountPaid;
    order.remainingDue = Math.max(0, order.totalAmount - order.amountPaid);

    // Record verified cash inflow in treasury cashbook if not already recorded
    if (submission.amountPaid > 0) {
      const alreadyInCashbook = this.cashbook.some(
        (c) =>
          c.referenceCode === submission.transactionId ||
          (c.referenceCode === order.orderNumber && (c.description || '').includes(submission.transactionId))
      );
      if (!alreadyInCashbook) {
        this.recordCashTransaction({
          type: 'INFLOW',
          category: 'Customer Order Payment',
          amount: submission.amountPaid,
          description: `Payment approved for Order ${order.orderNumber} via ${submission.method} (TrxID: ${submission.transactionId})`,
          referenceCode: submission.transactionId,
          recordedBy: adminName,
        });
      }
    }

    this.saveOrders();

    this.addNotification({
      id: `notif_${Date.now()}_1`,
      userId: order.userId,
      orderId: order.id,
      title: 'Payment Verified & Approved',
      message: `Your payment of ৳${submission.amountPaid} via ${submission.method} was successfully approved.`,
      type: 'payment_approved',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    this.addNotification({
      id: `notif_${Date.now()}_2`,
      userId: order.userId,
      orderId: order.id,
      title: 'Order Confirmed',
      message: `Order ${order.orderNumber} is now confirmed and queued for fulfillment.`,
      type: 'order_confirmed',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, order };
  }

  adminRejectPayment(
    orderId: string,
    submissionId: string,
    rejectionReason: string,
    adminName: string = 'RAYVEN Finance Admin'
  ): { success: boolean; order?: Order; error?: string } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false, error: 'Order not found' };

    const submission = order.paymentSubmissions?.find((s) => s.id === submissionId) || order.activeSubmission;
    if (!submission) return { success: false, error: 'Payment submission not found' };

    submission.status = 'REJECTED';
    submission.rejectionReason = rejectionReason || 'Payment verification failed. Please check transaction ID or amount.';
    submission.reviewedAt = new Date().toISOString();
    submission.reviewedBy = adminName;

    order.activeSubmission = submission;
    order.paymentStatus = 'REJECTED';
    order.status = 'PENDING_PAYMENT';

    this.saveOrders();

    this.addNotification({
      id: `notif_${Date.now()}`,
      userId: order.userId,
      orderId: order.id,
      title: 'Payment Verification Rejected',
      message: `Payment for ${order.orderNumber} was rejected: ${submission.rejectionReason}. Please resubmit your payment.`,
      type: 'payment_rejected',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return { success: true, order };
  }

  adminUpdateOrderStatus(orderId: string, newStatus: OrderStatus, adminName?: string): { success: boolean; order?: Order } {
    const order = this.getOrderById(orderId);
    if (!order) return { success: false };

    const oldStatus = order.status;
    order.status = newStatus;
    this.saveOrders();

    // Stock Flow Lifecycle Rules:
    // - Delivery: Stock becomes sold
    // - Cancellation: Reserved stock returns to available
    if (newStatus === 'DELIVERED' && oldStatus !== 'DELIVERED') {
      for (const item of order.items) {
        this.recordStockFlow({
          variantSku: item.variantSku,
          size: item.variantSize,
          type: 'ORDER_DELIVERED',
          quantity: item.quantity,
          reason: `Delivery confirmed for order ${order.orderNumber}. Transferred from Reserved to Sold.`,
          reference: order.orderNumber,
          admin: adminName || 'Alex Mercer (Fulfillment)',
        });
      }
    } else if (newStatus === 'CANCELLED' && oldStatus !== 'CANCELLED') {
      for (const item of order.items) {
        this.recordStockFlow({
          variantSku: item.variantSku,
          size: item.variantSize,
          type: 'ORDER_CANCELLED',
          quantity: item.quantity,
          reason: `Order ${order.orderNumber} cancelled. Reserved inventory released to Available.`,
          reference: order.orderNumber,
          admin: adminName || 'Alex Mercer (Support Admin)',
        });
      }
    }

    // Map status to customer notification
    const statusNotifMap: Record<string, { title: string; type: CustomerNotification['type']; message: string }> = {
      CONFIRMED: { title: 'Order Confirmed', type: 'order_confirmed', message: `Order ${order.orderNumber} is confirmed.` },
      PACKED: { title: 'Order Packed', type: 'packed', message: `Order ${order.orderNumber} is professionally packed at warehouse.` },
      IN_HUB: { title: 'In Logistics Hub', type: 'in_hub', message: `Order ${order.orderNumber} has arrived at sorting hub.` },
      OUT_FOR_DELIVERY: { title: 'Out For Delivery', type: 'out_for_delivery', message: `Rider is out for delivery with order ${order.orderNumber}.` },
      DELIVERED: { title: 'Order Delivered', type: 'delivered', message: `Order ${order.orderNumber} has been successfully delivered. Enjoy your kit!` },
    };

    if (statusNotifMap[newStatus]) {
      const config = statusNotifMap[newStatus];
      this.addNotification({
        id: `notif_${Date.now()}`,
        userId: order.userId,
        orderId: order.id,
        title: config.title,
        message: config.message,
        type: config.type,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return { success: true, order };
  }

  // --------------------------------------------------------------------------
  // CUSTOMER SECURITY & QUERIES
  // "Customer can view only their own: orders, payments, addresses, wishlist, reviews, notifications"
  // --------------------------------------------------------------------------
  getOrders(): Order[] {
    return this.orders.filter((o) => !o.isDeleted);
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find((o) => (o.id === id || o.orderNumber === id) && !o.isDeleted);
  }

  getCustomerOrders(userIdentifier?: { id?: string; email?: string; phone?: string }): Order[] {
    const activeOrders = this.orders.filter((o) => !o.isDeleted);
    if (!userIdentifier || (!userIdentifier.id && !userIdentifier.email && !userIdentifier.phone)) {
      return activeOrders; // Fallback in prototype or demo
    }
    return activeOrders.filter((o) => {
      if (userIdentifier.id && o.userId === userIdentifier.id) return true;
      if (userIdentifier.email && o.customerEmail?.toLowerCase() === userIdentifier.email.toLowerCase()) return true;
      if (userIdentifier.phone && o.customerPhone === userIdentifier.phone) return true;
      return false;
    });
  }

  // Customer Notifications
  getCustomerNotifications(userId?: string): CustomerNotification[] {
    return this.notifications.filter((n) => !userId || !n.userId || n.userId === userId);
  }

  addNotification(notif: CustomerNotification): void {
    this.notifications.unshift(notif);
    this.saveNotifications();
  }

  markNotificationRead(id: string): void {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveNotifications();
    }
  }

  markAllNotificationsRead(): void {
    this.notifications.forEach((n) => (n.isRead = true));
    this.saveNotifications();
  }

  // --------------------------------------------------------------------------
  // ERP & BACKOFFICE LOGS & SIZE-AWARE INVENTORY FLOW ENGINE
  // --------------------------------------------------------------------------
  getInventory(): InventoryItem[] {
    return this.inventory;
  }

  getInventoryTransactions(): InventoryTransaction[] {
    return this.inventoryTransactions;
  }

  /**
   * Atomic Stock Movement & Flow Engine
   * Strictly verifies: No negative stock, no silent modifications (reason & reference required)
   * Creates an immutable InventoryTransaction record on every state change.
   */
  recordStockFlow(params: {
    productId?: string;
    variantSku?: string;
    size: JerseySize | string;
    type: StockFlowType;
    quantity: number;
    reason: string;
    reference: string;
    admin?: string;
    destination?: 'AVAILABLE' | 'DAMAGED';
  }): { success: boolean; transaction?: InventoryTransaction; item?: InventoryItem; error?: string } {
    const { productId, variantSku, size, type, quantity, reason, reference, admin } = params;

    // 1. Silent Modification Guards
    if (!reason || !reason.trim()) {
      return { success: false, error: 'Reason is required for all stock movements. Silent modifications are strictly prohibited.' };
    }
    if (!reference || !reference.trim()) {
      return { success: false, error: 'Reference code (e.g. PO-#, ORD-#, RMA-#, ADJ-#) is required.' };
    }
    if (quantity <= 0) {
      return { success: false, error: 'Movement quantity must be a positive integer.' };
    }

    // 2. Find target inventory item
    let item = this.inventory.find(
      (inv) =>
        (variantSku && (inv.sku === variantSku || inv.variantSku === variantSku)) ||
        (productId && inv.productId === productId && inv.size === size)
    );

    if (!item && productId) {
      item = this.inventory.find((inv) => inv.productId === productId);
    }

    if (!item && variantSku) {
      item = this.inventory.find((inv) => inv.variantSku?.includes(variantSku) || inv.sku?.includes(variantSku));
    }

    if (!item) {
      return { success: false, error: `No inventory record found for size ${size} (SKU: ${variantSku || productId}).` };
    }

    // Normalize size bucket states
    item.available = Number(item.available ?? item.availableQuantity ?? (item.currentStock - (item.reservedStock || 0))) || 0;
    item.reserved = Number(item.reserved ?? item.reservedStock ?? 0) || 0;
    item.sold = Number(item.sold ?? 0) || 0;
    item.returned = Number(item.returned ?? 0) || 0;
    item.damaged = Number(item.damaged ?? 0) || 0;
    item.lost = Number(item.lost ?? 0) || 0;

    const prevSnapshot: InventoryQuantitySnapshot = {
      available: item.available,
      reserved: item.reserved,
      sold: item.sold,
      returned: item.returned,
      damaged: item.damaged,
      lost: item.lost,
    };

    // 3. Execute Stock Flow Rules
    switch (type) {
      case 'PURCHASE':
        // Purchase: Available increases.
        item.available += quantity;
        break;

      case 'ORDER_RESERVED':
        // Order: Stock is reserved according to order lifecycle.
        if (item.available < quantity) {
          return {
            success: false,
            error: `Negative stock prohibited! Cannot reserve ${quantity} units of ${item.productTitle} (${item.size}). Available stock is only ${item.available}.`,
          };
        }
        item.available -= quantity;
        item.reserved += quantity;
        break;

      case 'ORDER_CANCELLED':
        // Cancellation: Reserved stock returns to available.
        const releaseQty = Math.min(item.reserved, quantity);
        item.reserved = Math.max(0, item.reserved - releaseQty);
        item.available += releaseQty;
        break;

      case 'ORDER_DELIVERED':
        // Delivery: Stock becomes sold.
        const deliverQty = Math.min(item.reserved, quantity);
        item.reserved = Math.max(0, item.reserved - deliverQty);
        item.sold += deliverQty;
        break;

      case 'RETURN_TO_AVAILABLE':
        // Return: Admin decides Return to Available
        item.returned += quantity;
        item.available += quantity;
        break;

      case 'RETURN_TO_DAMAGED':
        // Return: Admin decides Mark as Damaged
        item.returned += quantity;
        item.damaged += quantity;
        break;

      case 'DAMAGE':
        // Damage: Damaged increases. Deducted from available.
        if (item.available < quantity) {
          return {
            success: false,
            error: `Negative stock prohibited! Cannot mark ${quantity} units as damaged. Only ${item.available} units available in stock.`,
          };
        }
        item.available -= quantity;
        item.damaged += quantity;
        break;

      case 'LOST':
        // Lost: Lost increases. Deducted from available.
        if (item.available < quantity) {
          return {
            success: false,
            error: `Negative stock prohibited! Cannot mark ${quantity} units as lost. Only ${item.available} units available in stock.`,
          };
        }
        item.available -= quantity;
        item.lost += quantity;
        break;

      case 'MANUAL_ADJUSTMENT':
        if (params.destination === 'DAMAGED') {
          item.damaged += quantity;
        } else {
          item.available += quantity;
        }
        break;

      default:
        return { success: false, error: `Invalid stock flow type: ${type}` };
    }

    // Recalculate operational aggregates & stock status
    item.currentStock = item.available + item.reserved;
    item.availableQuantity = item.available;
    item.reservedStock = item.reserved;
    item.reservedQuantity = item.reserved;
    item.status = item.available <= 0 ? 'OUT_OF_STOCK' : item.available <= (item.safetyStock ?? item.reorderPoint ?? 10) ? 'LOW_STOCK' : 'IN_STOCK';
    item.updatedAt = new Date().toISOString();

    const newSnapshot: InventoryQuantitySnapshot = {
      available: item.available,
      reserved: item.reserved,
      sold: item.sold,
      returned: item.returned,
      damaged: item.damaged,
      lost: item.lost,
    };

    // 4. Create mandatory InventoryTransaction audit entry
    const transaction: InventoryTransaction = {
      id: `trx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId: item.productId,
      productTitle: item.productTitle,
      variantSku: item.variantSku || item.sku || `${item.productId}-${item.size}`,
      size: item.size,
      type,
      quantity,
      previousQuantity: prevSnapshot,
      newQuantity: newSnapshot,
      reason: reason.trim(),
      admin: admin || 'Alex Mercer (Inventory Lead)',
      timestamp: new Date().toISOString(),
      reference: reference.trim(),
    };

    this.inventoryTransactions.unshift(transaction);
    this.saveInventory();
    this.saveTransactions();

    this.logActivity(
      `Inventory flow: ${type} ${quantity}x [${item.size}] ${item.productTitle} (Ref: ${reference})`,
      'INVENTORY',
      admin || 'Alex Mercer'
    );

    return { success: true, transaction, item };
  }

  /**
   * Process Return Decision
   * Admin decides: Return to Available OR Mark as Damaged
   */
  processReturnStockDecision(params: {
    returnId: string;
    decision: 'AVAILABLE' | 'DAMAGED';
    adminName?: string;
    notes?: string;
  }): { success: boolean; error?: string } {
    const ret = this.returns.find((r) => r.id === params.returnId || r.returnNumber === params.returnId);
    if (!ret) return { success: false, error: 'Return request not found' };

    const flowType: StockFlowType = params.decision === 'AVAILABLE' ? 'RETURN_TO_AVAILABLE' : 'RETURN_TO_DAMAGED';
    const reason = params.notes?.trim() || (params.decision === 'AVAILABLE'
      ? 'Returned item inspected & passed QC; restocked to Available'
      : 'Returned item inspected and damaged/defective; quarantined to Damaged stock');

    const result = this.recordStockFlow({
      productId: ret.productId,
      variantSku: ret.variantSku,
      size: ret.variantSize || 'M',
      type: flowType,
      quantity: ret.quantity || 1,
      reason,
      reference: ret.returnNumber,
      admin: params.adminName || 'Alex Mercer (QC Admin)',
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    ret.status = params.decision === 'AVAILABLE' ? 'RESTOCKED' : 'DEFECTIVE';
    ret.adminNotes = reason;
    this.logActivity(
      `Processed return ${ret.returnNumber}: ${params.decision === 'AVAILABLE' ? 'Restocked to Available' : 'Quarantined to Damaged'}`,
      'RETURNS',
      params.adminName || 'Alex Mercer'
    );

    return { success: true };
  }

  /**
   * Current Stock Value:
   * "Current stock value should use buying cost, not selling price.
   * Example: 10 pieces × buying price ৳500 = Current Stock Cost ৳5,000"
   */
  getCurrentStockCost(): number {
    return this.inventory.reduce((sum, item) => {
      const avail = item.available ?? item.availableQuantity ?? item.currentStock ?? 0;
      const cost = item.costPerUnit || 0;
      return sum + avail * cost;
    }, 0);
  }

  /**
   * Potential Sales Value:
   * Available pieces × selling price.
   * Kept separate from current stock cost.
   */
  getPotentialSalesValue(): number {
    return this.inventory.reduce((sum, item) => {
      const avail = item.available ?? item.availableQuantity ?? item.currentStock ?? 0;
      const price = item.sellingPrice || (item.costPerUnit ? item.costPerUnit * 1.8 : 0);
      return sum + avail * price;
    }, 0);
  }

  getSuppliers(): Supplier[] {
    return this.suppliers.filter((s) => !s.isDeleted);
  }

  getSupplierById(id: string): Supplier | undefined {
    return this.suppliers.find((s) => (s.id === id || s.code === id) && !s.isDeleted);
  }

  addSupplier(input: CreateSupplierInput): { success: boolean; supplier?: Supplier; error?: string } {
    if (!input.name || !input.name.trim()) {
      return { success: false, error: 'Supplier name is required.' };
    }

    const code = `SUP-${(input.country ? input.country.slice(0, 3) : 'VND').toUpperCase()}-${String(
      this.suppliers.length + 1
    ).padStart(2, '0')}`;

    const newSupplier: Supplier = {
      id: `sup_${Date.now()}`,
      code,
      name: input.name.trim(),
      phone: input.phone?.trim() || '',
      address: input.address?.trim() || '',
      notes: input.notes?.trim() || '',
      email: input.email?.trim() || '',
      country: input.country || 'Bangladesh',
      paymentTerms: input.paymentTerms || 'Net 30 Days',
      activeOrdersCount: 0,
      totalSpend: 0,
      totalPaid: 0,
      supplierDue: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.suppliers.unshift(newSupplier);
    this.saveSuppliers();

    this.logActivity(
      `Registered new supplier "${newSupplier.name}" (${newSupplier.code})`,
      'SUPPLIERS',
      input.adminName || 'Alex Mercer',
      newSupplier.code
    );

    return { success: true, supplier: newSupplier };
  }

  updateSupplier(
    id: string,
    input: UpdateSupplierInput
  ): { success: boolean; supplier?: Supplier; error?: string } {
    const idx = this.suppliers.findIndex((s) => s.id === id);
    if (idx === -1) {
      return { success: false, error: 'Supplier not found.' };
    }

    const existing = this.suppliers[idx];
    const updated: Supplier = {
      ...existing,
      name: input.name !== undefined ? input.name.trim() : existing.name,
      phone: input.phone !== undefined ? input.phone.trim() : existing.phone,
      address: input.address !== undefined ? input.address.trim() : existing.address,
      notes: input.notes !== undefined ? input.notes.trim() : existing.notes,
      email: input.email !== undefined ? input.email.trim() : existing.email,
      country: input.country !== undefined ? input.country : existing.country,
      paymentTerms: input.paymentTerms !== undefined ? input.paymentTerms : existing.paymentTerms,
      isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
      updatedAt: new Date().toISOString(),
    };

    this.suppliers[idx] = updated;
    this.saveSuppliers();

    this.logActivity(
      `Updated supplier "${updated.name}" (${updated.code}) profile details`,
      'SUPPLIERS',
      input.adminName || 'Alex Mercer',
      updated.code
    );

    return { success: true, supplier: updated };
  }

  deactivateSupplier(
    id: string,
    adminName?: string
  ): { success: boolean; supplier?: Supplier; error?: string } {
    const supplier = this.suppliers.find((s) => s.id === id);
    if (!supplier) {
      return { success: false, error: 'Supplier not found.' };
    }

    supplier.isActive = !supplier.isActive;
    supplier.updatedAt = new Date().toISOString();
    this.saveSuppliers();

    this.logActivity(
      `${supplier.isActive ? 'Activated' : 'Deactivated'} supplier "${supplier.name}" (${supplier.code})`,
      'SUPPLIERS',
      adminName || 'Alex Mercer',
      supplier.code
    );

    return { success: true, supplier };
  }

  recordSupplierPayment(params: {
    supplierId: string;
    amount: number;
    notes?: string;
    adminName?: string;
  }): { success: boolean; supplier?: Supplier; error?: string } {
    const { supplierId, amount, notes, adminName } = params;
    const supplier = this.suppliers.find((s) => s.id === supplierId);
    if (!supplier) {
      return { success: false, error: 'Supplier not found.' };
    }
    if (amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than 0.' };
    }
    if (amount > (supplier.supplierDue || 0)) {
      return {
        success: false,
        error: `Payment amount (৳${amount.toLocaleString()}) cannot exceed current supplier due (৳${supplier.supplierDue.toLocaleString()}).`,
      };
    }

    supplier.supplierDue = Math.max(0, (supplier.supplierDue || 0) - amount);
    supplier.totalPaid = (supplier.totalPaid || 0) + amount;
    supplier.updatedAt = new Date().toISOString();

    const paymentDate = new Date().toISOString().slice(0, 10);
    const cashEntry: CashbookEntry = {
      id: `csh_${Date.now()}`,
      entryNumber: `CB-OUT-${Date.now().toString().slice(-6)}`,
      type: 'DEBIT',
      entryType: 'OUTFLOW',
      category: 'Supplier Payment',
      amount,
      account: 'Operating Cash Reserve',
      description: `Settled supplier due payment to ${supplier.name} (${supplier.code}). Notes: ${notes || 'Direct payment towards outstanding due'}`,
      recordedBy: adminName || 'Alex Mercer',
      entryDate: paymentDate,
      timestamp: new Date().toISOString(),
      referenceCode: supplier.code,
    };
    this.cashbook.unshift(cashEntry);

    this.logActivity(
      `Paid ৳${amount.toLocaleString()} to supplier "${supplier.name}" (${supplier.code}). Remaining supplier due: ৳${supplier.supplierDue.toLocaleString()}`,
      'SUPPLIERS',
      adminName || 'Alex Mercer',
      supplier.code
    );

    this.saveSuppliers();
    this.saveCashbook();
    this.saveLogs();

    return { success: true, supplier };
  }

  getPurchases(): PurchaseOrder[] {
    return this.purchases.filter((p) => !p.isDeleted);
  }

  getPurchaseById(id: string): PurchaseOrder | undefined {
    return this.purchases.find((p) => (p.id === id || p.poNumber === id) && !p.isDeleted);
  }

  getPurchasesBySupplier(supplierId: string): PurchaseOrder[] {
    return this.purchases.filter((p) => p.supplierId === supplierId && !p.isDeleted);
  }

  /**
   * Database Transaction: Create Purchase
   * Updates atomically:
   * 1. Inventory (Available stock increases by quantity, records stock flow with reason & reference)
   * 2. Purchase history (stores PurchaseOrder record)
   * 3. Supplier balance (supplier due increases by unpaid amount, total purchases increments)
   * 4. Cash transaction if payment occurred (if amountPaid > 0, records cashbook entry of amountPaid, NOT total cost)
   * 5. Activity log
   * If any step fails, rolls back all state.
   */
  createPurchase(input: CreatePurchaseInput): { success: boolean; purchase?: PurchaseOrder; error?: string } {
    // Atomic state snapshots for rollback
    const inventorySnapshot = JSON.parse(JSON.stringify(this.inventory));
    const transactionsSnapshot = JSON.parse(JSON.stringify(this.inventoryTransactions));
    const purchasesSnapshot = JSON.parse(JSON.stringify(this.purchases));
    const suppliersSnapshot = JSON.parse(JSON.stringify(this.suppliers));
    const cashbookSnapshot = JSON.parse(JSON.stringify(this.cashbook));
    const logsSnapshot = JSON.parse(JSON.stringify(this.logs));
    const productsSnapshot = JSON.parse(JSON.stringify(this.products));

    try {
      // 0. Validation
      const supplier = this.suppliers.find((s) => s.id === input.supplierId);
      if (!supplier) {
        throw new Error('Selected supplier does not exist.');
      }
      if (supplier.isActive === false) {
        throw new Error(`Cannot issue purchase to deactivated vendor "${supplier.name}". Please reactivate the vendor first.`);
      }

      const product = this.products.find((p) => p.id === input.productId);
      if (!product) {
        throw new Error('Selected product does not exist.');
      }

      if (!input.size) {
        throw new Error('Size selection is required for apparel procurement.');
      }

      const quantity = Math.round(Number(input.quantity));
      if (!quantity || quantity <= 0) {
        throw new Error('Quantity must be a positive number greater than 0.');
      }

      const buyingPrice = Number(input.buyingPrice);
      if (isNaN(buyingPrice) || buyingPrice < 0) {
        throw new Error('Buying price cannot be negative.');
      }

      const totalCost = Number(input.totalCost !== undefined ? input.totalCost : quantity * buyingPrice);
      if (isNaN(totalCost) || totalCost < 0) {
        throw new Error('Invalid total cost calculation.');
      }

      const amountPaid = Number(input.amountPaid || 0);
      if (isNaN(amountPaid) || amountPaid < 0) {
        throw new Error('Amount paid cannot be negative.');
      }

      if (amountPaid > totalCost) {
        throw new Error(`Amount paid (৳${amountPaid.toLocaleString()}) cannot exceed total purchase cost (৳${totalCost.toLocaleString()}).`);
      }

      const supplierDue = Math.max(0, totalCost - amountPaid);
      const purchaseDate = input.purchaseDate || new Date().toISOString().slice(0, 10);
      const adminName = input.adminName || 'Alex Mercer';
      const poNumber = `PO-2026-${String(this.purchases.length + 101).padStart(4, '0')}`;
      const poId = `po_${Date.now()}`;

      // 1. UPDATE INVENTORY
      let invItem = this.inventory.find(
        (inv) => inv.productId === product.id && inv.size === input.size
      );

      const variantSku = `${product.sku}-${input.size}`;
      const prevAvail = invItem ? (invItem.available ?? invItem.currentStock ?? 0) : 0;
      const prevReserved = invItem ? (invItem.reserved ?? invItem.reservedStock ?? 0) : 0;
      const prevSold = invItem ? (invItem.sold ?? 0) : 0;
      const prevReturned = invItem ? (invItem.returned ?? 0) : 0;
      const prevDamaged = invItem ? (invItem.damaged ?? 0) : 0;
      const prevLost = invItem ? (invItem.lost ?? 0) : 0;

      if (!invItem) {
        invItem = {
          id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          productId: product.id,
          variantId: `var_${Date.now()}_${input.size}`,
          productTitle: product.title,
          sku: variantSku,
          variantSku: variantSku,
          size: input.size as JerseySize,
          available: quantity,
          reserved: 0,
          sold: 0,
          returned: 0,
          damaged: 0,
          lost: 0,
          currentStock: quantity,
          availableQuantity: quantity,
          reservedStock: 0,
          reservedQuantity: 0,
          reorderPoint: 10,
          safetyStock: 10,
          costPerUnit: buyingPrice,
          sellingPrice: product.basePrice,
          warehouseLocation: 'Bin Main Warehouse',
          status: quantity <= 10 ? 'LOW_STOCK' : 'IN_STOCK',
          updatedAt: new Date().toISOString(),
        };
        this.inventory.push(invItem);
      } else {
        invItem.available = (invItem.available || 0) + quantity;
        invItem.currentStock = (invItem.currentStock || 0) + quantity;
        invItem.availableQuantity = invItem.available;
        invItem.costPerUnit = buyingPrice; // update buying cost
        invItem.status = invItem.available <= (invItem.safetyStock ?? invItem.reorderPoint) ? 'LOW_STOCK' : 'IN_STOCK';
        invItem.updatedAt = new Date().toISOString();
      }

      // Update product variant stock and costPrice
      const variant = product.variants.find((v) => v.size === input.size || v.sku === variantSku);
      if (variant) {
        variant.stockQuantity = (variant.stockQuantity || 0) + quantity;
      } else {
        product.variants.push({
          id: `var_${Date.now()}_${input.size}`,
          productId: product.id,
          sku: variantSku,
          size: input.size as JerseySize,
          stockQuantity: quantity,
        });
      }
      product.costPrice = buyingPrice;

      // Record immutable InventoryTransaction
      const invTransaction: InventoryTransaction = {
        id: `itx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        productId: product.id,
        productTitle: product.title,
        variantSku: invItem.variantSku || invItem.sku,
        size: input.size,
        type: 'PURCHASE_RESTOCK',
        quantity: quantity,
        previousQuantity: {
          available: prevAvail,
          reserved: prevReserved,
          sold: prevSold,
          returned: prevReturned,
          damaged: prevDamaged,
          lost: prevLost,
        },
        newQuantity: {
          available: invItem.available,
          reserved: prevReserved,
          sold: prevSold,
          returned: prevReturned,
          damaged: prevDamaged,
          lost: prevLost,
        },
        reason: `PO Inbound Restock: Received ${quantity} pcs from ${supplier.name} via ${poNumber}. Notes: ${input.notes || 'Purchasing and restocking'}`,
        admin: adminName,
        timestamp: new Date().toISOString(),
        reference: poNumber,
      };
      this.inventoryTransactions.unshift(invTransaction);

      // 2. UPDATE PURCHASE HISTORY
      const purchaseItem: PurchaseItem = {
        id: `poi_${Date.now()}`,
        productId: product.id,
        productTitle: product.title,
        sku: product.sku,
        variantSku: variantSku,
        size: input.size as JerseySize,
        quantity,
        buyingPrice,
        totalCost,
      };

      const newPurchase: PurchaseOrder = {
        id: poId,
        poNumber,
        supplierId: supplier.id,
        supplierName: supplier.name,
        status: supplierDue === 0 ? 'RECEIVED' : 'PARTIAL',
        productId: product.id,
        productTitle: product.title,
        size: input.size,
        quantity,
        buyingPrice,
        totalCost,
        amountPaid,
        supplierDue,
        purchaseDate,
        orderedDate: purchaseDate,
        notes: input.notes || '',
        createdBy: adminName,
        itemsCount: quantity,
        items: [purchaseItem],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.purchases.unshift(newPurchase);

      // 3. UPDATE SUPPLIER BALANCE
      supplier.totalSpend = (supplier.totalSpend || 0) + totalCost;
      supplier.totalPaid = (supplier.totalPaid || 0) + amountPaid;
      supplier.supplierDue = (supplier.supplierDue || 0) + supplierDue;
      supplier.activeOrdersCount = (supplier.activeOrdersCount || 0) + 1;
      supplier.updatedAt = new Date().toISOString();

      // 4. UPDATE CASH TRANSACTION IF PAYMENT OCCURRED
      // CRITICAL: Only amountPaid affects current cash outflow!
      // "Do not subtract the full ৳10,000 from cash if only ৳6,000 was paid."
      if (amountPaid > 0) {
        const cashEntry: CashbookEntry = {
          id: `csh_${Date.now()}`,
          entryNumber: `CB-OUT-${Date.now().toString().slice(-6)}`,
          type: 'DEBIT',
          entryType: 'OUTFLOW',
          category: 'Supplier Payment',
          amount: amountPaid,
          account: 'Operating Cash Reserve',
          description: `Supplier Procurement Payment for PO #${poNumber} (${supplier.name}) - ${product.title} (${quantity} pcs Size ${input.size}). Paid ৳${amountPaid.toLocaleString()} of total ৳${totalCost.toLocaleString()}`,
          recordedBy: adminName,
          entryDate: purchaseDate,
          timestamp: new Date().toISOString(),
          referenceCode: poNumber,
        };
        this.cashbook.unshift(cashEntry);
      }

      // 5. UPDATE ACTIVITY LOG
      this.logActivity(
        `Created Purchase ${poNumber} with ${supplier.name} for ৳${totalCost.toLocaleString()} (${quantity} pcs of ${product.title} [${input.size}]). Paid: ৳${amountPaid.toLocaleString()}, Supplier Due: ৳${supplierDue.toLocaleString()}`,
        'PURCHASES',
        adminName,
        poNumber,
        adminName
      );

      // Commit all changes to persistent storage
      this.saveInventory();
      this.saveTransactions();
      this.saveProducts();
      this.savePurchases();
      this.saveSuppliers();
      this.saveCashbook();
      this.saveLogs();

      return { success: true, purchase: newPurchase };
    } catch (err: any) {
      // Database Transaction Rollback
      this.inventory = inventorySnapshot;
      this.inventoryTransactions = transactionsSnapshot;
      this.purchases = purchasesSnapshot;
      this.suppliers = suppliersSnapshot;
      this.cashbook = cashbookSnapshot;
      this.logs = logsSnapshot;
      this.products = productsSnapshot;
      return { success: false, error: err.message || 'Transaction aborted. All states safely reverted.' };
    }
  }

  // --------------------------------------------------------------------------
  // CENTRALIZED CASH & TREASURY TRANSACTION SYSTEM
  // --------------------------------------------------------------------------

  /**
   * Central Cash Engine: Every financial inflow/outflow must pass through here
   * to guarantee zero double-counting, full traceability, and accurate balances.
   */
  recordCashTransaction(params: {
    type: 'INFLOW' | 'OUTFLOW';
    category: string;
    amount: number;
    description: string;
    referenceCode: string;
    recordedBy: string;
    entryDate?: string;
    account?: string;
  }): { success: boolean; entry?: CashbookEntry; error?: string } {
    if (!params.amount || params.amount <= 0) {
      return { success: false, error: 'Transaction amount must be strictly greater than zero.' };
    }
    if (!params.description || !params.category) {
      return { success: false, error: 'Transaction category and description are mandatory.' };
    }

    const entryDate = params.entryDate || new Date().toISOString().slice(0, 10);
    const entryId = `csh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const prefix = params.type === 'INFLOW' ? 'CB-IN' : 'CB-OUT';
    const entryNumber = `${prefix}-${Date.now().toString().slice(-6)}`;

    const newEntry: CashbookEntry = {
      id: entryId,
      entryNumber,
      date: entryDate,
      entryDate,
      timestamp: new Date().toISOString(),
      type: params.type === 'INFLOW' ? 'CREDIT' : 'DEBIT',
      entryType: params.type,
      category: params.category,
      amount: Math.round(params.amount),
      description: params.description,
      account: params.account || (params.type === 'INFLOW' ? 'Primary Business Current Account' : 'Operating Cash Reserve'),
      recordedBy: params.recordedBy || 'Finance Admin',
      referenceCode: params.referenceCode,
    };

    this.cashbook.unshift(newEntry);
    this.saveCashbook();
    return { success: true, entry: newEntry };
  }

  /**
   * Cashbook with dynamic chronological running balance
   */
  getCashbook(): CashbookEntry[] {
    // Sort ascending by chronological date and creation to accurately calculate running ledger balance
    const sortedAsc = [...this.cashbook].sort((a, b) => {
      const timeA = new Date(a.entryDate || a.date || a.timestamp || 0).getTime();
      const timeB = new Date(b.entryDate || b.date || b.timestamp || 0).getTime();
      return timeA - timeB;
    });

    let runningLedger = 0;
    const withRunningBalance = sortedAsc.map((entry) => {
      const isInflow = entry.entryType === 'INFLOW' || entry.type === 'CREDIT';
      runningLedger += isInflow ? entry.amount : -entry.amount;
      return {
        ...entry,
        balance: runningLedger,
      };
    });

    // Return descending for UI presentation (latest on top)
    return withRunningBalance.reverse();
  }

  getCashbookSummary(): { currentBalance: number; totalIn: number; totalOut: number } {
    let totalIn = 0;
    let totalOut = 0;
    for (const entry of this.cashbook) {
      if (entry.entryType === 'INFLOW' || entry.type === 'CREDIT') {
        totalIn += entry.amount;
      } else {
        totalOut += entry.amount;
      }
    }
    return {
      totalIn,
      totalOut,
      currentBalance: totalIn - totalOut,
    };
  }

  // --------------------------------------------------------------------------
  // EXPENSES MANAGEMENT
  // --------------------------------------------------------------------------

  getExpenses(): Expense[] {
    return this.expenses.filter((e) => !e.isDeleted);
  }

  addExpense(input: CreateExpenseInput): { success: boolean; expense?: Expense; error?: string } {
    if (!input.amount || input.amount <= 0) {
      return { success: false, error: 'Expense amount must be greater than zero.' };
    }
    if (!input.category || !input.description || !input.paymentMethod) {
      return { success: false, error: 'Category, description, and payment method are required.' };
    }

    // Database transaction with rollback safety
    const expensesSnapshot = [...this.expenses];
    const cashbookSnapshot = [...this.cashbook];
    const logsSnapshot = [...this.logs];

    try {
      const voucherNo = `EXP-${new Date().getFullYear()}-${String(this.expenses.length + 1).padStart(3, '0')}`;
      const expenseId = `exp_${Date.now()}`;
      const expenseDate = input.date || new Date().toISOString().slice(0, 10);

      const newExpense: Expense = {
        id: expenseId,
        voucherNo,
        title: input.description,
        category: input.category,
        amount: Math.round(input.amount),
        expenseDate,
        date: expenseDate,
        description: input.description,
        paymentMethod: input.paymentMethod,
        notes: input.notes || '',
        addedBy: input.addedBy || 'Finance Admin',
        status: 'PAID',
      };

      this.expenses.unshift(newExpense);

      // Central cash outflow
      const cashRes = this.recordCashTransaction({
        type: 'OUTFLOW',
        category: input.category,
        amount: newExpense.amount,
        description: `Expense: ${input.description} [${input.category}] (Paid via ${input.paymentMethod})`,
        referenceCode: voucherNo,
        recordedBy: newExpense.addedBy,
        entryDate: expenseDate,
        account: input.paymentMethod,
      });

      if (!cashRes.success) {
        throw new Error(cashRes.error || 'Failed to record cash outflow');
      }

      this.logActivity(
        `Recorded expense voucher ${voucherNo} for ৳${newExpense.amount.toLocaleString()} (${input.category} - ${input.description})`,
        'FINANCE',
        newExpense.addedBy,
        voucherNo,
        newExpense.addedBy
      );

      this.saveExpenses();
      return { success: true, expense: newExpense };
    } catch (err: any) {
      this.expenses = expensesSnapshot;
      this.cashbook = cashbookSnapshot;
      this.logs = logsSnapshot;
      return { success: false, error: err.message || 'Transaction failed. Rolled back.' };
    }
  }

  // --------------------------------------------------------------------------
  // INVESTMENTS MANAGEMENT (OWNERS & EXTERNAL INVESTORS)
  // --------------------------------------------------------------------------

  getInvestments(): Investment[] {
    return this.investments;
  }

  addOwnerInvestment(input: CreateOwnerInvestmentInput): { success: boolean; investment?: Investment; error?: string } {
    if (!input.amount || input.amount <= 0) {
      return { success: false, error: 'Investment amount must be greater than zero.' };
    }
    if (!input.investor) {
      return { success: false, error: 'Investor name is required.' };
    }

    const investmentsSnapshot = [...this.investments];
    const cashbookSnapshot = [...this.cashbook];
    const logsSnapshot = [...this.logs];

    try {
      const ownerCount = this.investments.filter((i) => (i.investorType || 'OWNER') === 'OWNER').length + 1;
      const refCode = `INV-OWN-${String(ownerCount).padStart(2, '0')}`;
      const invDate = input.date || new Date().toISOString().slice(0, 10);

      const newInvestment: Investment = {
        id: `inv_${Date.now()}`,
        investmentNumber: refCode,
        investor: input.investor,
        investorName: input.investor,
        investorType: 'OWNER',
        amount: Math.round(input.amount),
        date: invDate,
        fundingDate: invDate,
        status: 'ACTIVE',
        notes: input.notes || 'Founder equity capital addition',
      };

      this.investments.unshift(newInvestment);

      const cashRes = this.recordCashTransaction({
        type: 'INFLOW',
        category: 'Owner Capital Investment',
        amount: newInvestment.amount,
        description: `Owner capital injection from ${input.investor}. Notes: ${input.notes || 'Equity capital'}`,
        referenceCode: refCode,
        recordedBy: input.addedBy || input.investor,
        entryDate: invDate,
      });

      if (!cashRes.success) {
        throw new Error(cashRes.error || 'Failed to record cash inflow for investment');
      }

      this.logActivity(
        `Added founder capital investment of ৳${newInvestment.amount.toLocaleString()} from ${input.investor}`,
        'FINANCE',
        input.addedBy || input.investor,
        refCode,
        input.addedBy || input.investor
      );

      this.saveInvestments();
      return { success: true, investment: newInvestment };
    } catch (err: any) {
      this.investments = investmentsSnapshot;
      this.cashbook = cashbookSnapshot;
      this.logs = logsSnapshot;
      return { success: false, error: err.message || 'Transaction failed. Rolled back.' };
    }
  }

  addExternalInvestment(input: CreateExternalInvestmentInput): { success: boolean; investment?: Investment; error?: string } {
    if (!input.investmentAmount || input.investmentAmount <= 0) {
      return { success: false, error: 'Investment amount must be greater than zero.' };
    }
    if (!input.name) {
      return { success: false, error: 'External investor name is required.' };
    }

    const investmentsSnapshot = [...this.investments];
    const cashbookSnapshot = [...this.cashbook];
    const logsSnapshot = [...this.logs];

    try {
      const extCount = this.investments.filter((i) => i.investorType === 'EXTERNAL').length + 1;
      const refCode = `INV-EXT-${String(extCount).padStart(2, '0')}`;
      const invDate = input.date || new Date().toISOString().slice(0, 10);

      const newInvestment: Investment = {
        id: `inv_ext_${Date.now()}`,
        investmentNumber: refCode,
        investor: input.name,
        investorName: input.name,
        investorType: 'EXTERNAL',
        amount: Math.round(input.investmentAmount),
        sharePercentage: input.sharePercentage,
        equityShare: input.sharePercentage,
        date: invDate,
        fundingDate: invDate,
        status: 'ACTIVE',
        notes: input.notes || 'External angel/strategic capital',
      };

      this.investments.unshift(newInvestment);

      const cashRes = this.recordCashTransaction({
        type: 'INFLOW',
        category: 'External Equity Investment',
        amount: newInvestment.amount,
        description: `External investor financing from ${input.name} (${input.sharePercentage}% Equity). Notes: ${input.notes || ''}`,
        referenceCode: refCode,
        recordedBy: input.addedBy || 'Finance Admin',
        entryDate: invDate,
      });

      if (!cashRes.success) {
        throw new Error(cashRes.error || 'Failed to record cash inflow for external investment');
      }

      this.logActivity(
        `Recorded external investment of ৳${newInvestment.amount.toLocaleString()} from ${input.name} (${input.sharePercentage}% Equity)`,
        'FINANCE',
        input.addedBy || 'Finance Admin',
        refCode,
        input.addedBy || 'Finance Admin'
      );

      this.saveInvestments();
      return { success: true, investment: newInvestment };
    } catch (err: any) {
      this.investments = investmentsSnapshot;
      this.cashbook = cashbookSnapshot;
      this.logs = logsSnapshot;
      return { success: false, error: err.message || 'Transaction failed. Rolled back.' };
    }
  }

  getInvestmentSummary() {
    const totalInvestment = this.investments.reduce((sum, i) => sum + i.amount, 0);
    const ownerInvestmentsList = this.investments.filter((i) => (i.investorType || 'OWNER') === 'OWNER');
    const externalInvestmentsList = this.investments.filter((i) => i.investorType === 'EXTERNAL');

    const totalOwnerInvestment = ownerInvestmentsList.reduce((sum, i) => sum + i.amount, 0);
    const totalExternalInvestment = externalInvestmentsList.reduce((sum, i) => sum + i.amount, 0);

    // Track the 3 owners explicitly
    const ownersBreakdown = BUSINESS_OWNERS.map((ownerName) => {
      const records = ownerInvestmentsList.filter(
        (i) => i.investor.toLowerCase() === ownerName.toLowerCase() || (i.investorName || '').toLowerCase() === ownerName.toLowerCase()
      );
      const amount = records.reduce((sum, r) => sum + r.amount, 0);
      const percentage = totalOwnerInvestment > 0 ? (amount / totalOwnerInvestment) * 100 : 0;
      return {
        name: ownerName,
        amount,
        count: records.length,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    const totalWithdrawals = this.withdrawals.reduce((sum, w) => sum + w.amount, 0);
    const netOwnerCapital = totalOwnerInvestment - totalWithdrawals;

    return {
      totalInvestment,
      totalOwnerInvestment,
      totalExternalInvestment,
      ownersBreakdown,
      externalInvestors: externalInvestmentsList,
      totalWithdrawals,
      netOwnerCapital,
    };
  }

  // --------------------------------------------------------------------------
  // WITHDRAWALS MANAGEMENT
  // --------------------------------------------------------------------------

  getWithdrawals(): Withdrawal[] {
    return this.withdrawals;
  }

  addWithdrawal(input: CreateWithdrawalInput): { success: boolean; withdrawal?: Withdrawal; error?: string } {
    if (!input.amount || input.amount <= 0) {
      return { success: false, error: 'Withdrawal amount must be greater than zero.' };
    }
    if (!input.person || !input.reason) {
      return { success: false, error: 'Person and reason are required.' };
    }

    const withdrawalsSnapshot = [...this.withdrawals];
    const cashbookSnapshot = [...this.cashbook];
    const logsSnapshot = [...this.logs];

    try {
      const withdrawalNumber = `WDN-${new Date().getFullYear()}-${String(this.withdrawals.length + 1).padStart(3, '0')}`;
      const withdrawalDate = input.date || new Date().toISOString().slice(0, 10);

      const newWithdrawal: Withdrawal = {
        id: `wdn_${Date.now()}`,
        withdrawalNumber,
        person: input.person,
        amount: Math.round(input.amount),
        date: withdrawalDate,
        reason: input.reason,
        notes: input.notes || '',
        addedBy: input.addedBy || input.person,
      };

      this.withdrawals.unshift(newWithdrawal);

      const cashRes = this.recordCashTransaction({
        type: 'OUTFLOW',
        category: 'Capital Withdrawal',
        amount: newWithdrawal.amount,
        description: `Partner drawings / capital withdrawal by ${input.person}. Reason: ${input.reason}. Notes: ${input.notes || ''}`,
        referenceCode: withdrawalNumber,
        recordedBy: newWithdrawal.addedBy,
        entryDate: withdrawalDate,
      });

      if (!cashRes.success) {
        throw new Error(cashRes.error || 'Failed to record cash outflow for withdrawal');
      }

      this.logActivity(
        `Recorded partner withdrawal ${withdrawalNumber} of ৳${newWithdrawal.amount.toLocaleString()} by ${input.person}`,
        'FINANCE',
        newWithdrawal.addedBy,
        withdrawalNumber,
        newWithdrawal.addedBy
      );

      this.saveWithdrawals();
      return { success: true, withdrawal: newWithdrawal };
    } catch (err: any) {
      this.withdrawals = withdrawalsSnapshot;
      this.cashbook = cashbookSnapshot;
      this.logs = logsSnapshot;
      return { success: false, error: err.message || 'Transaction failed. Rolled back.' };
    }
  }

  // --------------------------------------------------------------------------
  // LOANS MANAGEMENT (FACILITIES & REPAYMENTS)
  // --------------------------------------------------------------------------

  getLoans(): Loan[] {
    return this.loans;
  }

  createLoan(input: CreateLoanInput): { success: boolean; loan?: Loan; error?: string } {
    if (!input.amount || input.amount <= 0) {
      return { success: false, error: 'Loan principal amount must be greater than zero.' };
    }
    if (!input.lender || !input.dueDate) {
      return { success: false, error: 'Lender and due date are required.' };
    }

    const loansSnapshot = [...this.loans];
    const cashbookSnapshot = [...this.cashbook];
    const logsSnapshot = [...this.logs];

    try {
      const loanNumber = `LN-${new Date().getFullYear()}-${String(this.loans.length + 1).padStart(3, '0')}`;
      const loanDate = input.date || new Date().toISOString().slice(0, 10);
      const principal = Math.round(input.amount);

      const newLoan: Loan = {
        id: `ln_${Date.now()}`,
        loanNumber,
        lender: input.lender,
        principal,
        principalAmount: principal,
        balanceRemaining: principal,
        amountRepaid: 0,
        interestRate: input.interestRate || 0,
        dueDate: input.dueDate,
        date: loanDate,
        startDate: loanDate,
        status: 'ACTIVE',
        notes: input.notes || '',
        repayments: [],
      };

      this.loans.unshift(newLoan);

      const cashRes = this.recordCashTransaction({
        type: 'INFLOW',
        category: 'Commercial Loan Facility Received',
        amount: principal,
        description: `Loan disbursement received from ${input.lender}. Due Date: ${input.dueDate}. Notes: ${input.notes || ''}`,
        referenceCode: loanNumber,
        recordedBy: input.addedBy || 'Finance Admin',
        entryDate: loanDate,
      });

      if (!cashRes.success) {
        throw new Error(cashRes.error || 'Failed to record cash inflow for loan');
      }

      this.logActivity(
        `Created commercial loan facility ${loanNumber} of ৳${principal.toLocaleString()} from ${input.lender}`,
        'FINANCE',
        input.addedBy || 'Finance Admin',
        loanNumber,
        input.addedBy || 'Finance Admin'
      );

      this.saveLoans();
      return { success: true, loan: newLoan };
    } catch (err: any) {
      this.loans = loansSnapshot;
      this.cashbook = cashbookSnapshot;
      this.logs = logsSnapshot;
      return { success: false, error: err.message || 'Transaction failed. Rolled back.' };
    }
  }

  repayLoan(input: RepayLoanInput): { success: boolean; loan?: Loan; repayment?: LoanRepayment; error?: string } {
    const loan = this.loans.find((l) => l.id === input.loanId);
    if (!loan) {
      return { success: false, error: 'Loan record not found.' };
    }

    if (!input.amount || input.amount <= 0) {
      return { success: false, error: 'Repayment amount must be strictly greater than zero.' };
    }

    const currentRemaining = loan.balanceRemaining ?? Math.max(0, loan.principal - loan.amountRepaid);
    if (currentRemaining <= 0) {
      return { success: false, error: `Loan ${loan.loanNumber} has already been completely paid off.` };
    }

    if (input.amount > currentRemaining) {
      return {
        success: false,
        error: `Repayment of ৳${input.amount.toLocaleString()} exceeds the remaining due balance of ৳${currentRemaining.toLocaleString()}.`,
      };
    }

    const loansSnapshot = JSON.parse(JSON.stringify(this.loans));
    const cashbookSnapshot = [...this.cashbook];
    const logsSnapshot = [...this.logs];

    try {
      const repayDate = input.date || new Date().toISOString().slice(0, 10);
      const repayAmount = Math.round(input.amount);
      const newAmountRepaid = loan.amountRepaid + repayAmount;
      const newBalanceRemaining = Math.max(0, currentRemaining - repayAmount);

      const repaymentNumber = `REP-${loan.loanNumber}-${String((loan.repayments?.length || 0) + 1).padStart(2, '0')}`;
      const repaymentRecord: LoanRepayment = {
        id: `rep_${Date.now()}`,
        loanId: loan.id,
        repaymentNumber,
        referenceCode: repaymentNumber,
        amount: repayAmount,
        date: repayDate,
        notes: input.notes || 'Principal debt repayment',
        recordedBy: input.addedBy || 'Finance Admin',
        createdAt: new Date().toISOString(),
      };

      loan.amountRepaid = newAmountRepaid;
      loan.balanceRemaining = newBalanceRemaining;
      if (newBalanceRemaining === 0) {
        loan.status = 'PAID_OFF';
      }
      if (!loan.repayments) {
        loan.repayments = [];
      }
      loan.repayments.unshift(repaymentRecord);

      const cashRes = this.recordCashTransaction({
        type: 'OUTFLOW',
        category: 'Loan Debt Repayment',
        amount: repayAmount,
        description: `Loan repayment for ${loan.loanNumber} (${loan.lender}). Remaining due: ৳${newBalanceRemaining.toLocaleString()}`,
        referenceCode: repaymentNumber,
        recordedBy: input.addedBy || 'Finance Admin',
        entryDate: repayDate,
      });

      if (!cashRes.success) {
        throw new Error(cashRes.error || 'Failed to record cash outflow for loan repayment');
      }

      this.logActivity(
        `Recorded loan repayment ${repaymentNumber} of ৳${repayAmount.toLocaleString()} for loan ${loan.loanNumber} (${loan.lender})`,
        'FINANCE',
        input.addedBy || 'Finance Admin',
        repaymentNumber,
        input.addedBy || 'Finance Admin'
      );

      this.saveLoans();
      return { success: true, loan, repayment: repaymentRecord };
    } catch (err: any) {
      this.loans = loansSnapshot;
      this.cashbook = cashbookSnapshot;
      this.logs = logsSnapshot;
      return { success: false, error: err.message || 'Transaction failed. Rolled back.' };
    }
  }

  getLoanSummary() {
    const totalBorrowed = this.loans.reduce((sum, l) => sum + l.principal, 0);
    const totalRepaid = this.loans.reduce((sum, l) => sum + l.amountRepaid, 0);
    const activeLoans = this.loans.filter((l) => l.status === 'ACTIVE');
    const outstandingLoan = activeLoans.reduce((sum, l) => sum + (l.balanceRemaining ?? Math.max(0, l.principal - l.amountRepaid)), 0);

    return {
      totalBorrowed,
      totalRepaid,
      outstandingLoan,
      activeLoansCount: activeLoans.length,
      activeLoans,
    };
  }

  getReturns(): ReturnRequest[] {
    return this.returns;
  }

  getActivityLogs(): ActivityLog[] {
    return this.logs;
  }

  logActivity(
    actionOrConfig:
      | string
      | {
          admin?: string;
          action: string;
          entity?: string;
          recordId?: string;
          previousValue?: any;
          newValue?: any;
          details?: string;
          module?: string;
        },
    module?: string,
    userName?: string,
    relatedEntity?: string,
    adminName?: string
  ): void {
    if (typeof actionOrConfig === 'object') {
      const {
        admin = 'Admin',
        action,
        entity = 'General',
        recordId = 'N/A',
        previousValue = null,
        newValue = null,
        details = '',
        module: mod = 'SYSTEM',
      } = actionOrConfig;

      this.logs.unshift({
        id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        admin,
        userName: admin,
        action,
        entity,
        recordId,
        previousValue: previousValue !== null && previousValue !== undefined ? String(previousValue) : undefined,
        newValue: newValue !== null && newValue !== undefined ? String(newValue) : undefined,
        module: mod,
        relatedEntity: `${entity} #${recordId}`,
        details,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100 (Internal Secure LAN)',
      });
    } else {
      this.logs.unshift({
        id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userName: userName || 'Admin',
        admin: adminName || userName || 'Admin',
        action: actionOrConfig,
        module: module || 'GENERAL',
        relatedEntity: relatedEntity || `${module || 'System'} transaction`,
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.100 (Internal Secure LAN)',
      });
    }
    this.saveLogs();
  }

  // --------------------------------------------------------------------------
  // BUSINESS SETTINGS
  // --------------------------------------------------------------------------
  getBusinessSettings(): BusinessSettings {
    return this.businessSettings;
  }

  updateBusinessSettings(
    updates: Partial<BusinessSettings>,
    adminName: string = 'Super Admin'
  ): { success: boolean; settings: BusinessSettings } {
    this.businessSettings = {
      ...this.businessSettings,
      ...updates,
      address: { ...this.businessSettings.address, ...(updates.address || {}) },
      socialMedia: { ...this.businessSettings.socialMedia, ...(updates.socialMedia || {}) },
      paymentNumbers: {
        bkash: { ...this.businessSettings.paymentNumbers.bkash, ...(updates.paymentNumbers?.bkash || {}) },
        nagad: { ...this.businessSettings.paymentNumbers.nagad, ...(updates.paymentNumbers?.nagad || {}) },
        rocket: { ...this.businessSettings.paymentNumbers.rocket, ...(updates.paymentNumbers?.rocket || {}) },
      },
      deliveryCharge: { ...this.businessSettings.deliveryCharge, ...(updates.deliveryCharge || {}) },
      policies: { ...this.businessSettings.policies, ...(updates.policies || {}) },
      orderSettings: { ...this.businessSettings.orderSettings, ...(updates.orderSettings || {}) },
    };

    this.saveBusinessSettings();

    // Synchronize configured payment numbers to paymentConfigs so customer checkout page reflects them dynamically!
    const bkashConfig = this.businessSettings.paymentNumbers.bkash;
    const nagadConfig = this.businessSettings.paymentNumbers.nagad;
    const rocketConfig = this.businessSettings.paymentNumbers.rocket;

    this.paymentConfigs = this.paymentConfigs.map((cfg) => {
      if (cfg.name === 'bKash' || cfg.id === 'bKash') {
        return {
          ...cfg,
          accountNumber: bkashConfig.number,
          accountType: bkashConfig.type,
          isActive: bkashConfig.isActive,
          instructions: bkashConfig.instructions,
        };
      }
      if (cfg.name === 'Nagad' || cfg.id === 'Nagad') {
        return {
          ...cfg,
          accountNumber: nagadConfig.number,
          accountType: nagadConfig.type,
          isActive: nagadConfig.isActive,
          instructions: nagadConfig.instructions,
        };
      }
      if (cfg.name === 'Rocket' || cfg.id === 'Rocket') {
        return {
          ...cfg,
          accountNumber: rocketConfig.number,
          accountType: rocketConfig.type,
          isActive: rocketConfig.isActive,
          instructions: rocketConfig.instructions,
        };
      }
      return cfg;
    });
    this.savePaymentConfigs();

    this.logActivity({
      admin: adminName,
      action: 'Updated Business Profile, Delivery Rates & Payment Gateways',
      entity: 'Settings',
      recordId: 'BUSINESS_CONFIG',
      details: `Saved settings for ${this.businessSettings.name}`,
      module: 'GOVERNANCE',
    });

    return { success: true, settings: this.businessSettings };
  }

  // --------------------------------------------------------------------------
  // ADMIN NOTIFICATIONS
  // --------------------------------------------------------------------------
  getAdminNotifications(): AdminNotification[] {
    return this.adminNotifications;
  }

  addAdminNotification(notification: Omit<AdminNotification, 'id' | 'createdAt'>): AdminNotification {
    const newNotif: AdminNotification = {
      ...notification,
      id: `admin_notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.adminNotifications.unshift(newNotif);
    this.saveAdminNotifications();
    return newNotif;
  }

  markAdminNotificationRead(id: string): void {
    const notif = this.adminNotifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.saveAdminNotifications();
    }
  }

  markAllAdminNotificationsRead(): void {
    this.adminNotifications.forEach((n) => (n.isRead = true));
    this.saveAdminNotifications();
  }

  deleteAdminNotification(id: string): void {
    this.adminNotifications = this.adminNotifications.filter((n) => n.id !== id);
    this.saveAdminNotifications();
  }

  // --------------------------------------------------------------------------
  // RECYCLE BIN & SOFT DELETE (DATA INTEGRITY PRESERVATION)
  // --------------------------------------------------------------------------
  getRecycleBin(): SoftDeletedItem[] {
    return this.recycleBin;
  }

  softDeleteProduct(id: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    const product = this.products.find((p) => p.id === id);
    if (!product) return { success: false, message: 'Product not found.' };

    product.isDeleted = true;
    product.deletedAt = new Date().toISOString();
    product.deletedBy = adminName;
    this.saveProducts();

    const recycleItem: SoftDeletedItem = {
      id: `rb_${Date.now()}`,
      entityType: 'Product',
      recordId: product.id,
      title: product.title,
      identifier: product.sku || product.slug || product.id,
      deletedAt: product.deletedAt,
      deletedBy: adminName,
      originalData: { ...product },
      canPermanentlyDelete: true,
    };

    this.recycleBin.unshift(recycleItem);
    this.saveRecycleBin();

    this.logActivity({
      admin: adminName,
      action: `Moved product "${product.title}" to Recycle Bin`,
      entity: 'Product',
      recordId: product.id,
      module: 'CATALOG',
    });

    return { success: true, message: `Product "${product.title}" moved to Recycle Bin.` };
  }

  softDeleteOrder(id: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    const order = this.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) return { success: false, message: 'Order not found.' };

    order.isDeleted = true;
    order.deletedAt = new Date().toISOString();
    order.deletedBy = adminName;
    this.saveOrders();

    const hasFinancialAudit = (order.amountPaid || 0) > 0;

    const recycleItem: SoftDeletedItem = {
      id: `rb_${Date.now()}`,
      entityType: 'Order',
      recordId: order.id,
      title: `Order ${order.orderNumber} (${order.customerName})`,
      identifier: order.orderNumber,
      deletedAt: order.deletedAt,
      deletedBy: adminName,
      originalData: { ...order },
      canPermanentlyDelete: !hasFinancialAudit,
    };

    this.recycleBin.unshift(recycleItem);
    this.saveRecycleBin();

    this.logActivity({
      admin: adminName,
      action: `Soft deleted order ${order.orderNumber}`,
      entity: 'Order',
      recordId: order.orderNumber,
      module: 'ORDERS',
    });

    return { success: true, message: `Order ${order.orderNumber} moved to Recycle Bin.` };
  }

  softDeleteSupplier(id: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    const supplier = this.suppliers.find((s) => s.id === id || s.code === id);
    if (!supplier) return { success: false, message: 'Supplier not found.' };

    supplier.isDeleted = true;
    supplier.deletedAt = new Date().toISOString();
    supplier.deletedBy = adminName;
    this.saveSuppliers();

    const recycleItem: SoftDeletedItem = {
      id: `rb_${Date.now()}`,
      entityType: 'Supplier',
      recordId: supplier.id,
      title: supplier.name,
      identifier: supplier.code,
      deletedAt: supplier.deletedAt,
      deletedBy: adminName,
      originalData: { ...supplier },
      canPermanentlyDelete: (supplier.totalSpend || 0) === 0,
    };

    this.recycleBin.unshift(recycleItem);
    this.saveRecycleBin();

    this.logActivity({
      admin: adminName,
      action: `Soft deleted supplier ${supplier.name}`,
      entity: 'Supplier',
      recordId: supplier.code,
      module: 'SUPPLIERS',
    });

    return { success: true, message: `Supplier "${supplier.name}" moved to Recycle Bin.` };
  }

  softDeletePurchase(id: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    const purchase = this.purchases.find((p) => p.id === id || p.poNumber === id);
    if (!purchase) return { success: false, message: 'Purchase order not found.' };

    purchase.isDeleted = true;
    purchase.deletedAt = new Date().toISOString();
    purchase.deletedBy = adminName;
    this.savePurchases();

    const recycleItem: SoftDeletedItem = {
      id: `rb_${Date.now()}`,
      entityType: 'Purchase',
      recordId: purchase.id,
      title: `PO ${purchase.poNumber} (${purchase.supplierName})`,
      identifier: purchase.poNumber,
      deletedAt: purchase.deletedAt,
      deletedBy: adminName,
      originalData: { ...purchase },
      canPermanentlyDelete: (purchase.amountPaid || 0) === 0,
    };

    this.recycleBin.unshift(recycleItem);
    this.saveRecycleBin();

    this.logActivity({
      admin: adminName,
      action: `Soft deleted purchase order ${purchase.poNumber}`,
      entity: 'Purchase',
      recordId: purchase.poNumber,
      module: 'PROCUREMENT',
    });

    return { success: true, message: `Purchase order ${purchase.poNumber} moved to Recycle Bin.` };
  }

  softDeleteExpense(id: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    const expense = this.expenses.find((e) => e.id === id || e.voucherNo === id || e.voucherNumber === id);
    if (!expense) return { success: false, message: 'Expense voucher not found.' };

    expense.isDeleted = true;
    expense.deletedAt = new Date().toISOString();
    expense.deletedBy = adminName;
    this.saveExpenses();

    const voucherIdentifier = expense.voucherNo || expense.voucherNumber || expense.id;

    const recycleItem: SoftDeletedItem = {
      id: `rb_${Date.now()}`,
      entityType: 'Expense',
      recordId: expense.id,
      title: `Voucher ${voucherIdentifier} (${expense.category} - ৳${expense.amount.toLocaleString()})`,
      identifier: voucherIdentifier,
      deletedAt: expense.deletedAt,
      deletedBy: adminName,
      originalData: { ...expense },
      canPermanentlyDelete: false, // Expenses are immutable cash audit records
    };

    this.recycleBin.unshift(recycleItem);
    this.saveRecycleBin();

    this.logActivity({
      admin: adminName,
      action: `Soft deleted expense voucher ${voucherIdentifier}`,
      entity: 'Expense',
      recordId: voucherIdentifier,
      module: 'FINANCE',
    });

    return { success: true, message: `Expense voucher ${voucherIdentifier} moved to Recycle Bin.` };
  }

  restoreItem(recycleId: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    const item = this.recycleBin.find((r) => r.id === recycleId);
    if (!item) return { success: false, message: 'Item not found in Recycle Bin.' };

    if (item.entityType === 'Product') {
      const prod = this.products.find((p) => p.id === item.recordId);
      if (prod) {
        prod.isDeleted = false;
        delete prod.deletedAt;
        delete prod.deletedBy;
        this.saveProducts();
      }
    } else if (item.entityType === 'Order') {
      const ord = this.orders.find((o) => o.id === item.recordId);
      if (ord) {
        ord.isDeleted = false;
        delete ord.deletedAt;
        delete ord.deletedBy;
        this.saveOrders();
      }
    } else if (item.entityType === 'Supplier') {
      const sup = this.suppliers.find((s) => s.id === item.recordId);
      if (sup) {
        sup.isDeleted = false;
        delete sup.deletedAt;
        delete sup.deletedBy;
        this.saveSuppliers();
      }
    } else if (item.entityType === 'Purchase') {
      const po = this.purchases.find((p) => p.id === item.recordId);
      if (po) {
        po.isDeleted = false;
        delete po.deletedAt;
        delete po.deletedBy;
        this.savePurchases();
      }
    } else if (item.entityType === 'Expense') {
      const exp = this.expenses.find((e) => e.id === item.recordId);
      if (exp) {
        exp.isDeleted = false;
        delete exp.deletedAt;
        delete exp.deletedBy;
        this.saveExpenses();
      }
    }

    this.recycleBin = this.recycleBin.filter((r) => r.id !== recycleId);
    this.saveRecycleBin();

    this.logActivity({
      admin: adminName,
      action: `Restored ${item.entityType} "${item.title}" from Recycle Bin`,
      entity: item.entityType,
      recordId: item.identifier,
      module: 'RECYCLE_BIN',
    });

    return { success: true, message: `Successfully restored ${item.title}.` };
  }

  permanentDeleteItem(recycleId: string, adminName: string = 'Admin'): { success: boolean; message: string } {
    const item = this.recycleBin.find((r) => r.id === recycleId);
    if (!item) return { success: false, message: 'Item not found in Recycle Bin.' };

    // Financial History Safety Constraint
    if (!item.canPermanentlyDelete) {
      return {
        success: false,
        message: `Audit Protection Violation: Cannot permanently delete ${item.entityType} "${item.identifier}" because it contains historical financial cashbook entries. Financial history must remain intact.`,
      };
    }

    if (item.entityType === 'Product') {
      this.products = this.products.filter((p) => p.id !== item.recordId);
      this.saveProducts();
    } else if (item.entityType === 'Order') {
      this.orders = this.orders.filter((o) => o.id !== item.recordId);
      this.saveOrders();
    } else if (item.entityType === 'Supplier') {
      this.suppliers = this.suppliers.filter((s) => s.id !== item.recordId);
      this.saveSuppliers();
    } else if (item.entityType === 'Purchase') {
      this.purchases = this.purchases.filter((p) => p.id !== item.recordId);
      this.savePurchases();
    }

    this.recycleBin = this.recycleBin.filter((r) => r.id !== recycleId);
    this.saveRecycleBin();

    this.logActivity({
      admin: adminName,
      action: `Permanently deleted ${item.entityType} "${item.identifier}" from system`,
      entity: item.entityType,
      recordId: item.identifier,
      module: 'RECYCLE_BIN',
    });

    return { success: true, message: `Permanently removed ${item.title} from the database.` };
  }

  // --------------------------------------------------------------------------
  // ERP DATABASE BACKUP & EXPORT ENGINE
  // --------------------------------------------------------------------------
  exportAllBusinessDataJSON(): string {
    const backupPayload = {
      app: 'RAYVEN ERP',
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      businessSettings: this.businessSettings,
      products: this.products,
      inventory: this.inventory,
      inventoryTransactions: this.inventoryTransactions,
      orders: this.orders,
      suppliers: this.suppliers,
      purchases: this.purchases,
      cashbook: this.cashbook,
      expenses: this.expenses,
      loans: this.loans,
      investments: this.investments,
      withdrawals: this.withdrawals,
      returns: this.returns,
      paymentConfigs: this.paymentConfigs,
      adminNotifications: this.adminNotifications,
      logs: this.logs,
      recycleBin: this.recycleBin,
    };
    return JSON.stringify(backupPayload, null, 2);
  }

  exportOrdersCSV(): string {
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Division',
      'District',
      'Status',
      'Payment Status',
      'Subtotal (BDT)',
      'Delivery Fee (BDT)',
      'Discount (BDT)',
      'Total Amount (BDT)',
      'Amount Paid (BDT)',
      'Remaining Due (BDT)',
      'Payment Method',
    ];

    const rows = this.orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.createdAt.slice(0, 10)}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.customerEmail || ''}"`,
      `"${o.division || ''}"`,
      `"${o.district || ''}"`,
      `"${o.status}"`,
      `"${o.paymentStatus}"`,
      o.subtotal,
      o.shippingFee || 0,
      o.discountAmount || 0,
      o.totalAmount,
      o.amountPaid || 0,
      o.remainingDue || 0,
      `"${o.paymentMethod || o.paymentOption || ''}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  exportInventoryCSV(): string {
    const headers = [
      'SKU',
      'Product Title',
      'Size',
      'Club',
      'Available Qty',
      'Reserved Qty',
      'Sold Qty',
      'Damaged Qty',
      'Cost Per Unit (BDT)',
      'Selling Price (BDT)',
      'Total Asset Cost (BDT)',
      'Potential Retail Value (BDT)',
      'Safety Stock Reorder Point',
    ];

    const rows = this.inventory.map((i) => {
      const avail = i.available ?? i.availableQuantity ?? 0;
      const cost = i.costPerUnit || 600;
      const price = i.sellingPrice || 1400;
      return [
        `"${i.sku}"`,
        `"${(i.productTitle || '').replace(/"/g, '""')}"`,
        `"${i.size}"`,
        `"${i.club || 'Partner Club'}"`,
        avail,
        i.reserved ?? i.reservedStock ?? 0,
        i.sold ?? 0,
        i.damaged ?? 0,
        cost,
        price,
        avail * cost,
        avail * price,
        i.safetyStock ?? i.reorderPoint ?? 10,
      ];
    });

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  exportCashbookCSV(): string {
    const headers = [
      'Entry ID',
      'Date',
      'Flow Type',
      'Category',
      'Amount (BDT)',
      'Description',
      'Reference Code',
      'Balance After (BDT)',
      'Recorded By',
    ];

    const rows = this.cashbook.map((c) => [
      `"${c.id}"`,
      `"${c.entryDate || c.date || (c.timestamp ? c.timestamp.slice(0, 10) : '')}"`,
      `"${c.type}"`,
      `"${c.category}"`,
      c.amount,
      `"${(c.description || '').replace(/"/g, '""')}"`,
      `"${c.referenceCode || ''}"`,
      c.balanceAfter ?? c.balance ?? '',
      `"${c.recordedBy || 'Finance Admin'}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  exportExpensesCSV(): string {
    const headers = [
      'Voucher Number',
      'Date',
      'Category',
      'Description',
      'Amount (BDT)',
      'Payment Method',
      'Payee / Vendor',
      'Added By',
      'Notes',
    ];

    const rows = this.expenses.map((e) => [
      `"${e.voucherNo || e.voucherNumber || e.id}"`,
      `"${e.expenseDate || e.date || ''}"`,
      `"${e.category}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.amount,
      `"${e.paymentMethod}"`,
      `"${(e.payee || e.paidTo || '').replace(/"/g, '""')}"`,
      `"${e.addedBy || 'Finance Admin'}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  exportSuppliersCSV(): string {
    const headers = [
      'Supplier Code',
      'Company Name',
      'Phone',
      'Email',
      'Country',
      'Payment Terms',
      'Total Spend (BDT)',
      'Total Paid (BDT)',
      'Outstanding Due (BDT)',
      'Active Orders Count',
    ];

    const rows = this.suppliers.map((s) => [
      `"${s.code}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.phone}"`,
      `"${s.email || ''}"`,
      `"${s.country || 'Bangladesh'}"`,
      `"${s.paymentTerms || 'Net 30'}"`,
      s.totalSpend || 0,
      s.totalPaid || 0,
      s.supplierDue || 0,
      s.activeOrdersCount || 0,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  exportCustomerDuesCSV(): string {
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Phone',
      'Division',
      'Delivery Address',
      'Order Total (BDT)',
      'Advance Paid (BDT)',
      'Remaining Due Receivable (BDT)',
      'Order Status',
    ];

    const dueOrders = this.orders.filter((o) => !o.isDeleted && (o.remainingDue || 0) > 0);
    const rows = dueOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.createdAt.slice(0, 10)}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.division || ''}"`,
      `"${(o.fullAddress || '').replace(/"/g, '""')}"`,
      o.totalAmount,
      o.amountPaid || 0,
      o.remainingDue,
      `"${o.status}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  restoreBackupJSON(
    jsonStr: string,
    adminName: string = 'Super Admin'
  ): { success: boolean; message: string; recordCounts?: Record<string, number> } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Invalid backup file structure.' };
      }

      const counts: Record<string, number> = {};

      if (parsed.businessSettings && typeof parsed.businessSettings === 'object') {
        this.businessSettings = { ...DEFAULT_BUSINESS_SETTINGS, ...parsed.businessSettings };
        this.saveBusinessSettings();
        counts['Settings'] = 1;
      }
      if (Array.isArray(parsed.products)) {
        this.products = parsed.products;
        this.saveProducts();
        counts['Products'] = parsed.products.length;
      }
      if (Array.isArray(parsed.orders)) {
        this.orders = parsed.orders;
        this.saveOrders();
        counts['Orders'] = parsed.orders.length;
      }
      if (Array.isArray(parsed.inventory)) {
        this.inventory = parsed.inventory;
        this.saveInventory();
        counts['Inventory SKUs'] = parsed.inventory.length;
      }
      if (Array.isArray(parsed.suppliers)) {
        this.suppliers = parsed.suppliers;
        this.saveSuppliers();
        counts['Suppliers'] = parsed.suppliers.length;
      }
      if (Array.isArray(parsed.purchases)) {
        this.purchases = parsed.purchases;
        this.savePurchases();
        counts['Purchases'] = parsed.purchases.length;
      }
      if (Array.isArray(parsed.cashbook)) {
        this.cashbook = parsed.cashbook;
        this.saveCashbook();
        counts['Cashbook Records'] = parsed.cashbook.length;
      }
      if (Array.isArray(parsed.expenses)) {
        this.expenses = parsed.expenses;
        this.saveExpenses();
        counts['Expenses'] = parsed.expenses.length;
      }
      if (Array.isArray(parsed.loans)) {
        this.loans = parsed.loans;
        this.saveLoans();
        counts['Loans'] = parsed.loans.length;
      }
      if (Array.isArray(parsed.investments)) {
        this.investments = parsed.investments;
        this.saveInvestments();
        counts['Investments'] = parsed.investments.length;
      }

      this.logActivity({
        admin: adminName,
        action: 'Imported database snapshot from JSON backup',
        entity: 'Backup',
        recordId: 'RESTORE_SNAPSHOT',
        details: `Restored records: ${JSON.stringify(counts)}`,
        module: 'SECURITY',
      });

      return {
        success: true,
        message: 'Successfully restored ERP database from backup snapshot.',
        recordCounts: counts,
      };
    } catch (err: any) {
      return { success: false, message: `Backup restoration failed: ${err.message}` };
    }
  }

  // --------------------------------------------------------------------------
  // ADMIN DASHBOARD REAL DATABASE AGGREGATIONS
  // "Strictly respect USER INTENT: Order Info, Stock, Finance (Net Profit & Cash Balance)"
  // --------------------------------------------------------------------------
  getDashboardOrderStats() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const isOrderToday = (createdAt: string) => {
      if (!createdAt) return false;
      if (createdAt.startsWith('2026-09-16') || createdAt.startsWith(todayStr)) return true;
      const targetDate = new Date(createdAt);
      const diffHours = Math.abs(Date.now() - targetDate.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    };

    const allOrders = this.orders;
    const todayOrders = allOrders.filter((o) => isOrderToday(o.createdAt));
    const pendingOrders = allOrders.filter(
      (o) =>
        o.status === 'PENDING_PAYMENT' ||
        o.paymentStatus === 'UNDER_REVIEW' ||
        o.status === 'CONFIRMED' ||
        o.status === 'PACKED' ||
        o.status === 'IN_HUB' ||
        o.status === 'OUT_FOR_DELIVERY'
    );
    const deliveredOrders = allOrders.filter((o) => o.status === 'DELIVERED');
    const cancelledOrders = allOrders.filter((o) => o.status === 'CANCELLED');
    const returnedOrders = allOrders.filter(
      (o) => o.status === 'REFUNDED' || this.returns.some((r) => r.orderNumber === o.orderNumber)
    );

    return {
      todayOrdersCount: todayOrders.length,
      todayOrdersList: todayOrders,
      pendingOrdersCount: pendingOrders.length,
      pendingOrdersList: pendingOrders,
      deliveredOrdersCount: deliveredOrders.length,
      deliveredOrdersList: deliveredOrders,
      cancelledOrdersCount: cancelledOrders.length,
      cancelledOrdersList: cancelledOrders,
      returnedOrdersCount: returnedOrders.length,
      returnedOrdersList: returnedOrders,
      totalOrdersCount: allOrders.length,
    };
  }

  getDashboardStockStats() {
    const inventory = this.inventory;
    const availableStock = inventory.reduce(
      (sum, item) => sum + Math.max(0, (item.availableQuantity ?? (item.currentStock - (item.reservedStock || 0)))),
      0
    );
    const reservedStock = inventory.reduce((sum, item) => sum + (item.reservedStock || 0), 0);
    const returnedStock = this.returns.reduce((sum, r) => sum + 1, 0); // Each RMA accounts for returned physical units
    const lowStockItems = inventory.filter((item) => {
      const avail = item.availableQuantity ?? (item.currentStock - (item.reservedStock || 0));
      return avail <= (item.safetyStock ?? item.reorderPoint);
    });

    return {
      availableStock,
      reservedStock,
      returnedStock,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      totalStock: availableStock + reservedStock,
    };
  }

  getDashboardFinancials() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const isDateToday = (createdAt: string) => {
      if (!createdAt) return false;
      if (createdAt.startsWith('2026-09-16') || createdAt.startsWith(todayStr)) return true;
      const targetDate = new Date(createdAt);
      const diffHours = Math.abs(Date.now() - targetDate.getTime()) / (1000 * 60 * 60);
      return diffHours <= 24;
    };

    const isDateThisMonth = (createdAt: string) => {
      if (!createdAt) return false;
      if (createdAt.startsWith('2026-09')) return true;
      const targetDate = new Date(createdAt);
      const now = new Date();
      return targetDate.getUTCFullYear() === now.getUTCFullYear() && targetDate.getUTCMonth() === now.getUTCMonth();
    };

    const validOrders = this.orders.filter((o) => o.status !== 'CANCELLED');

    // 1. Today's Sales
    const todaySales = validOrders
      .filter((o) => isDateToday(o.createdAt))
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // 2. Monthly Sales
    const monthlySales = validOrders
      .filter((o) => isDateThisMonth(o.createdAt))
      .reduce((sum, o) => sum + o.totalAmount, 0);

    // 3. Total Expenses
    const totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0);

    // 4. Total Investment (Investments minus withdrawals)
    const totalInvestment = this.investments.reduce((sum, inv) => sum + inv.amount, 0);

    // 5. Customer Due
    const customerDue = validOrders.reduce(
      (sum, o) => sum + (o.remainingDue ?? Math.max(0, o.totalAmount - (o.amountPaid || 0))),
      0
    );

    // 6. Supplier Due (Outstanding payable to suppliers)
    const supplierDue = this.suppliers.reduce(
      (sum, s) => sum + (s.supplierDue ?? 0),
      0
    );

    // 7. Loan Outstanding (Principal - Repaid)
    const loanOutstanding = this.loans
      .filter((l) => l.status === 'ACTIVE')
      .reduce((sum, l) => sum + Math.max(0, l.principal - l.amountRepaid), 0);

    // 8. Total Delivery Charge Received
    const totalDeliveryChargeReceived = validOrders.reduce((sum, o) => sum + (o.shippingFee || 0), 0);

    // 9. Actual Delivery Charge Paid
    // Courier costs from cashbook logistics entries + actual dispatched orders courier fees
    const logisticsCashbook = this.cashbook
      .filter((c) => c.type === 'DEBIT' && c.category === 'Logistics & Freight')
      .reduce((sum, c) => sum + c.amount, 0);
    // Dispatched parcel delivery cost (avg ৳60 per order inside Dhaka, ৳100 outside)
    const perOrderCourierPaid = validOrders
      .filter((o) => o.status === 'DELIVERED' || o.status === 'PACKED' || o.status === 'IN_HUB' || o.status === 'OUT_FOR_DELIVERY')
      .reduce((sum, o) => sum + (o.division?.toLowerCase() === 'dhaka' ? 60 : 100), 0);
    const actualDeliveryChargePaid = logisticsCashbook + perOrderCourierPaid;

    // 10. Delivery Charge Profit
    const deliveryChargeProfit = totalDeliveryChargeReceived - actualDeliveryChargePaid;

    // 11. Current Total Product Cost (Valuation of warehouse inventory)
    const currentTotalProductCost = this.inventory.reduce(
      (sum, item) => sum + item.currentStock * item.costPerUnit,
      0
    );

    // 12. Net Profit:
    // "Total Sales - Product Buying Cost - Business Expenses + Delivery Charge Profit"
    // Total product sales:
    const totalProductSales = validOrders.reduce((sum, o) => sum + o.subtotal, 0);
    // Product Buying Cost (Cost of Goods Sold for all ordered items):
    const productBuyingCost = validOrders.reduce((sum, o) => {
      const orderCOGS = (o.items || []).reduce((itemSum, item) => {
        // Find unit cost from inventory or estimate 40% of unit price
        const invItem = this.inventory.find((inv) => inv.sku === item.variantSku);
        const unitCost = invItem ? invItem.costPerUnit : item.unitPrice * 0.4;
        return itemSum + unitCost * item.quantity;
      }, 0);
      return sum + orderCOGS;
    }, 0);

    const netProfit = totalProductSales - productBuyingCost - totalExpenses + deliveryChargeProfit;

    // 13. Cash Balance:
    // Strictly audited: Cash Balance = Total In - Total Out
    // according to actual cash transactions in the central cashbook ledger.
    // Categorize actual cash inflows with zero double-counting:
    let salesReceived = 0;
    let investmentsReceived = 0;
    let loansDisbursed = 0;
    let otherCashIn = 0;
    let totalIn = 0;

    for (const c of this.cashbook) {
      const isInflow = c.entryType === 'INFLOW' || c.type === 'CREDIT';
      if (isInflow) {
        totalIn += c.amount;
        const cat = (c.category || '').toLowerCase();
        if (cat.includes('sales') || cat.includes('order') || cat.includes('customer') || (c.referenceCode && c.referenceCode.startsWith('RYV-'))) {
          salesReceived += c.amount;
        } else if (cat.includes('investment') || cat.includes('capital') || cat.includes('equity') || (c.referenceCode && c.referenceCode.startsWith('INV-'))) {
          investmentsReceived += c.amount;
        } else if (cat.includes('loan') || cat.includes('credit') || (c.referenceCode && c.referenceCode.startsWith('LN-'))) {
          loansDisbursed += c.amount;
        } else {
          otherCashIn += c.amount;
        }
      }
    }

    // Categorize actual cash outflows with zero double-counting:
    let expensesPaid = 0;
    let purchasesPaid = 0;
    let deliveryPaid = 0;
    let loanRepayments = 0;
    let withdrawals = 0;
    let otherCashOut = 0;
    let totalOut = 0;

    for (const c of this.cashbook) {
      const isOutflow = c.entryType === 'OUTFLOW' || c.type === 'DEBIT';
      if (isOutflow) {
        totalOut += c.amount;
        const cat = (c.category || '').toLowerCase();
        const desc = (c.description || '').toLowerCase();
        if (cat.includes('supplier') || cat.includes('procurement') || desc.includes('po #') || (c.referenceCode && c.referenceCode.startsWith('PO-'))) {
          purchasesPaid += c.amount;
        } else if (cat.includes('logistics') || cat.includes('freight') || cat.includes('courier')) {
          deliveryPaid += c.amount;
        } else if (cat.includes('repayment') || cat.includes('debt') || (c.referenceCode && c.referenceCode.startsWith('REP-'))) {
          loanRepayments += c.amount;
        } else if (cat.includes('withdrawal') || cat.includes('drawing') || (c.referenceCode && c.referenceCode.startsWith('WDN-'))) {
          withdrawals += c.amount;
        } else if (
          cat.includes('rent') ||
          cat.includes('packaging') ||
          cat.includes('poly') ||
          cat.includes('transportation') ||
          cat.includes('marketing') ||
          cat.includes('utilities') ||
          cat.includes('expense') ||
          (c.referenceCode && c.referenceCode.startsWith('EXP-'))
        ) {
          expensesPaid += c.amount;
        } else {
          otherCashOut += c.amount;
        }
      }
    }

    const cashBalance = totalIn - totalOut;

    return {
      todaySales,
      monthlySales,
      totalExpenses,
      totalInvestment,
      customerDue,
      supplierDue,
      loanOutstanding,
      totalDeliveryChargeReceived,
      actualDeliveryChargePaid,
      deliveryChargeProfit,
      currentTotalProductCost,
      // Net Profit breakdown
      totalProductSales,
      productBuyingCost,
      businessExpenses: totalExpenses,
      netProfit,
      // Cash Balance breakdown
      cashIn: {
        salesReceived,
        investmentsReceived,
        loansDisbursed,
        otherCashIn,
        total: totalIn,
      },
      cashOut: {
        expensesPaid,
        purchasesPaid,
        deliveryPaid,
        loanRepayments,
        withdrawals,
        otherCashOut,
        total: totalOut,
      },
      cashBalance,
    };
  }
}

export const storeService = new StoreService();

