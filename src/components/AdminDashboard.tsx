import React, { useState, useEffect } from 'react';
import { collectionGroup, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { 
  Loader2, 
  ShoppingBag, 
  Users, 
  Package,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firebaseUtils';
import { Product } from '../types';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
  formatPrice: (price: number) => string;
}

export function AdminDashboard({ onNavigate, formatPrice }: AdminDashboardProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.status !== 'cancelled' ? order.total : 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'processing').length;
  const lowStockProducts = products.filter(p => p.stockQuantity < 10).length;

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Low Stock Items', value: lowStockProducts, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  const quickActions = [
    { title: 'Manage Orders', description: 'View, update status, and track shipments', icon: ShoppingBag, path: 'orders', count: pendingOrders, countLabel: 'pending' },
    { title: 'Manage Products', description: 'Add, edit, and manage inventory', icon: Package, path: 'products', count: lowStockProducts, countLabel: 'low stock' },
    { title: 'Customer Insights', description: 'View customer history and spending', icon: Users, path: 'customers', count: orders.length, countLabel: 'total customers' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            onClick={() => onNavigate(action.path)}
            className="group text-left bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary transition-all hover:shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <action.icon className="w-24 h-24" />
            </div>
            
            <div className="relative z-10">
              <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4 group-hover:bg-primary group-hover:text-slate-900 transition-colors">
                <action.icon className="w-6 h-6 text-primary group-hover:text-slate-900" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{action.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{action.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">
                  {action.count} {action.countLabel}
                </span>
                <span className="text-primary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Manage <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Orders
            </h3>
            <button onClick={() => onNavigate('orders')} className="text-sm text-primary font-bold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Order #{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-slate-500">{order.customerEmail || 'Guest'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{formatPrice(order.total)}</p>
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
            {orders.length === 0 && (
              <div className="p-8 text-center text-slate-500">No recent orders.</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Inventory Status
            </h3>
            <button onClick={() => onNavigate('products')} className="text-sm text-primary font-bold hover:underline">Manage Stock</button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.slice(0, 5).map((product) => (
              <div key={product.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    product.stockQuantity === 0 
                      ? 'bg-red-100 text-red-600' 
                      : product.stockQuantity < 10 
                        ? 'bg-amber-100 text-amber-600' 
                        : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {product.stockQuantity} in stock
                  </span>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="p-8 text-center text-slate-500">No products found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
