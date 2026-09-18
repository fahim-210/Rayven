import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ServerUser, SessionRecord, PasswordResetToken, PublicUser, UserRole } from './types.ts';
import { hashPassword } from './password.ts';

const DATA_DIR = path.join(process.cwd(), '.data');
const STORE_FILE = path.join(DATA_DIR, 'auth_store.json');

const SESSION_DURATION_HOURS = 24 * 7; // 7 days

interface StoreData {
  users: ServerUser[];
  sessions: SessionRecord[];
  resetTokens: PasswordResetToken[];
}

class AuthStore {
  private users: ServerUser[] = [];
  private sessions: SessionRecord[] = [];
  private resetTokens: PasswordResetToken[] = [];
  private initialized = false;

  constructor() {
    this.load();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create .data directory', err);
      }
    }
  }

  private load() {
    this.ensureDir();
    if (fs.existsSync(STORE_FILE)) {
      try {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const data: StoreData = JSON.parse(raw);
        this.users = data.users || [];
        this.sessions = data.sessions || [];
        this.resetTokens = data.resetTokens || [];
        this.initialized = true;
        return;
      } catch (err) {
        console.error('Error reading auth_store.json, resetting to initial state', err);
      }
    }

    // Default Initial State:
    // Notice: 0 Admins initially so First Admin Setup page is visible and functional!
    // 1 Sample Customer for immediate customer sign-in testing.
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    const customerPasswordHash = await hashPassword('password123');

    this.users = [
      {
        id: 'usr_cust_01',
        email: 'alex.mercer@gmail.com',
        passwordHash: customerPasswordHash,
        fullName: 'Alex Mercer',
        phone: '+1 (555) 382-9011',
        role: 'CUSTOMER',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        emailVerified: true,
        isActive: true,
        createdAt: '2026-05-12T00:00:00.000Z',
        updatedAt: '2026-05-12T00:00:00.000Z',
        customerProfile: {
          customerCode: 'CUST-2026-0001',
          isVerified: true,
          loyaltyPoints: 350,
          totalSpent: 420.0,
          totalOrdersCount: 3,
          address: {
            street1: '42 Stadium Boulevard, Apt 4B',
            city: 'Portland',
            state: 'OR',
            postalCode: '97201',
            country: 'United States',
          },
        },
      },
    ];

    this.sessions = [];
    this.resetTokens = [];
    this.initialized = true;
    this.save();
  }

  private save() {
    try {
      this.ensureDir();
      const payload: StoreData = {
        users: this.users,
        sessions: this.sessions,
        resetTokens: this.resetTokens,
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save auth store to disk', err);
    }
  }

  // --- Setup Status ---
  getAdminCount(): number {
    return this.users.filter((u) => ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER'].includes(u.role)).length;
  }

  needsInitialSetup(): boolean {
    return this.getAdminCount() === 0;
  }

  // Reset to 0 admins for dev/demonstration testing
  async resetToFirstAdminState(): Promise<void> {
    this.users = this.users.filter((u) => u.role === 'CUSTOMER');
    this.sessions = this.sessions.filter((s) => s.role === 'CUSTOMER');
    this.resetTokens = [];
    this.save();
  }

  // --- User Queries ---
  getUserById(id: string): ServerUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): ServerUser | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  getAllAdmins(): ServerUser[] {
    return this.users.filter((u) => ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER'].includes(u.role));
  }

  // --- First Admin Creation ---
  async createFirstAdmin(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    department?: string;
    phone?: string;
  }): Promise<ServerUser> {
    if (!this.needsInitialSetup()) {
      throw new Error('First admin setup has already been completed.');
    }

    const newAdmin: ServerUser = {
      id: `usr_admin_${Date.now()}`,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      fullName: data.fullName.trim(),
      phone: data.phone || '',
      role: 'SUPER_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminProfile: {
        adminCode: 'ADM-001',
        department: data.department || 'Executive Operations',
        isSuperAdmin: true,
        canApprovePayments: true,
        canManageInventory: true,
        canManageFinance: true,
        canManageUsers: true,
        permissions: [
          'PRODUCT:CREATE',
          'PRODUCT:UPDATE',
          'PRODUCT:DELETE',
          'INVENTORY:MANAGE',
          'PAYMENT:APPROVE',
          'FINANCE:VIEW',
          'FINANCE:MANAGE',
          'ORDER:MANAGE',
          'USER:MANAGE',
          'SYSTEM:GOVERN',
        ],
      },
    };

    this.users.push(newAdmin);
    this.save();
    return newAdmin;
  }

  // --- Subsequent Admin Creation (Authorized Admin Only) ---
  async createAdminByAuthorized(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    department: string;
    role: UserRole;
    phone?: string;
    permissions?: string[];
    canApprovePayments?: boolean;
    canManageInventory?: boolean;
    canManageFinance?: boolean;
    canManageUsers?: boolean;
  }): Promise<ServerUser> {
    const existing = this.getUserByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const adminIndex = this.getAllAdmins().length + 1;
    const adminCode = `ADM-${String(adminIndex).padStart(3, '0')}`;

    const newAdmin: ServerUser = {
      id: `usr_admin_${Date.now()}`,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      fullName: data.fullName.trim(),
      phone: data.phone || '',
      role: data.role,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminProfile: {
        adminCode,
        department: data.department || 'Operations',
        isSuperAdmin: data.role === 'SUPER_ADMIN',
        canApprovePayments: data.canApprovePayments ?? true,
        canManageInventory: data.canManageInventory ?? true,
        canManageFinance: data.canManageFinance ?? (data.role === 'SUPER_ADMIN' || data.role === 'ADMIN'),
        canManageUsers: data.canManageUsers ?? (data.role === 'SUPER_ADMIN'),
        permissions: data.permissions || [
          'PRODUCT:UPDATE',
          'INVENTORY:MANAGE',
          'ORDER:MANAGE',
        ],
      },
    };

    this.users.push(newAdmin);
    this.save();
    return newAdmin;
  }

  // --- Customer Creation (Public Self-Registration) ---
  async createCustomer(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    phone?: string;
  }): Promise<ServerUser> {
    const existing = this.getUserByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const customerCount = this.users.filter((u) => u.role === 'CUSTOMER').length + 1;
    const customerCode = `CUST-${new Date().getFullYear()}-${String(customerCount).padStart(4, '0')}`;

    const newCustomer: ServerUser = {
      id: `usr_cust_${Date.now()}`,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      fullName: data.fullName.trim(),
      phone: data.phone || '',
      role: 'CUSTOMER', // Strictly forced to CUSTOMER
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      emailVerified: false,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerProfile: {
        customerCode,
        isVerified: false,
        loyaltyPoints: 50, // Welcome bonus points
        totalSpent: 0,
        totalOrdersCount: 0,
      },
    };

    this.users.push(newCustomer);
    this.save();
    return newCustomer;
  }

  // --- Update User Profile ---
  updateUser(id: string, updates: Partial<ServerUser>): ServerUser {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      throw new Error('User not found');
    }

    const current = this.users[idx];
    const updated: ServerUser = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.users[idx] = updated;
    this.save();
    return updated;
  }

  // --- Admin User Management Operations ---
  setAdminStatus(id: string, isActive: boolean, requesterId: string): ServerUser {
    const admin = this.getUserById(id);
    if (!admin || !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER'].includes(admin.role)) {
      throw new Error('Admin not found');
    }

    // Safety: Cannot deactivate oneself if sole super admin
    if (!isActive && admin.id === requesterId && admin.role === 'SUPER_ADMIN') {
      const otherSuperAdmins = this.users.filter(
        (u) => u.role === 'SUPER_ADMIN' && u.isActive && u.id !== requesterId
      );
      if (otherSuperAdmins.length === 0) {
        throw new Error('Cannot deactivate your own account as the primary Super Admin.');
      }
    }

    admin.isActive = isActive;
    admin.updatedAt = new Date().toISOString();
    this.save();
    return admin;
  }

  updateAdmin(
    id: string,
    data: {
      fullName?: string;
      department?: string;
      role?: UserRole;
      phone?: string;
      permissions?: string[];
      canApprovePayments?: boolean;
      canManageInventory?: boolean;
      canManageFinance?: boolean;
      canManageUsers?: boolean;
    }
  ): ServerUser {
    const admin = this.getUserById(id);
    if (!admin || !admin.adminProfile) {
      throw new Error('Admin record not found');
    }

    if (data.fullName) admin.fullName = data.fullName.trim();
    if (data.phone !== undefined) admin.phone = data.phone;
    if (data.role) admin.role = data.role;

    if (data.department) admin.adminProfile.department = data.department;
    if (data.canApprovePayments !== undefined) admin.adminProfile.canApprovePayments = data.canApprovePayments;
    if (data.canManageInventory !== undefined) admin.adminProfile.canManageInventory = data.canManageInventory;
    if (data.canManageFinance !== undefined) admin.adminProfile.canManageFinance = data.canManageFinance;
    if (data.canManageUsers !== undefined) admin.adminProfile.canManageUsers = data.canManageUsers;
    if (data.permissions) admin.adminProfile.permissions = data.permissions;

    admin.updatedAt = new Date().toISOString();
    this.save();
    return admin;
  }

  // --- Session Management ---
  createSession(userId: string, role: UserRole): SessionRecord {
    // Purge expired sessions
    this.cleanExpiredSessions();

    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString();

    const session: SessionRecord = {
      token,
      userId,
      role,
      createdAt: now.toISOString(),
      expiresAt,
    };

    this.sessions.push(session);
    this.save();
    return session;
  }

  getSession(token: string): SessionRecord | null {
    if (!token) return null;
    const session = this.sessions.find((s) => s.token === token);
    if (!session) return null;

    if (new Date(session.expiresAt) <= new Date()) {
      // Session expired
      this.deleteSession(token);
      return null;
    }

    return session;
  }

  deleteSession(token: string): void {
    this.sessions = this.sessions.filter((s) => s.token !== token);
    this.save();
  }

  deleteUserSessions(userId: string): void {
    this.sessions = this.sessions.filter((s) => s.userId !== userId);
    this.save();
  }

  private cleanExpiredSessions(): void {
    const now = new Date();
    this.sessions = this.sessions.filter((s) => new Date(s.expiresAt) > now);
  }

  // --- Password Reset Token Handling ---
  createPasswordResetToken(email: string): PasswordResetToken {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour validity

    // Remove old tokens for this email
    this.resetTokens = this.resetTokens.filter((t) => t.email.toLowerCase() !== email.toLowerCase());

    const record: PasswordResetToken = { token, email: email.toLowerCase(), expiresAt };
    this.resetTokens.push(record);
    this.save();
    return record;
  }

  verifyPasswordResetToken(token: string): PasswordResetToken | null {
    const record = this.resetTokens.find((t) => t.token === token);
    if (!record) return null;
    if (new Date(record.expiresAt) <= new Date()) {
      this.resetTokens = this.resetTokens.filter((t) => t.token !== token);
      this.save();
      return null;
    }
    return record;
  }

  consumePasswordResetToken(token: string): void {
    this.resetTokens = this.resetTokens.filter((t) => t.token !== token);
    this.save();
  }

  // --- DTO Serialization ---
  toPublicUser(user: ServerUser): PublicUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      customerProfile: user.customerProfile,
      adminProfile: user.adminProfile,
    };
  }
}

export const authStore = new AuthStore();
export default authStore;
