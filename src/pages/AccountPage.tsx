import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AccountPage } from '../components/AccountPage';
import { Product, Order } from '../types';

interface AccountPageWrapperProps {
  user: any;
  onReorder: (order: Order) => void;
  products: Product[];
  onViewInvoice: (order: Order) => void;
  formatPrice: (price: number) => string;
  isAdminUser?: boolean;
}

const AccountPageWrapper: React.FC<AccountPageWrapperProps> = ({
  user, onReorder, products, onViewInvoice, formatPrice, isAdminUser
}) => {
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="pt-24"
    >
      <AccountPage 
        user={user} 
        onBack={() => navigate('/')} 
        onReorder={onReorder}
        products={products}
        onViewInvoice={onViewInvoice}
        formatPrice={formatPrice}
        isAdminUser={isAdminUser}
      />
    </motion.div>
  );
};

export default AccountPageWrapper;
