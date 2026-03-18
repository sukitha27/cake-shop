import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Minus, Plus, Lock } from 'lucide-react';
import { FALLBACK_IMAGE } from '../App';

interface Product {
  name: string;
  category: string;
  image: string;
  alt: string;
  price: number;
  stockQuantity: number;
  dietaryTags: string[];
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Record<string, CartItem>;
  onUpdateQuantity: (productName: string, delta: number) => void;
  onRemoveItem: (productName: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onCheckout }: CartDrawerProps) {
  const items = Object.values(cartItems);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-background-dark shadow-2xl z-50 flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-drawer-title"
          >
            {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-soft-mint dark:border-slate-800">
          <h2 id="cart-drawer-title" className="text-2xl font-black text-accent dark:text-white uppercase tracking-tight">Your Cart</h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-primary transition-colors"
            aria-label="Close cart"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-700" />
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Your cart is empty.</p>
              <button 
                onClick={onClose}
                className="text-primary font-bold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product.name} className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                    <img 
                      src={item.product.image} 
                      alt={item.product.alt} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== FALLBACK_IMAGE) {
                          target.src = FALLBACK_IMAGE;
                        }
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-accent dark:text-white leading-tight">
                        {item.product.name}
                      </h3>
                      <button 
                        onClick={() => onRemoveItem(item.product.name)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="text-primary font-bold">
                      ${item.product.price.toFixed(2)}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => onUpdateQuantity(item.product.name, -1)}
                        className="w-8 h-8 rounded-full bg-secondary dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary/20 dark:hover:bg-slate-700 transition-colors"
                        aria-label={`Decrease quantity of ${item.product.name}`}
                      >
                        <Minus className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <span className="font-bold text-accent dark:text-white w-4 text-center" aria-live="polite">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => onUpdateQuantity(item.product.name, 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                          item.quantity >= item.product.stockQuantity
                            ? 'bg-slate-100 dark:bg-slate-900 text-slate-300 cursor-not-allowed'
                            : 'bg-secondary dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/20 dark:hover:bg-slate-700'
                        }`}
                        aria-label={`Increase quantity of ${item.product.name}`}
                      >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                      </button>
                      {item.quantity >= item.product.stockQuantity && (
                        <span className="text-[10px] text-red-500 font-medium">Max stock reached</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-soft-mint dark:border-slate-800 bg-soft-mint/50 dark:bg-background-dark/50">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-bold text-slate-600 dark:text-slate-300">Subtotal</span>
              <span className="text-2xl font-black text-accent dark:text-white">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-primary hover:bg-primary/90 text-accent font-bold py-4 rounded-xl text-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Checkout
            </button>
          </div>
        )}
      </motion.div>
    </>
  )}
</AnimatePresence>
  );
}
