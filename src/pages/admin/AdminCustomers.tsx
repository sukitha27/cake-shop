import React, { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { motion } from 'motion/react';
import { 
  ChevronsUpDown, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  User as UserIcon, 
  Loader2, 
  X,
  ShoppingBag,
  History
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../utils/firebaseUtils';

interface AdminCustomersProps {
  formatPrice: (price: number) => string;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ formatPrice }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerSort, setCustomerSort] = useState<{ field: string, direction: 'asc' | 'desc' }>({ field: 'totalSpent', direction: 'desc' });
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customersPage, setCustomersPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => setCustomersPage(1), [customerSearchQuery, customerSort]);

  useEffect(() => {
    const ordersQuery = collectionGroup(db, 'orders');
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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

  // Derive unique customers from orders
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
          lastOrderDate: order.createdAt,
          orders: [order]
        });
      } else {
        const customer = customersMap.get(key);
        customer.orderCount += 1;
        customer.totalSpent += order.total;
        customer.orders.push(order);
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

      if (sortConfig.field === 'lastOrderDate') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredCustomers = sortData(
    derivedCustomers.filter(customer => 
      customer.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.userId.toLowerCase().includes(customerSearchQuery.toLowerCase())
    ),
    customerSort
  );

  const paginatedCustomers = filteredCustomers.slice((customersPage - 1) * ITEMS_PER_PAGE, customersPage * ITEMS_PER_PAGE);
  const totalCustomersPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

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
    if (customerSort.field === field) {
      setCustomerSort({ field, direction: customerSort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setCustomerSort({ field, direction: 'desc' });
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

      <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Email</th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">User ID</th>
                <th 
                  className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => toggleSort('orderCount')}
                >
                  <div className="flex items-center gap-1">
                    Total Orders
                    <SortIcon field="orderCount" currentSort={customerSort} />
                  </div>
                </th>
                <th 
                  className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => toggleSort('totalSpent')}
                >
                  <div className="flex items-center gap-1">
                    Total Spent
                    <SortIcon field="totalSpent" currentSort={customerSort} />
                  </div>
                </th>
                <th 
                  className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => toggleSort('lastOrderDate')}
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

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Profile</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedCustomer.orderCount}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(selectedCustomer.totalSpent)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Avg. Order Value</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(selectedCustomer.totalSpent / selectedCustomer.orderCount)}</p>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Order History
            </h4>
            <div className="space-y-3">
              {selectedCustomer.orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(order.total)}</p>
                    <p className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="px-8 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
