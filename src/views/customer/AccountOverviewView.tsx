import React, { useState } from 'react';
import { CustomerAccountLayout } from '../../layouts/CustomerAccountLayout.tsx';
import { useRouter } from '../../router/RouterContext.tsx';
import { useAuth } from '../../lib/auth/AuthContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { storeService } from '../../services/storeService.ts';
import { Button } from '../../components/ui/Button.tsx';
import { Badge } from '../../components/ui/Badge.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { formatCurrency, formatDate } from '../../lib/utils.ts';
import { BANGLADESH_DIVISION_NAMES } from '../../data/bangladeshGeoData.ts';
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  ArrowRight,
  Truck,
  Check,
  AlertCircle,
  Clock,
  Trash2,
  Plus,
  Shield,
  FileText,
  User,
  KeyRound,
  Eye,
} from 'lucide-react';

interface SavedAddress {
  id: string;
  label: string;
  name: string;
  phone: string;
  division: string;
  district: string;
  areaThana: string;
  fullAddress: string;
  isDefault: boolean;
}

export const AccountOverviewView: React.FC = () => {
  const { navigate, currentPath } = useRouter();
  const { user, updateProfile, changePassword } = useAuth();
  const { wishlist } = useCart();

  // Determine active tab from URL query or default
  const defaultTab = currentPath.includes('tab=payments')
    ? 'payments'
    : currentPath.includes('tab=notifications')
    ? 'notifications'
    : currentPath.includes('tab=addresses')
    ? 'addresses'
    : 'profile';

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'payments' | 'notifications'>(
    defaultTab
  );

  // Customer Orders & Notifications
  const orders = storeService.getCustomerOrders({
    id: user?.id,
    email: user?.email,
    phone: user?.phone,
  });
  const notifications = storeService.getCustomerNotifications(user?.id);

  // Collect all payment submissions from customer orders
  const paymentHistory = orders.flatMap((o) =>
    (o.paymentSubmissions || []).map((sub) => ({
      ...sub,
      orderNumber: o.orderNumber,
      orderId: o.id,
      orderTotal: o.totalAmount,
    }))
  );

  // Saved addresses state (persisted locally)
  const [addresses, setAddresses] = useState<SavedAddress[]>(() => {
    try {
      const stored = localStorage.getItem('rayven_saved_addresses');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'addr_01',
        label: 'Home (Dhanmondi)',
        name: user?.fullName || 'Tanvir Hossain',
        phone: user?.phone || '01711223344',
        division: 'Dhaka',
        district: 'Dhaka',
        areaThana: 'Dhanmondi',
        fullAddress: 'House 42, Road 7A, Dhanmondi R/A',
        isDefault: true,
      },
      {
        id: 'addr_02',
        label: 'Office (Gulshan)',
        name: user?.fullName || 'Tanvir Hossain',
        phone: user?.phone || '01711223344',
        division: 'Dhaka',
        district: 'Dhaka',
        areaThana: 'Gulshan',
        fullAddress: 'Level 6, Simpletree Anarkali, 89 Gulshan Avenue',
        isDefault: false,
      },
    ];
  });

  const saveAddresses = (newAddrs: SavedAddress[]) => {
    setAddresses(newAddrs);
    try {
      localStorage.setItem('rayven_saved_addresses', JSON.stringify(newAddrs));
    } catch {}
  };

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.fullName || 'Tanvir Hossain');
  const [phone, setPhone] = useState(user?.phone || '01711223344');
  const [email, setEmail] = useState(user?.email || 'tanvir.hossain@example.com');
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // New Address Form State
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrDivision, setNewAddrDivision] = useState('Dhaka');
  const [newAddrDistrict, setNewAddrDistrict] = useState('Dhaka');
  const [newAddrThana, setNewAddrThana] = useState('Mirpur');
  const [newAddrFull, setNewAddrFull] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);
    const res = await updateProfile({ fullName, phone });
    setIsSavingProfile(false);
    if (res.success) {
      setProfileMsg({ text: 'Profile information updated successfully.', type: 'success' });
    } else {
      setProfileMsg({ text: res.error || 'Failed to update profile.', type: 'error' });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPwd(true);
    setPwdMsg(null);

    if (newPassword.length < 8) {
      setIsChangingPwd(false);
      setPwdMsg({ text: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setIsChangingPwd(false);
      setPwdMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    const res = await changePassword(currentPassword, newPassword);
    setIsChangingPwd(false);
    if (res.success) {
      setPwdMsg({ text: 'Password successfully changed.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwdMsg({ text: res.error || 'Current password incorrect.', type: 'error' });
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrFull.trim()) return;
    const newAddr: SavedAddress = {
      id: `addr_${Date.now()}`,
      label: newAddrLabel,
      name: fullName,
      phone,
      division: newAddrDivision,
      district: newAddrDistrict,
      areaThana: newAddrThana,
      fullAddress: newAddrFull.trim(),
      isDefault: addresses.length === 0,
    };
    saveAddresses([...addresses, newAddr]);
    setShowAddAddressModal(false);
    setNewAddrFull('');
  };

  const handleSetDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    saveAddresses(updated);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveAddresses(updated);
  };

  return (
    <CustomerAccountLayout
      title="Customer Account"
      subtitle="Manage your profile, credentials, saved delivery addresses, and payment logs."
    >
      <div className="space-y-6">
        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => navigate('/orders')}
            className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-semibold">My Orders</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold font-mono text-white">{orders.length}</p>
          </div>

          <div
            onClick={() => navigate('/wishlist')}
            className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-semibold">Wishlist</span>
              <Heart className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold font-mono text-white">{wishlist.length}</p>
          </div>

          <div
            onClick={() => setActiveTab('payments')}
            className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-semibold">Payments</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold font-mono text-white">{paymentHistory.length}</p>
          </div>

          <div
            onClick={() => setActiveTab('notifications')}
            className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-xs font-semibold">Notifications</span>
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold font-mono text-white">
              {notifications.filter((n) => !n.isRead).length}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-amber-400 text-black shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'addresses'
                ? 'bg-amber-400 text-black shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'payments'
                ? 'bg-amber-400 text-black shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payment History ({paymentHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-amber-400 text-black shadow-sm font-bold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications</span>
          </button>
        </div>

        {/* TAB 1: PROFILE & SECURITY (Name, Phone, Email, Password) */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Info Form */}
            <form
              onSubmit={handleSaveProfile}
              className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Personal Details</span>
                </h3>
              </div>

              {profileMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {profileMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Phone Contact</label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01711223344"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Email Address</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  disabled
                />
                <p className="text-[10px] text-neutral-500">Account login ID is locked for security.</p>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="sm"
                className="w-full text-black font-bold"
                disabled={isSavingProfile}
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile Details'}
              </Button>
            </form>

            {/* Change Password Form */}
            <form
              onSubmit={handleChangePassword}
              className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Change Password</span>
                </h3>
              </div>

              {pwdMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    pwdMsg.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border border-red-500/30 text-red-400'
                  }`}
                >
                  {pwdMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{pwdMsg.text}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">New Password (Min 8 characters)</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-300">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="w-full text-white font-bold"
                disabled={isChangingPwd}
              >
                {isChangingPwd ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>
          </div>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                Saved Delivery Destinations
              </h3>
              <Button
                variant="gold"
                size="sm"
                onClick={() => setShowAddAddressModal(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="text-black text-xs font-bold"
              >
                Add New Address
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-xl border text-xs space-y-3 transition-all ${
                    addr.isDefault
                      ? 'bg-neutral-900/90 border-amber-400/40 shadow-sm'
                      : 'bg-neutral-900/50 border-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-heading text-sm">{addr.label}</span>
                      {addr.isDefault && (
                        <Badge variant="gold" size="sm">
                          Default
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-neutral-500 hover:text-red-400 p-1"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-neutral-300 space-y-1">
                    <p className="font-bold text-white">{addr.name}</p>
                    <p className="font-mono text-neutral-400">{addr.phone}</p>
                    <p>{addr.fullAddress}</p>
                    <p className="font-mono text-[11px] text-amber-400">
                      {addr.areaThana}, {addr.district}, {addr.division} Division
                    </p>
                  </div>

                  {!addr.isDefault && (
                    <div className="pt-2 border-t border-neutral-800">
                      <button
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-amber-400 hover:underline text-[11px] font-semibold"
                      >
                        Set as Default Delivery Address
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Address Modal / Expandable form */}
            {showAddAddressModal && (
              <form
                onSubmit={handleAddAddress}
                className="p-6 rounded-2xl bg-neutral-950 border border-neutral-700 space-y-4 max-w-lg"
              >
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <h4 className="text-sm font-bold text-white font-heading">Add New Saved Address</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddAddressModal(false)}
                    className="text-neutral-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-neutral-300 mb-1">Address Label</label>
                    <Input
                      value={newAddrLabel}
                      onChange={(e) => setNewAddrLabel(e.target.value)}
                      placeholder="e.g. Home, Office, Gym"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 mb-1">Division</label>
                    <select
                      value={newAddrDivision}
                      onChange={(e) => setNewAddrDivision(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      {BANGLADESH_DIVISION_NAMES.map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-neutral-300 mb-1">District</label>
                    <Input
                      value={newAddrDistrict}
                      onChange={(e) => setNewAddrDistrict(e.target.value)}
                      placeholder="District"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-300 mb-1">Area / Thana</label>
                    <Input
                      value={newAddrThana}
                      onChange={(e) => setNewAddrThana(e.target.value)}
                      placeholder="Area / Thana"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-neutral-300 mb-1">Full Delivery Address</label>
                    <Input
                      value={newAddrFull}
                      onChange={(e) => setNewAddrFull(e.target.value)}
                      placeholder="House, Road, Block, Sector..."
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddAddressModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="gold" size="sm" className="text-black font-bold">
                    Save Address
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: PAYMENT HISTORY (Complete audit log) */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                  Payment Submissions & Verification Ledger
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Audit trail of manual mobile payments submitted via bKash, Nagad, and Rocket.
                </p>
              </div>
            </div>

            {paymentHistory.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                <CreditCard className="w-8 h-8 text-neutral-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Payment Submissions Found</h4>
                <p className="text-xs text-neutral-400">
                  When you place an order and submit advance payment, the verification records will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentHistory.map((pay) => (
                  <div
                    key={pay.id}
                    className="p-5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">
                          {pay.transactionId}
                        </span>
                        <Badge
                          variant={
                            pay.status === 'APPROVED'
                              ? 'success'
                              : pay.status === 'UNDER_REVIEW'
                              ? 'gold'
                              : pay.status === 'REJECTED'
                              ? 'danger'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {pay.status}
                        </Badge>
                        <span className="text-amber-400 font-mono">via {pay.method}</span>
                      </div>

                      <p className="text-neutral-400 font-mono text-[11px]">
                        Order: <button onClick={() => navigate(`/orders/${pay.orderNumber}`)} className="text-white underline hover:text-amber-400">{pay.orderNumber}</button> • Sender: {pay.senderPhone}
                      </p>

                      <p className="text-neutral-500 font-mono text-[10px]">
                        Submitted: {formatDate(pay.submittedAt)}
                        {pay.reviewedAt && ` • Reviewed: ${formatDate(pay.reviewedAt)} by ${pay.reviewedBy || 'Admin'}`}
                      </p>

                      {pay.rejectionReason && (
                        <p className="text-red-400 font-medium text-[11px] mt-1">
                          Rejection Reason: {pay.rejectionReason}
                        </p>
                      )}
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <span className="font-mono font-extrabold text-amber-400 text-base">
                        {formatCurrency(pay.amountPaid)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[11px] h-7"
                        onClick={() => navigate(`/payment/${pay.orderId}`)}
                      >
                        Payment Desk
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                  Account & Order Notifications
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Real-time updates regarding manual payment reviews, order confirmation, and dispatch.
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => storeService.markAllNotificationsRead()}
                className="text-xs text-amber-400 hover:text-amber-300"
              >
                Mark All Read
              </Button>
            </div>

            {notifications.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                <Bell className="w-8 h-8 text-neutral-600 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Notifications</h4>
                <p className="text-xs text-neutral-400">You're all caught up with your orders and payments.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      storeService.markNotificationRead(notif.id);
                      if (notif.orderId) {
                        navigate(`/orders/${notif.orderId}`);
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      notif.isRead
                        ? 'bg-neutral-900/40 border-neutral-800/80 text-neutral-400'
                        : 'bg-neutral-900/90 border-amber-400/40 text-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${notif.isRead ? 'bg-neutral-600' : 'bg-amber-400 animate-pulse'}`} />
                          <h4 className="font-bold text-xs text-white font-heading">{notif.title}</h4>
                        </div>
                        <p className="text-xs text-neutral-300 pl-4 leading-relaxed">{notif.message}</p>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-500 shrink-0">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </CustomerAccountLayout>
  );
};
