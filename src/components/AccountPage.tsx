import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User as UserIcon, MapPin, Package, LogOut, Plus, Trash2, ShoppingBag, Award } from 'lucide-react';
import { handleFirestoreError, OperationType, Product } from '../App';
import { LoyaltyCard } from './LoyaltyCard';

export interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface UserProfile {
  role: string;
  displayName?: string;
  phoneNumber?: string;
  addresses?: Address[];
}

interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  createdAt: any;
}

interface AccountPageProps {
  user: User;
  onBack: () => void;
  onReorder: (items: any[]) => void;
  products: Product[];
}

type Tab = 'profile' | 'addresses' | 'orders' | 'loyalty';

export function AccountPage({ user, onBack, onReorder, products }: AccountPageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState({ displayName: '', phoneNumber: '' });

  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    label: '',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
  });

  // Derived loyalty metrics
  const totalSpent = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const orderCount = orders.filter(o => o.status !== 'cancelled').length;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          setFormData({
            displayName: data.displayName || user.displayName || '',
            phoneNumber: data.phoneNumber || '',
          });
        }

        const ordersQuery = query(
          collection(db, 'users', user.uid, 'orders'),
          orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
        setOrders(ordersData);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
      });
      setProfile(prev => (prev ? { ...prev, ...formData } : null));
      setIsEditingProfile(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleSaveAddress = async () => {
    try {
      const newAddress: Address = {
        ...addressForm,
        id: editingAddress?.id || Math.random().toString(36).substr(2, 9),
      };
      let updated = [...(profile?.addresses || [])];
      if (newAddress.isDefault) updated = updated.map(a => ({ ...a, isDefault: false }));
      if (editingAddress) {
        updated = updated.map(a => (a.id === editingAddress.id ? newAddress : a));
      } else {
        updated.push(newAddress);
      }
      await updateDoc(doc(db, 'users', user.uid), { addresses: updated });
      setProfile(prev => (prev ? { ...prev, addresses: updated } : null));
      setIsAddingAddress(false);
      setEditingAddress(null);
      setAddressForm({ label: '', firstName: '', lastName: '', street: '', city: '', state: '', zipCode: '', isDefault: false });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const updated = profile?.addresses?.filter(a => a.id !== id) || [];
      await updateDoc(doc(db, 'users', user.uid), { addresses: updated });
      setProfile(prev => (prev ? { ...prev, addresses: updated } : null));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleLogout = async () => { await signOut(auth); onBack(); };

  const formatDate = (date: any) => {
    if (!date) return 'Pending…';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  const INPUT_CLASS = 'w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none';

  const NAV_ITEMS: { tab: Tab; Icon: any; label: string }[] = [
    { tab: 'profile', Icon: UserIcon, label: 'Profile Details' },
    { tab: 'addresses', Icon: MapPin, label: 'Saved Addresses' },
    { tab: 'orders', Icon: Package, label: 'Order History' },
    { tab: 'loyalty', Icon: Award, label: 'Loyalty & Rewards' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                    {profile?.displayName || user.displayName || 'Guest User'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1.5">
                {NAV_ITEMS.map(({ tab, Icon, label }) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                      activeTab === tab
                        ? 'bg-primary text-slate-900 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                    {tab === 'loyalty' && (
                      <span className="ml-auto text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-full">
                        New
                      </span>
                    )}
                  </button>
                ))}

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all text-sm font-semibold"
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <AnimatePresence mode="wait">

              {/* ── PROFILE TAB ── */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Details</h3>
                    {!isEditingProfile && (
                      <button onClick={() => setIsEditingProfile(true)} className="text-primary font-bold hover:underline text-sm">
                        Edit Profile
                      </button>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                      {isEditingProfile ? (
                        <input type="text" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} className={INPUT_CLASS} />
                      ) : (
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile?.displayName || user.displayName || 'Not set'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{user.email}</p>
                      <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                      {isEditingProfile ? (
                        <input type="tel" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} placeholder="(555) 000-0000" className={INPUT_CLASS} />
                      ) : (
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile?.phoneNumber || 'Not set'}</p>
                      )}
                    </div>
                    {isEditingProfile && (
                      <div className="flex gap-4 pt-4">
                        <button onClick={handleUpdateProfile} className="bg-primary text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all">Save Changes</button>
                        <button onClick={() => setIsEditingProfile(false)} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-8 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── ADDRESSES TAB ── */}
              {activeTab === 'addresses' && (
                <motion.div key="addresses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Saved Addresses</h3>
                      {!isAddingAddress && (
                        <button onClick={() => setIsAddingAddress(true)} className="flex items-center gap-2 bg-primary text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all text-sm">
                          <Plus size={16} /> Add New
                        </button>
                      )}
                    </div>

                    {isAddingAddress || editingAddress ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Address Label</label>
                            <input type="text" value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} className={INPUT_CLASS} />
                          </div>
                          <div><label className="block text-sm font-medium text-slate-500 mb-1">First Name</label><input type="text" value={addressForm.firstName} onChange={e => setAddressForm({ ...addressForm, firstName: e.target.value })} className={INPUT_CLASS} /></div>
                          <div><label className="block text-sm font-medium text-slate-500 mb-1">Last Name</label><input type="text" value={addressForm.lastName} onChange={e => setAddressForm({ ...addressForm, lastName: e.target.value })} className={INPUT_CLASS} /></div>
                          <div className="col-span-2"><label className="block text-sm font-medium text-slate-500 mb-1">Street Address</label><input type="text" value={addressForm.street} onChange={e => setAddressForm({ ...addressForm, street: e.target.value })} className={INPUT_CLASS} /></div>
                          <div><label className="block text-sm font-medium text-slate-500 mb-1">City</label><input type="text" value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className={INPUT_CLASS} /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-sm font-medium text-slate-500 mb-1">State</label><input type="text" value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className={INPUT_CLASS} /></div>
                            <div><label className="block text-sm font-medium text-slate-500 mb-1">ZIP</label><input type="text" value={addressForm.zipCode} onChange={e => setAddressForm({ ...addressForm, zipCode: e.target.value })} className={INPUT_CLASS} /></div>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="w-4 h-4 rounded text-primary" />
                            <label htmlFor="isDefault" className="text-sm font-medium text-slate-700 dark:text-slate-300">Set as default</label>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button onClick={handleSaveAddress} className="bg-primary text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all">Save Address</button>
                          <button onClick={() => { setIsAddingAddress(false); setEditingAddress(null); }} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-8 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {profile?.addresses?.map(address => (
                          <div key={address.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  {address.label}
                                  {address.isDefault && <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-black">Default</span>}
                                </h4>
                                <p className="text-sm text-slate-500 mt-0.5">{address.firstName} {address.lastName}</p>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => { setEditingAddress(address); setAddressForm(address); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-primary transition-all"><UserIcon size={14} /></button>
                                <button onClick={() => handleDeleteAddress(address.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{address.street}<br />{address.city}, {address.state} {address.zipCode}</p>
                          </div>
                        ))}
                        {(!profile?.addresses || profile.addresses.length === 0) && (
                          <div className="col-span-2 text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <MapPin className="mx-auto text-slate-300 mb-3" size={36} />
                            <p className="text-slate-500 dark:text-slate-400">No saved addresses yet.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── ORDERS TAB ── */}
              {activeTab === 'orders' && (
                <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Order History</h3>
                    <div className="space-y-4">
                      {orders.map(order => (
                        <div key={order.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex gap-6">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Order Placed</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatDate(order.createdAt)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">${order.total.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Status</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                  order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>{order.status.replace('_', ' ')}</span>
                              </div>
                            </div>
                            <p className="text-[10px] font-mono text-slate-400">#{order.id.slice(-8).toUpperCase()}</p>
                          </div>
                          <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                              <div className="flex-1 space-y-3">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex gap-4">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                      <img src={products.find(p => p.name === item.name)?.image || ''} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</h4>
                                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                      <p className="text-xs font-bold text-primary">${item.price.toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-col gap-2 justify-center">
                                <button onClick={() => onReorder(order.items)} className="flex items-center justify-center gap-2 bg-primary text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all text-sm whitespace-nowrap">
                                  <ShoppingBag size={16} /> Buy it again
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="text-center py-20">
                          <Package className="mx-auto text-slate-200 mb-4" size={56} />
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No orders yet</h4>
                          <p className="text-slate-500">Your order history will appear here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── LOYALTY TAB ── */}
              {activeTab === 'loyalty' && (
                <motion.div key="loyalty" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Loyalty & Rewards</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                      Earn 1 point for every $1 you spend. Unlock tiers to get exclusive perks and discounts.
                    </p>

                    <LoyaltyCard totalSpent={totalSpent} orderCount={orderCount} />

                    {/* Tier comparison table */}
                    <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                      <h4 className="font-black text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider">All Tiers</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'Bronze', range: '0 – 499 pts', perk: 'Early access to new flavours', emoji: '🍪' },
                          { name: 'Silver', range: '500 – 999 pts', perk: '5% off every order', emoji: '🎂' },
                          { name: 'Gold', range: '1,000+ pts', perk: '10% off + free shipping forever', emoji: '👑' },
                        ].map(t => (
                          <div key={t.name} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                            <span className="text-xl w-7">{t.emoji}</span>
                            <div className="flex-1">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</span>
                              <span className="text-slate-400 text-xs ml-2">{t.range}</span>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{t.perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
