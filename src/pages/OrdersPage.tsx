import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { FileText, Truck } from 'lucide-react';
import { Order } from '../types';

interface OrdersPageProps {
  orders: Order[];
  formatPrice: (price: number) => string;
  onTrackOrder: (order: Order) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({
  orders, formatPrice, onTrackOrder
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="py-16 pt-32 px-6 lg:px-20 max-w-[1440px] mx-auto min-h-[60vh]"
    >
      <h3 className="text-3xl font-bold mb-8">Order History</h3>
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-soft-mint/20 rounded-3xl">
          <FileText className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-xl text-slate-500 font-medium">You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/products')} className="mt-6 bg-primary text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-soft-mint dark:border-slate-700">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-soft-mint dark:border-slate-700">
                <div>
                  <p className="text-sm text-slate-500">Order Placed</p>
                  <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between items-center">
                    <p className="font-medium">{item.quantity}x {item.name}</p>
                    <p className="text-slate-600 dark:text-slate-400">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-soft-mint dark:border-slate-700 flex justify-end">
                <button 
                  onClick={() => onTrackOrder(order)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-xl font-bold transition-colors"
                  aria-label={`Track order ${order.id.slice(0, 8)}`}
                >
                  <Truck className="w-4 h-4" aria-hidden="true" />
                  Track Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default OrdersPage;
