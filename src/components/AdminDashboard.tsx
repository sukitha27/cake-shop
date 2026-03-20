import React, { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot, updateDoc, collection, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { motion } from 'motion/react';
import { 
  ChevronsUpDown, 
  ChevronUp, 
  ChevronDown, 
  ArrowLeft, 
  ShieldCheck, 
  Loader2, 
  Search, 
  Copy, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  User as UserIcon, 
  Truck, 
  ShoppingBag, 
  Image as ImageIcon, 
  Upload, 
  History, 
  AlertTriangle 
} from 'lucide-react';
import { handleFirestoreError, OperationType, Product, FALLBACK_IMAGE } from '../App';
import { useToast } from './Toast';

interface AdminDashboardProps {
  onBack: () => void;
  formatPrice: (price: number) => string;
}

export function AdminDashboard({ onBack, formatPrice }: AdminDashboardProps) {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'products'>('orders');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderSort, setOrderSort] = useState<{ field: string, direction: 'asc' | 'desc' }>({ field: 'createdAt', direction: 'desc' });
  const [customerSort, setCustomerSort] = useState<{ field: string, direction: 'asc' | 'desc' }>({ field: 'totalSpent', direction: 'desc' });
  const [productSort, setProductSort] = useState<{ field: string, direction: 'asc' | 'desc' }>({ field: 'name', direction: 'asc' });
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<any | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [ordersPage, setOrdersPage] = useState(1);
  const [customersPage, setCustomersPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => setOrdersPage(1), [searchQuery, statusFilter, orderSort]);
  useEffect(() => setCustomersPage(1), [customerSearchQuery, customerSort]);
  useEffect(() => setProductsPage(1), [productSearchQuery, productSort]);

  const getOrderTime = (order: any) => {
    if (!order.createdAt) return 0;
    if (order.createdAt.toDate) return order.createdAt.toDate().getTime();
    return new Date(order.createdAt).getTime();
  };

  useEffect(() => {
    // Fetch all orders using collectionGroup
    const ordersQuery = collectionGroup(db, 'orders');
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ref: doc.ref,
        userId: doc.ref.parent.parent?.id,
        ...doc.data()
      }));
      // Sort by createdAt descending
      ordersData.sort((a: any, b: any) => getOrderTime(b) - getOrderTime(a));
      setOrders(ordersData);
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'orders (collectionGroup)');
    });

    const productsRef = collection(db, 'products');
    const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  const formatDate = (date: any) => {
    if (!date) return 'Pending...';
    if (date.toDate) return date.toDate().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  const handleStatusChange = async (orderRef: any, newStatus: string, orderData?: any) => {
    if (newStatus === 'cancelled') {
      setOrderToCancel(orderData);
      return;
    }
    try {
      setUpdatingOrderId(orderRef.id);
      await updateDoc(orderRef, { status: newStatus });
      setSuccessMsg(`Order status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error("Error updating order status:", error);
      setErrorMsg("Failed to update status. Please check permissions.");
      setTimeout(() => setErrorMsg(null), 3000);
      handleFirestoreError(error, OperationType.UPDATE, orderRef.path);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const confirmCancellation = async () => {
    if (!orderToCancel) return;
    try {
      await updateDoc(orderToCancel.ref, { status: 'cancelled' });
      if (selectedOrder && selectedOrder.id === orderToCancel.id) {
        setSelectedOrder({...selectedOrder, status: 'cancelled'});
      }
      setOrderToCancel(null);
    } catch (error) {
      console.error("Error cancelling order:", error);
      setErrorMsg("Failed to cancel order. Please check permissions.");
      setTimeout(() => setErrorMsg(null), 3000);
      handleFirestoreError(error, OperationType.UPDATE, orderToCancel.ref.path);
    }
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      let imageUrl = productData.image;

      if (selectedFile) {
        setUploadingImage(true);
        setUploadProgress(0);
        const storageRef = ref(storage, `products/${Date.now()}_${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        imageUrl = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            }, 
            (error) => reject(error), 
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      }

      const finalProductData = { ...productData, image: imageUrl };

      if (isEditingProduct && isEditingProduct.id) {
        await setDoc(doc(db, 'products', isEditingProduct.id), finalProductData);
        setSuccessMsg("Product updated successfully!");
      } else {
        await addDoc(collection(db, 'products'), finalProductData);
        setSuccessMsg("Product added successfully!");
      }
      setTimeout(() => setSuccessMsg(null), 3000);
      setIsEditingProduct(null);
      setIsAddingProduct(false);
      setSelectedFile(null);
      setImagePreview(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error saving product:", error);
      setErrorMsg("Failed to save product. Please check permissions.");
      setTimeout(() => setErrorMsg(null), 3000);
      handleFirestoreError(error, OperationType.WRITE, 'products');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      addToast("Product deleted successfully!", "success");
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      addToast("Failed to delete product", "error");
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  };

  // Derive unique customers from orders if users collection is empty or doesn't have all info
  const customersMap = new Map();
  orders.forEach(order => {
    const key = order.customerEmail || order.userId;
    if (key) {
      if (!customersMap.has(key)) {
        customersMap.set(key, {
          email: order.customerEmail || 'Unknown',
          userId: order.userId || 'Unknown',
          orderCount: 1,
          totalSpent: order.total,
          lastOrderDate: order.createdAt
        });
      } else {
        const customer = customersMap.get(key);
        customer.orderCount += 1;
        customer.totalSpent += order.total;
        if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
          customer.lastOrderDate = order.createdAt;
        }
      }
    }
  });
  const derivedCustomers = Array.from(customersMap.values());

  const sortData = (data: any[], sortConfig: { field: string, direction: 'asc' | 'desc' }) => {
    return [...data].sort((a, b) => {
      let valA = a[sortConfig.field];
      let valB = b[sortConfig.field];

      if (sortConfig.field === 'createdAt' || sortConfig.field === 'lastOrderDate') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredOrders = sortData(
    orders.filter(order => {
      const matchesSearch = 
        (order.id && order.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.customerEmail && order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (order.userId && order.userId.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    }),
    orderSort
  );

  const filteredCustomers = sortData(
    derivedCustomers.filter(customer => 
      customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.userId.toLowerCase().includes(customerSearchQuery.toLowerCase())
    ),
    customerSort
  );

  const filteredProducts = sortData(
    products.filter(product => 
      product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(productSearchQuery.toLowerCase())
    ),
    productSort
  );

  const paginatedOrders = filteredOrders.slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE);
  const totalOrdersPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const paginatedCustomers = filteredCustomers.slice((customersPage - 1) * ITEMS_PER_PAGE, customersPage * ITEMS_PER_PAGE);
  const totalCustomersPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice((productsPage - 1) * ITEMS_PER_PAGE, productsPage * ITEMS_PER_PAGE);
  const totalProductsPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (p: number) => void }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
        <div className="text-sm text-slate-500">
          Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const SortIcon = ({ field, currentSort }: { field: string, currentSort: { field: string, direction: 'asc' | 'desc' } }) => {
    if (currentSort.field !== field) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    return (
      <span className="text-primary">
        {currentSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </span>
    );
  };

  const toggleSort = (field: string, currentSort: any, setSort: any) => {
    if (currentSort.field === field) {
      setSort({ field, direction: currentSort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, direction: 'desc' });
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-24">
      <header className="bg-white dark:bg-background-dark/90 border-b border-soft-mint dark:border-slate-800 sticky top-24 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-soft-mint dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Admin Dashboard
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {errorMsg && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative animate-in slide-in-from-top duration-300" role="alert">
            <span className="block sm:inline">{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative animate-in slide-in-from-top duration-300" role="alert">
            <span className="block sm:inline">{successMsg}</span>
          </div>
        )}
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800" role="tablist" aria-label="Admin Dashboard Sections">
          <button
            role="tab"
            aria-selected={activeTab === 'orders'}
            aria-controls="orders-panel"
            id="orders-tab"
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'orders' ? 'text-primary' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            All Orders
            {activeTab === 'orders' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
            )}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'customers'}
            aria-controls="customers-panel"
            id="customers-tab"
            onClick={() => setActiveTab('customers')}
            className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'customers' ? 'text-primary' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Customers
            {activeTab === 'customers' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
            )}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'products'}
            aria-controls="products-panel"
            id="products-tab"
            onClick={() => setActiveTab('products')}
            className={`pb-4 px-2 font-bold transition-colors relative ${activeTab === 'products' ? 'text-primary' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Products
            {activeTab === 'products' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20" aria-live="polite" aria-busy="true">
            <Loader2 className="w-10 h-10 animate-spin text-primary" aria-hidden="true" />
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            {activeTab === 'orders' ? (
              <div className="flex flex-col gap-4" role="tabpanel" id="orders-panel" aria-labelledby="orders-tab">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Search orders..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Order ID</th>
                        <th 
                          className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => toggleSort('createdAt', orderSort, setOrderSort)}
                        >
                          <div className="flex items-center gap-1">
                            Date
                            <SortIcon field="createdAt" currentSort={orderSort} />
                          </div>
                        </th>
                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Customer</th>
                        <th 
                          className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => toggleSort('total', orderSort, setOrderSort)}
                        >
                          <div className="flex items-center gap-1">
                            Total
                            <SortIcon field="total" currentSort={orderSort} />
                          </div>
                        </th>
                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Status</th>
                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">No orders found.</td>
                        </tr>
                      ) : (
                        paginatedOrders.map((order) => (
                          <tr key={order.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-4 text-sm font-mono text-slate-500">
                              <div className="flex items-center gap-2">
                                {order.id.slice(-6).toUpperCase()}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(order.id);
                                    addToast("Order ID copied to clipboard!", "info");
                                  }}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                  title="Copy Full ID"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-slate-900 dark:text-white">
                              {formatDate(order.createdAt)} <br/>
                              <span className="text-xs text-slate-500">{new Date(getOrderTime(order)).toLocaleTimeString()}</span>
                            </td>
                            <td className="p-4 text-sm text-slate-900 dark:text-white">
                              {order.customerEmail || 'Unknown'} <br/>
                              <span className="text-xs text-slate-500 font-mono">{order.userId?.slice(0, 8)}...</span>
                            </td>
                            <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">{formatPrice(order.total)}</td>
                             <td className="p-4">
                              <div className="flex items-center gap-2">
                                <select 
                                  value={order.status}
                                  disabled={updatingOrderId === order.id}
                                  onChange={(e) => handleStatusChange(order.ref, e.target.value, order)}
                                  className={`text-sm font-bold px-3 py-1.5 rounded-full border-2 outline-none cursor-pointer transition-all ${
                                    updatingOrderId === order.id ? 'opacity-50 cursor-wait' : ''
                                  } ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                                    order.status === 'processing' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                                    order.status === 'shipped' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' :
                                    order.status === 'out_for_delivery' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                                    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                  }`}
                                >
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="out_for_delivery">Out for Delivery</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                                {updatingOrderId === order.id && (
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="text-primary hover:text-primary/80 font-bold text-sm"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <PaginationControls currentPage={ordersPage} totalPages={totalOrdersPages} onPageChange={setOrdersPage} />
              </div>
            ) : activeTab === 'customers' ? (
              <div className="flex flex-col gap-4" role="tabpanel" id="customers-panel" aria-labelledby="customers-tab">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Search customers..." 
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="text-sm text-slate-500">
                    Total Customers: <span className="font-bold text-slate-900 dark:text-white">{filteredCustomers.length}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Email</th>
                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">User ID</th>
                        <th 
                          className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => toggleSort('orderCount', customerSort, setCustomerSort)}
                        >
                          <div className="flex items-center gap-1">
                            Total Orders
                            <SortIcon field="orderCount" currentSort={customerSort} />
                          </div>
                        </th>
                        <th 
                          className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => toggleSort('totalSpent', customerSort, setCustomerSort)}
                        >
                          <div className="flex items-center gap-1">
                            Total Spent
                            <SortIcon field="totalSpent" currentSort={customerSort} />
                          </div>
                        </th>
                        <th 
                          className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => toggleSort('lastOrderDate', customerSort, setCustomerSort)}
                        >
                          <div className="flex items-center gap-1">
                            Last Order
                            <SortIcon field="lastOrderDate" currentSort={customerSort} />
                          </div>
                        </th>
                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">No customers found.</td>
                        </tr>
                      ) : (
                        paginatedCustomers.map((customer, idx) => (
                          <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">{customer.email}</td>
                            <td className="p-4 text-sm font-mono text-slate-500">{customer.userId}</td>
                            <td className="p-4 text-sm text-slate-900 dark:text-white">{customer.orderCount}</td>
                            <td className="p-4 text-sm font-bold text-primary">{formatPrice(customer.totalSpent)}</td>
                            <td className="p-4 text-sm text-slate-500">{formatDate(customer.lastOrderDate)}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => setSelectedCustomer(customer)}
                                className="text-primary hover:text-primary/80 font-bold text-sm"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <PaginationControls currentPage={customersPage} totalPages={totalCustomersPages} onPageChange={setCustomersPage} />
              </div>
            ) : (
              <div className="flex flex-col gap-4" role="tabpanel" id="products-panel" aria-labelledby="products-tab">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setIsEditingProduct(null);
                      setIsAddingProduct(true);
                      setImagePreview(null);
                      setSelectedFile(null);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Image</th>
                        <th 
                          className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => toggleSort('name', productSort, setProductSort)}
                        >
                          <div className="flex items-center gap-1">
                            Name
                            <SortIcon field="name" currentSort={productSort} />
                          </div>
                        </th>
                        <th 
                          className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => toggleSort('category', productSort, setProductSort)}
                        >
                          <div className="flex items-center gap-1">
                            Category
                            <SortIcon field="category" currentSort={productSort} />
                          </div>
                        </th>
                        <th 
                          className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => toggleSort('price', productSort, setProductSort)}
                        >
                          <div className="flex items-center gap-1">
                            Price
                            <SortIcon field="price" currentSort={productSort} />
                          </div>
                        </th>
                        <th 
                          className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                          onClick={() => toggleSort('stockQuantity', productSort, setProductSort)}
                        >
                          <div className="flex items-center gap-1">
                            Stock
                            <SortIcon field="stockQuantity" currentSort={productSort} />
                          </div>
                        </th>
                        <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">No products found.</td>
                        </tr>
                      ) : (
                        paginatedProducts.map((product) => (
                          <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-4">
                              <img 
                                src={product.image} 
                                alt={product.alt} 
                                className="w-12 h-12 object-cover rounded-lg" 
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target.src !== FALLBACK_IMAGE) {
                                    target.src = FALLBACK_IMAGE;
                                  }
                                }}
                              />
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">{product.name}</td>
                            <td className="p-4 text-sm text-slate-500">{product.category}</td>
                            <td className="p-4 text-sm font-bold text-primary">{formatPrice(product.price)}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                product.stockQuantity === 0 
                                  ? 'bg-red-100 text-red-600' 
                                  : product.stockQuantity < 10 
                                    ? 'bg-amber-100 text-amber-600' 
                                    : 'bg-emerald-100 text-emerald-600'
                              }`}>
                                {product.stockQuantity} in stock
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setIsEditingProduct(product);
                                    setIsAddingProduct(true);
                                    setImagePreview(product.image);
                                    setSelectedFile(null);
                                  }}
                                  className="p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => product.id && setProductToDelete(product)}
                                  className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <PaginationControls currentPage={productsPage} totalPages={totalProductsPages} onPageChange={setProductsPage} />
              </div>
            )}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="order-details-title">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 id="order-details-title" className="text-2xl font-bold text-slate-900 dark:text-white">Order Details</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">ID: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Close order details">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary" />
                  Customer Info
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1"><span className="font-medium text-slate-900 dark:text-slate-300">Email:</span> {selectedOrder.customerEmail}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1"><span className="font-medium text-slate-900 dark:text-slate-300">User ID:</span> <span className="font-mono">{selectedOrder.userId}</span></p>
                  <p className="text-sm text-slate-600 dark:text-slate-400"><span className="font-medium text-slate-900 dark:text-slate-300">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Order Status
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => {
                        handleStatusChange(selectedOrder.ref, e.target.value);
                        setSelectedOrder({...selectedOrder, status: e.target.value});
                      }}
                      className={`text-sm font-bold px-3 py-1.5 rounded-full border-2 outline-none cursor-pointer w-full ${
                        selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                        selectedOrder.status === 'processing' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                        selectedOrder.status === 'shipped' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800' :
                        selectedOrder.status === 'out_for_delivery' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' :
                        selectedOrder.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                        'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary" />
                Order Items
              </h4>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <th className="p-3 font-semibold text-xs text-slate-600 dark:text-slate-300">Item</th>
                      <th className="p-3 font-semibold text-xs text-slate-600 dark:text-slate-300 text-center">Qty</th>
                      <th className="p-3 font-semibold text-xs text-slate-600 dark:text-slate-300 text-right">Price</th>
                      <th className="p-3 font-semibold text-xs text-slate-600 dark:text-slate-300 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <tr key={i} className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                        <td className="p-3 text-sm text-slate-900 dark:text-white font-medium">{item.name}</td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400 text-center">{item.quantity}</td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400 text-right">{formatPrice(item.price)}</td>
                        <td className="p-3 text-sm text-slate-900 dark:text-white font-bold text-right">{formatPrice(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <td colSpan={3} className="p-3 text-sm font-bold text-slate-900 dark:text-white text-right">Order Total:</td>
                      <td className="p-3 text-sm font-bold text-primary text-right">{formatPrice(selectedOrder.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              {selectedOrder.status !== 'cancelled' && (
                <button 
                  onClick={() => setOrderToCancel(selectedOrder)}
                  className="px-4 py-2 rounded-xl font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Cancel Order
                </button>
              )}
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 id="product-modal-title" className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEditingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsAddingProduct(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Close product form">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            
              <form onSubmit={(e) => {
                e.preventDefault();
                if (uploadingImage) return;
                const formData = new FormData(e.currentTarget);
                const productData = {
                  name: formData.get('name') as string,
                  category: formData.get('category') as string,
                  image: formData.get('image') as string,
                  alt: formData.get('alt') as string,
                  price: parseFloat(formData.get('price') as string),
                  stockQuantity: parseInt(formData.get('stockQuantity') as string, 10),
                  description: formData.get('description') as string,
                  ingredients: formData.get('ingredients') as string,
                  nutrition: formData.get('nutrition') as string,
                  dietaryTags: Array.from(formData.getAll('dietaryTags')) as string[],
                };
                handleSaveProduct(productData);
              }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Product Image</label>
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="relative w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-400" />
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-2">
                          <div className="w-full bg-white/20 rounded-full h-1.5 mb-2">
                            <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold">{Math.round(uploadProgress)}%</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="hidden" 
                        id="product-image-upload"
                        disabled={uploadingImage}
                      />
                      <label 
                        htmlFor="product-image-upload"
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors mb-2 ${
                          uploadingImage 
                            ? 'bg-slate-50 dark:bg-slate-900 text-slate-400 cursor-not-allowed' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        {imagePreview ? 'Change Image' : 'Upload Image'}
                      </label>

                      {uploadingImage && (
                        <div className="mb-3 animate-in fade-in slide-in-from-top-1 duration-300">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 border border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                              Uploading to storage...
                            </span>
                            <span>{Math.round(uploadProgress)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                            <motion.div 
                              className="bg-primary h-full shadow-[0_0_10px_rgba(48,232,140,0.5)]"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              transition={{ type: "spring", stiffness: 50, damping: 15 }}
                            />
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-slate-500">Recommended: Square image, max 2MB.</p>
                      <input type="hidden" name="image" value={isEditingProduct?.image || ''} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Name</label>
                  <input required type="text" name="name" defaultValue={isEditingProduct?.name || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input required type="text" name="category" defaultValue={isEditingProduct?.category || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Price ($)</label>
                  <input required type="number" step="0.01" min="0" name="price" defaultValue={isEditingProduct?.price || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Stock Quantity</label>
                  <input required type="number" min="0" name="stockQuantity" defaultValue={isEditingProduct?.stockQuantity ?? 0} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Image Alt Text</label>
                  <input required type="text" name="alt" defaultValue={isEditingProduct?.alt || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea required name="description" rows={3} defaultValue={isEditingProduct?.description || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Ingredients</label>
                  <textarea required name="ingredients" rows={2} defaultValue={isEditingProduct?.ingredients || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nutrition Info</label>
                  <textarea required name="nutrition" rows={2} defaultValue={isEditingProduct?.nutrition || ''} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Dietary Tags</label>
                  <div className="flex flex-wrap gap-4">
                    {['Gluten-Free', 'Nut-Free', 'Vegan', 'Dairy-Free'].map(tag => (
                      <label key={tag} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="dietaryTags" 
                          value={tag} 
                          defaultChecked={isEditingProduct?.dietaryTags?.includes(tag)}
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-6 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploadingImage ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Uploading...
                    </>
                  ) : (
                    'Save Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="customer-details-title">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 id="customer-details-title" className="text-2xl font-bold text-slate-900 dark:text-white">Customer Details</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Close customer details">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedCustomer.orderCount}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(selectedCustomer.totalSpent)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 mb-1">Last Order</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{new Date(selectedCustomer.lastOrderDate).toLocaleDateString()}</p>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Order History
            </h4>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 font-semibold text-xs text-slate-600 dark:text-slate-300">Order ID</th>
                    <th className="p-3 font-semibold text-xs text-slate-600 dark:text-slate-300">Date</th>
                    <th className="p-3 font-semibold text-xs text-slate-600 dark:text-slate-300">Status</th>
                    <th className="p-3 font-semibold text-xs text-slate-600 dark:text-slate-300 text-right">Total</th>
                    <th className="p-3 font-semibold text-xs text-slate-600 dark:text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter(o => (o.userId === selectedCustomer.userId && o.userId) || (o.customerEmail === selectedCustomer.email && o.customerEmail))
                    .map((order) => (
                      <tr key={order.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
                        <td className="p-3 text-sm font-mono text-slate-500">{order.id.slice(-6).toUpperCase()}</td>
                        <td className="p-3 text-sm text-slate-900 dark:text-white">{formatDate(order.createdAt)}</td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            order.status === 'out_for_delivery' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm font-bold text-slate-900 dark:text-white text-right">{formatPrice(order.total)}</td>
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => {
                              setSelectedCustomer(null);
                              setSelectedOrder(order);
                            }}
                            className="text-primary hover:text-primary/80 font-bold text-xs"
                          >
                            View Order
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {orderToCancel && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Cancel Order?</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to cancel order <span className="font-mono font-bold text-slate-900 dark:text-white">{orderToCancel.id.slice(-6).toUpperCase()}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Keep Order
              </button>
              <button 
                onClick={confirmCancellation}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
      {productToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="delete-product-title">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 id="delete-product-title" className="text-xl font-bold text-slate-900 dark:text-white mb-4">Delete Product</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{productToDelete.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => productToDelete.id && handleDeleteProduct(productToDelete.id)}
                className="px-6 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
