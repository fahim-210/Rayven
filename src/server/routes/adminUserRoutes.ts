import { Router, Response } from 'express';
import { authStore } from '../auth/store.ts';
import { hashPassword } from '../auth/password.ts';
import { AuthenticatedRequest, requireAdmin } from '../auth/middleware.ts';
import { UserRole } from '../auth/types.ts';

export const adminUserRouter = Router();

// Apply administrative barrier to all routes in this router
adminUserRouter.use(requireAdmin);

// Helper to check user management authority
function canManageUsersCheck(req: AuthenticatedRequest): boolean {
  if (!req.user) return false;
  if (req.user.role === 'SUPER_ADMIN') return true;
  return !!req.user.adminProfile?.canManageUsers;
}

// 1. List all Admin Accounts
adminUserRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const admins = authStore.getAllAdmins();
  return res.json({
    admins: admins.map((a) => authStore.toPublicUser(a)),
    totalCount: admins.length,
  });
});

// 2. Create Additional Admin (Authorized Admin Only)
adminUserRouter.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!canManageUsersCheck(req)) {
      return res.status(403).json({
        error: 'Forbidden: You do not possess authority to provision new administrative personnel.',
        code: 'MISSING_USER_MANAGEMENT_PRIVILEGE',
      });
    }

    const {
      fullName,
      email,
      password,
      department,
      role = 'ADMIN',
      phone,
      permissions,
      canApprovePayments,
      canManageInventory,
      canManageFinance,
      canManageUsers,
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and temporary password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    // Role privilege restriction: Only SUPER_ADMIN can create another SUPER_ADMIN
    if (role === 'SUPER_ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        error: 'Only an existing Super Administrator can provision another Super Administrator account.',
      });
    }

    const passwordHash = await hashPassword(password);

    const newAdmin = await authStore.createAdminByAuthorized({
      fullName,
      email,
      passwordHash,
      department: department || 'Operations',
      role: role as UserRole,
      phone,
      permissions,
      canApprovePayments,
      canManageInventory,
      canManageFinance,
      canManageUsers,
    });

    return res.status(201).json({
      message: `Administrative personnel ${newAdmin.fullName} successfully provisioned.`,
      admin: authStore.toPublicUser(newAdmin),
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to create administrative account.' });
  }
});

// 3. Edit Admin Information
adminUserRouter.put('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!canManageUsersCheck(req) && req.user?.id !== req.params.id) {
      return res.status(403).json({
        error: 'Forbidden: You do not possess authority to edit administrative user records.',
      });
    }

    const { id } = req.params;
    const {
      fullName,
      department,
      role,
      phone,
      permissions,
      canApprovePayments,
      canManageInventory,
      canManageFinance,
      canManageUsers,
    } = req.body;

    // Only SUPER_ADMIN can change roles or permissions of other admins
    if (role && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Only Super Administrators can modify role assignments.' });
    }

    const updated = authStore.updateAdmin(id, {
      fullName,
      department,
      role,
      phone,
      permissions,
      canApprovePayments,
      canManageInventory,
      canManageFinance,
      canManageUsers,
    });

    return res.json({
      message: 'Admin account record successfully updated.',
      admin: authStore.toPublicUser(updated),
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update admin account.' });
  }
});

// 4. Activate Admin
adminUserRouter.patch('/:id/activate', (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!canManageUsersCheck(req)) {
      return res.status(403).json({
        error: 'Forbidden: Missing privilege to activate personnel accounts.',
      });
    }

    const { id } = req.params;
    const updated = authStore.setAdminStatus(id, true, req.user!.id);
    return res.json({
      message: `Administrative access for ${updated.fullName} has been activated.`,
      admin: authStore.toPublicUser(updated),
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 5. Deactivate Admin
adminUserRouter.patch('/:id/deactivate', (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!canManageUsersCheck(req)) {
      return res.status(403).json({
        error: 'Forbidden: Missing privilege to deactivate personnel accounts.',
      });
    }

    const { id } = req.params;
    const updated = authStore.setAdminStatus(id, false, req.user!.id);

    // Invalidate active sessions of deactivated admin
    authStore.deleteUserSessions(id);

    return res.json({
      message: `Administrative access for ${updated.fullName} has been revoked (Deactivated).`,
      admin: authStore.toPublicUser(updated),
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// 6. Reset Admin Password (Admin Reset)
adminUserRouter.post('/:id/reset-password', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!canManageUsersCheck(req)) {
      return res.status(403).json({
        error: 'Forbidden: Missing privilege to reset personnel credentials.',
      });
    }

    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const targetAdmin = authStore.getUserById(id);
    if (!targetAdmin) {
      return res.status(404).json({ error: 'Admin not found.' });
    }

    const newHash = await hashPassword(newPassword);
    authStore.updateUser(id, { passwordHash: newHash });
    authStore.deleteUserSessions(id);

    return res.json({
      success: true,
      message: `Credentials updated for ${targetAdmin.fullName}. Active sessions invalidated.`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset admin credentials.' });
  }
});
