import React from 'react';
import { motion } from 'motion/react';
import { Truck, ShoppingBag, Gift } from 'lucide-react';

const OrderPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="py-16 pt-32 px-6 lg:px-20 max-w-[1440px] mx-auto min-h-screen"
    >
      <div className="text-center mb-16">
        <h2 className="text-5xl lg:text-7xl font-display text-slate-900 dark:text-white mb-6">Order Magnolia Bakers</h2>
        <p className="max-w-3xl mx-auto text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
          We make it easy for you to get Magnolia Bakers' best, wherever you are. Choose your preferred way to enjoy our treats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-soft-mint/20 dark:bg-slate-800 p-10 rounded-3xl border border-soft-mint dark:border-slate-700 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
            <Truck className="w-8 h-8 text-primary" />
          </div>
          <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">Nationwide Shipping</h4>
          <p className="text-slate-600 dark:text-slate-400 mb-8 flex-1">Get our famous banana pudding and more delivered to your door anywhere in the US.</p>
          <button className="w-full bg-primary text-slate-900 font-bold px-6 py-4 rounded-xl hover:bg-primary/90 transition-colors uppercase tracking-widest text-sm">ORDER NOW</button>
        </div>

        <div className="bg-soft-mint/20 dark:bg-slate-800 p-10 rounded-3xl border border-soft-mint dark:border-slate-700 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
          <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">Local Pickup</h4>
          <p className="text-slate-600 dark:text-slate-400 mb-8 flex-1">Order ahead and skip the line at your favorite Magnolia Bakers location.</p>
          <button className="w-full bg-primary text-slate-900 font-bold px-6 py-4 rounded-xl hover:bg-primary/90 transition-colors uppercase tracking-widest text-sm">FIND A SHOP</button>
        </div>

        <div className="bg-soft-mint/20 dark:bg-slate-800 p-10 rounded-3xl border border-soft-mint dark:border-slate-700 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h4 className="text-2xl font-bold mb-4 uppercase tracking-tight">Catering</h4>
          <p className="text-slate-600 dark:text-slate-400 mb-8 flex-1">Order through our delivery partners for fresh treats delivered in under an hour.</p>
          <button className="w-full bg-primary text-slate-900 font-bold px-6 py-4 rounded-xl hover:bg-primary/90 transition-colors uppercase tracking-widest text-sm">ORDER DELIVERY</button>
        </div>
      </div>

      <div className="mt-24 bg-slate-900 text-white rounded-[3rem] p-12 lg:p-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000" 
            alt="Bakery" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-4xl font-display mb-6">Planning an Event?</h3>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">From weddings and birthdays to corporate events, our team can help you create a custom dessert menu that your guests will never forget.</p>
          <button className="bg-primary text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-primary/90 transition-colors uppercase tracking-widest">INQUIRE ABOUT CATERING</button>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderPage;
