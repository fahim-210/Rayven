export type UserRole = 'CUSTOMER' | 'CASHIER' | 'MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

export interface ServerUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Customer specific fields
  customerProfile?: {
    customerCode: string;
    isVerified: boolean;
    loyaltyPoints: number;
    totalSpent: number;
    totalOrdersCount: number;
    address?: {
      street1: string;
      street2?: string;
      city: string;
      state?: string;
      postalCode: string;
      country: string;
    };
  };
  // Admin specific fields
  adminProfile?: {
    adminCode: string;
    department: string;
    isSuperAdmin: boolean;
    canApprovePayments: boolean;
    canManageInventory: boolean;
    canManageFinance: boolean;
    canManageUsers: boolean;
    permissions: string[];
  };
}

export interface SessionRecord {
  token: string;
  userId: string;
  role: UserRole;
  createdAt: string;
  expiresAt: string;
}

export interface PasswordResetToken {
  token: string;
  email: string;
  expiresAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  customerProfile?: ServerUser['customerProfile'];
  adminProfile?: ServerUser['adminProfile'];
}
