import React from 'react';
import { useNavigate, Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { AdminDashboard } from '../components/AdminDashboard';
import { AdminOrders } from './admin/AdminOrders';
import { AdminProducts } from './admin/AdminProducts';
import { AdminCustomers } from './admin/AdminCustomers';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface AdminPageProps {
  isAdminUser: boolean;
  formatPrice: (price: number) => string;
}

const AdminPage: React.FC<AdminPageProps> = ({
  isAdminUser, formatPrice
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAdminUser) {
    return <Navigate to="/" />;
  }

  const isHome = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-24">
      <header className="bg-white dark:bg-background-dark/90 border-b border-soft-mint dark:border-slate-800 sticky top-24 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => isHome ? navigate('/') : navigate('/admin')}
              className="p-2 hover:bg-soft-mint dark:hover:bg-slate-800 rounded-full transition-colors"
              title={isHome ? "Back to Store" : "Back to Dashboard"}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Admin {isHome ? 'Dashboard' : location.pathname.split('/').pop()?.charAt(0).toUpperCase() + location.pathname.split('/').pop()?.slice(1)}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Routes>
            <Route index element={<AdminDashboard onNavigate={(path) => navigate(`/admin/${path}`)} formatPrice={formatPrice} />} />
            <Route path="orders" element={<AdminOrders formatPrice={formatPrice} />} />
            <Route path="products" element={<AdminProducts formatPrice={formatPrice} />} />
            <Route path="customers" element={<AdminCustomers formatPrice={formatPrice} />} />
          </Routes>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminPage;
