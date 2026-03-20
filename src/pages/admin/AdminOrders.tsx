import React, { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'motion/react';
import { 
  ChevronsUpDown, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Copy, 
  X, 
  User as UserIcon, 
  Truck, 
  ShoppingBag, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../utils/firebaseUtils';
import { useToast } from '../../components/Toast';

interface AdminOrdersProps {
  formatPrice: (price: number) => string;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ formatPrice }) => {
  const { addToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderSort, setOrderSort] = useState<{ field: string, direction: 'asc' | 'desc' }>({ field: 'createdAt', direction: 'desc' });
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<any | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => setOrdersPage(1), [searchQuery, statusFilter, orderSort]);

  const getOrderTime = (order: any) => {
    if (!order.createdAt) return 0;
    if (order.createdAt.toDate) return order.createdAt.toDate().getTime();
    return new Date(order.createdAt).getTime();
  };

  useEffect(() => {
    const ordersQuery = collectionGroup(db, 'orders');
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ref: doc.ref,
        userId: doc.ref.parent.parent?.id,
        ...doc.data()
      }));
      ordersData.sort((a: any, b: any) => getOrderTime(b) - getOrderTime(a));
      setOrders(ordersData);
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'orders (collectionGroup)');
    });

    return () => unsubscribeOrders();
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
      addToast(`Order status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error("Error updating order status:", error);
      addToast("Failed to update status", "error");
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
      addToast("Order cancelled successfully", "success");
      setOrderToCancel(null);
    } catch (error) {
      console.error("Error cancelling order:", error);
      addToast("Failed to cancel order", "error");
      handleFirestoreError(error, OperationType.UPDATE, orderToCancel.ref.path);
    }
  };

  const sortData = (data: any[], sortConfig: { field: string, direction: 'asc' | 'desc' }) => {
    return [...data].sort((a, b) => {
      let valA = a[sortConfig.field];
      let valB = b[sortConfig.field];

      if (sortConfig.field === 'createdAt') {
        valA = getOrderTime(a);
        valB = getOrderTime(b);
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

  const paginatedOrders = filteredOrders.slice((ordersPage - 1) * ITEMS_PER_PAGE, ordersPage * ITEMS_PER_PAGE);
  const totalOrdersPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

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

  const toggleSort = (field: string) => {
    if (orderSort.field === field) {
      setOrderSort({ field, direction: orderSort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setOrderSort({ field, direction: 'desc' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800/50 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
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

      <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Order ID</th>
                <th 
                  className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => toggleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Date
                    <SortIcon field="createdAt" currentSort={orderSort} />
                  </div>
                </th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Customer</th>
                <th 
                  className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => toggleSort('total')}
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
                      <div className="flex flex-col gap-1">
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Order Details</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">ID: {selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    Customer Info
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-medium text-slate-900 dark:text-slate-300">Name:</span> {selectedOrder.shippingInfo ? `${selectedOrder.shippingInfo.firstName} ${selectedOrder.shippingInfo.lastName}` : 'N/A'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-medium text-slate-900 dark:text-slate-300">Email:</span> {selectedOrder.customerEmail}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-medium text-slate-900 dark:text-slate-300">User ID:</span> <span className="font-mono">{selectedOrder.userId}</span>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-900 dark:text-slate-300">Date:</span> {new Date(getOrderTime(selectedOrder)).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedOrder.shippingInfo && (
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary" />
                      Shipping Address
                    </h4>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedOrder.shippingInfo.address}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state} {selectedOrder.shippingInfo.zip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Order Status & Tracking
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
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

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Carrier</label>
                      <input 
                        type="text" 
                        placeholder="e.g. FedEx, UPS"
                        value={selectedOrder.carrier || ''}
                        onChange={(e) => setSelectedOrder({...selectedOrder, carrier: e.target.value})}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Tracking Number</label>
                      <input 
                        type="text" 
                        placeholder="Enter tracking number"
                        value={selectedOrder.trackingNumber || ''}
                        onChange={(e) => setSelectedOrder({...selectedOrder, trackingNumber: e.target.value})}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Tracking Link</label>
                      <input 
                        type="url" 
                        placeholder="https://..."
                        value={selectedOrder.trackingLink || ''}
                        onChange={(e) => setSelectedOrder({...selectedOrder, trackingLink: e.target.value})}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          setUpdatingOrderId(selectedOrder.id);
                          await updateDoc(selectedOrder.ref, {
                            carrier: selectedOrder.carrier || '',
                            trackingNumber: selectedOrder.trackingNumber || '',
                            trackingLink: selectedOrder.trackingLink || ''
                          });
                          addToast("Tracking information updated!", "success");
                        } catch (error) {
                          console.error("Error updating tracking info:", error);
                          addToast("Failed to update tracking info", "error");
                          handleFirestoreError(error, OperationType.UPDATE, selectedOrder.ref.path);
                        } finally {
                          setUpdatingOrderId(null);
                        }
                      }}
                      disabled={updatingOrderId === selectedOrder.id}
                      className="w-full py-2 bg-primary text-slate-900 font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      {updatingOrderId === selectedOrder.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Tracking Info'}
                    </button>
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

      {/* Cancellation Confirmation Modal */}
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
    </div>
  );
};
