import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User as UserIcon, MapPin, Phone, Package, LogOut, ChevronRight, Plus, Trash2, Check, X, ShoppingBag } from 'lucide-react';
import { handleFirestoreError, OperationType, Product } from '../App';

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
  createdAt: string;
}

interface AccountPageProps {
  user: User;
  onBack: () => void;
  onReorder: (items: any[]) => void;
  products: Product[];
  onViewInvoice: (order: any) => void;
}

export function AccountPage({ user, onBack, onReorder, products, onViewInvoice }: AccountPageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: ''
  });

  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    label: '',
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          setFormData({
            displayName: data.displayName || user.displayName || '',
            phoneNumber: data.phoneNumber || ''
          });
        }

        const ordersQuery = query(
          collection(db, 'users', user.uid, 'orders'),
          orderBy('createdAt', 'desc')
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching user data:", error);
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
        phoneNumber: formData.phoneNumber
      });
      setProfile(prev => prev ? { ...prev, ...formData } : null);
      setIsEditingProfile(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleSaveAddress = async () => {
    try {
      const newAddress: Address = {
        ...addressForm,
        id: editingAddress?.id || Math.random().toString(36).substr(2, 9)
      };

      let updatedAddresses = [...(profile?.addresses || [])];
      
      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
      }

      if (editingAddress) {
        updatedAddresses = updatedAddresses.map(a => a.id === editingAddress.id ? newAddress : a);
      } else {
        updatedAddresses.push(newAddress);
      }

      await updateDoc(doc(db, 'users', user.uid), {
        addresses: updatedAddresses
      });

      setProfile(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
      setIsAddingAddress(false);
      setEditingAddress(null);
      setAddressForm({
        label: '',
        firstName: '',
        lastName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const updatedAddresses = profile?.addresses?.filter(a => a.id !== addressId) || [];
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: updatedAddresses
      });
      setProfile(prev => prev ? { ...prev, addresses: updatedAddresses } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onBack();
  };

  const formatDate = (date: any) => {
    if (!date) return 'Pending...';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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

              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-primary text-slate-900 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <UserIcon size={20} />
                  Profile Details
                </button>
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'addresses' ? 'bg-primary text-slate-900 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <MapPin size={20} />
                  Saved Addresses
                </button>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-primary text-slate-900 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Package size={20} />
                  Order History
                </button>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                  >
                    <LogOut size={20} />
                    Log Out
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Details</h3>
                    {!isEditingProfile && (
                      <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="text-primary font-bold hover:underline"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                      {isEditingProfile ? (
                        <input 
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile?.displayName || user.displayName || 'Not set'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{user.email}</p>
                      <p className="text-xs text-slate-400 mt-1">Email cannot be changed. Contact support for help.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Phone Number</label>
                      {isEditingProfile ? (
                        <input 
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          placeholder="(555) 000-0000"
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                        />
                      ) : (
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile?.phoneNumber || 'Not set'}</p>
                      )}
                    </div>

                    {isEditingProfile && (
                      <div className="flex gap-4 pt-4">
                        <button 
                          onClick={handleUpdateProfile}
                          className="bg-primary text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all"
                        >
                          Save Changes
                        </button>
                        <button 
                          onClick={() => setIsEditingProfile(false)}
                          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-8 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'addresses' && (
                <motion.div
                  key="addresses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Saved Addresses</h3>
                      {!isAddingAddress && (
                        <button 
                          onClick={() => setIsAddingAddress(true)}
                          className="flex items-center gap-2 bg-primary text-slate-900 font-bold px-4 py-2 rounded-xl hover:bg-primary/90 transition-all"
                        >
                          <Plus size={18} />
                          Add New
                        </button>
                      )}
                    </div>

                    {isAddingAddress || editingAddress ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Address Label (e.g. Home, Work)</label>
                            <input 
                              type="text"
                              value={addressForm.label}
                              onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">First Name</label>
                            <input 
                              type="text"
                              value={addressForm.firstName}
                              onChange={(e) => setAddressForm({ ...addressForm, firstName: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Last Name</label>
                            <input 
                              type="text"
                              value={addressForm.lastName}
                              onChange={(e) => setAddressForm({ ...addressForm, lastName: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Street Address</label>
                            <input 
                              type="text"
                              value={addressForm.street}
                              onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">City</label>
                            <input 
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">State</label>
                            <input 
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">ZIP Code</label>
                            <input 
                              type="text"
                              value={addressForm.zipCode}
                              onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-4">
                            <input 
                              type="checkbox"
                              id="isDefault"
                              checked={addressForm.isDefault}
                              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                              className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="isDefault" className="text-sm font-medium text-slate-700 dark:text-slate-300">Set as default address</label>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                          <button 
                            onClick={handleSaveAddress}
                            className="bg-primary text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-primary/90 transition-all"
                          >
                            Save Address
                          </button>
                          <button 
                            onClick={() => {
                              setIsAddingAddress(false);
                              setEditingAddress(null);
                            }}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-8 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {profile?.addresses?.map((address) => (
                          <div key={address.id} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 relative group">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  {address.label}
                                  {address.isDefault && (
                                    <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>
                                  )}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                  {address.firstName} {address.lastName}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setEditingAddress(address);
                                    setAddressForm(address);
                                  }}
                                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-primary transition-all"
                                >
                                  <UserIcon size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full text-slate-400 hover:text-red-500 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                              {address.street}<br />
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                          </div>
                        ))}
                        {(!profile?.addresses || profile.addresses.length === 0) && (
                          <div className="col-span-2 text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <MapPin className="mx-auto text-slate-300 mb-3" size={40} />
                            <p className="text-slate-500 dark:text-slate-400">No saved addresses yet.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Order History</h3>

                    <div className="space-y-4">
                      {orders.map((order) => (
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
                                }`}>
                                  {order.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Order ID</p>
                              <p className="text-xs font-mono text-slate-500">#{order.id.slice(-8).toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                              <div className="flex-1 space-y-4">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex gap-4">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                                      <img 
                                        src={products.find(p => p.name === item.name)?.image || 'https://picsum.photos/seed/bakery/200'} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover" 
                                      />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-slate-900 dark:text-white">{item.name}</h4>
                                      <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                                      <p className="text-sm font-bold text-primary">${item.price.toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-col gap-2 justify-center">
                                <button 
                                  onClick={() => onReorder(order.items)}
                                  className="flex items-center justify-center gap-2 bg-primary text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all whitespace-nowrap"
                                >
                                  <ShoppingBag size={18} />
                                  Buy it again
                                </button>
                                <button 
                                  onClick={() => onViewInvoice(order)}
                                  className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-all"
                                >
                                  View Invoice
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="text-center py-20">
                          <Package className="mx-auto text-slate-200 mb-4" size={64} />
                          <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No orders yet</h4>
                          <p className="text-slate-500">When you place an order, it will appear here.</p>
                        </div>
                      )}
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
