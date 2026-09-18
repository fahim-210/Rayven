import { Router, Response } from 'express';
import { authStore } from '../auth/store.ts';
import { hashPassword, verifyPassword } from '../auth/password.ts';
import { AuthenticatedRequest, requireAuth } from '../auth/middleware.ts';

export const authRouter = Router();

// 1. Initial Setup Status
authRouter.get('/setup-status', (req, res) => {
  const needsInitialSetup = authStore.needsInitialSetup();
  const adminCount = authStore.getAdminCount();
  res.json({
    needsInitialSetup,
    adminCount,
  });
});

// 2. First Admin Setup (Only accessible when 0 admins exist in the system)
authRouter.post('/first-admin-setup', async (req, res) => {
  try {
    if (!authStore.needsInitialSetup()) {
      return res.status(403).json({
        error: 'First admin setup has already been completed. Public administrator registration is closed.',
        code: 'SETUP_ALREADY_COMPLETED',
      });
    }

    const { email, password, fullName, department, phone } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const passwordHash = await hashPassword(password);
    const newAdmin = await authStore.createFirstAdmin({
      email,
      passwordHash,
      fullName,
      department: department || 'Executive Operations',
      phone,
    });

    const session = authStore.createSession(newAdmin.id, newAdmin.role);

    // Set cookie
    res.cookie('rayven_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'First administrator successfully established.',
      user: authStore.toPublicUser(newAdmin),
      token: session.token,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to complete initial admin setup.' });
  }
});

// 3. Customer Sign Up (Public Registration)
authRouter.post('/customer/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const passwordHash = await hashPassword(password);
    const newCustomer = await authStore.createCustomer({
      email,
      passwordHash,
      fullName,
      phone,
    });

    const session = authStore.createSession(newCustomer.id, newCustomer.role);

    res.cookie('rayven_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Account created successfully. Welcome to RAYVEN.',
      user: authStore.toPublicUser(newCustomer),
      token: session.token,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to register account.' });
  }
});

// 4. Customer Login
authRouter.post('/customer/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = authStore.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact support.' });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const session = authStore.createSession(user.id, user.role);

    res.cookie('rayven_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Sign in successful.',
      user: authStore.toPublicUser(user),
      token: session.token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'An unexpected authentication error occurred.' });
  }
});

// 5. Admin Login (Separated concept with strict role authorization)
authRouter.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = authStore.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid administrative credentials.' });
    }

    // Strict role check: Customers cannot use the Admin Login!
    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER'];
    if (!adminRoles.includes(user.role)) {
      return res.status(403).json({
        error: 'Access Denied: Customer accounts do not have access to the Admin ERP portal.',
        code: 'NOT_AN_ADMIN',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Your administrative account has been deactivated.' });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid administrative credentials.' });
    }

    const session = authStore.createSession(user.id, user.role);

    res.cookie('rayven_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Administrative authentication successful.',
      user: authStore.toPublicUser(user),
      token: session.token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'An unexpected authentication error occurred.' });
  }
});

// 6. Current Session Info
authRouter.get('/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.sessionRecord) {
    return res.status(401).json({ error: 'Session expired or not authenticated.', code: 'UNAUTHORIZED' });
  }

  return res.json({
    user: authStore.toPublicUser(req.user),
    session: {
      expiresAt: req.sessionRecord.expiresAt,
    },
  });
});

// 7. Sign Out
authRouter.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  let token = req.sessionRecord?.token;
  if (!token && req.cookies && req.cookies.rayven_session) {
    token = req.cookies.rayven_session;
  }
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7).trim();
  }

  if (token) {
    authStore.deleteSession(token);
  }

  res.clearCookie('rayven_session');
  return res.json({ success: true, message: 'Signed out successfully.' });
});

// 8. Customer Profile Updates
authRouter.put('/customer/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { fullName, phone, avatarUrl, address } = req.body;

    const updates: any = {};
    if (fullName) updates.fullName = fullName.trim();
    if (phone !== undefined) updates.phone = phone;
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    if (address && user.customerProfile) {
      updates.customerProfile = {
        ...user.customerProfile,
        address: {
          ...user.customerProfile.address,
          ...address,
        },
      };
    }

    const updatedUser = authStore.updateUser(user.id, updates);
    return res.json({
      message: 'Profile updated successfully.',
      user: authStore.toPublicUser(updatedUser),
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update profile.' });
  }
});

// 9. Change Password (For authenticated user)
authRouter.post('/change-password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const newHash = await hashPassword(newPassword);
    authStore.updateUser(user.id, { passwordHash: newHash });

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

// 10. Forgot Password (Request Reset Token)
authRouter.post('/customer/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const user = authStore.getUserByEmail(email);
  if (!user) {
    // For security, do not disclose whether email exists
    return res.json({
      success: true,
      message: 'If that email exists in our records, a password reset token has been dispatched.',
    });
  }

  const tokenRecord = authStore.createPasswordResetToken(email);

  // Return token directly for interactive demonstration convenience
  return res.json({
    success: true,
    message: 'Password reset code generated.',
    demoResetToken: tokenRecord.token,
    expiresAt: tokenRecord.expiresAt,
  });
});

// 11. Reset Password (Using Token)
authRouter.post('/customer/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    const record = authStore.verifyPasswordResetToken(resetToken);
    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    const user = authStore.getUserByEmail(record.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const newHash = await hashPassword(newPassword);
    authStore.updateUser(user.id, { passwordHash: newHash });
    authStore.consumePasswordResetToken(resetToken);

    return res.json({ success: true, message: 'Password has been reset successfully. You can now sign in.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// 12. Dev / Testing Route: Reset Admin Setup
authRouter.post('/dev/reset-setup', async (req, res) => {
  await authStore.resetToFirstAdminState();
  return res.json({
    success: true,
    message: 'Admin accounts cleared. Initial Admin Setup is now re-enabled.',
    needsInitialSetup: authStore.needsInitialSetup(),
  });
});
