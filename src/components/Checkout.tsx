import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Truck, 
  CreditCard, 
  Lock, 
  Loader2, 
  ShieldCheck, 
  ChevronUp, 
  X 
} from 'lucide-react';
import { useToast } from './Toast';

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(value);
  const display = useTransform(motionValue, (current) => `$${current.toFixed(2)}`);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration: 0.4, ease: "easeOut" });
    return controls.stop;
  }, [value, motionValue]);

  return <motion.span>{display}</motion.span>;
}

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

interface CheckoutProps {
  cartItems: Record<string, CartItem>;
  onBack: () => void;
  onPlaceOrder: (email: string, shippingInfo: ShippingInfo) => Promise<void>;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export function Checkout({ cartItems, onBack, onPlaceOrder }: CheckoutProps) {
  const { addToast } = useToast();
  const items = Object.values(cartItems);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 5.99 : 0;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'paypal' | 'google_pay' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMethod) {
      setErrorMsg('Please select a payment method.');
      return;
    }
    setErrorMsg(null);
    
    if (paymentMethod !== 'card') {
      // For alternative payment methods, we might not need full card validation
      // But we still need shipping info.
    }
    setIsProcessing(true);
    // Simulate API call
    setTimeout(async () => {
      try {
        await onPlaceOrder(email, shippingInfo);
        addToast("Order placed successfully!", "success");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to place order. Please try again.";
        setErrorMsg(msg);
        addToast(msg, "error");
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-4">
        <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Add some delicious treats before checking out.</p>
        <button 
          onClick={onBack}
          className="bg-primary text-slate-900 font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20 pt-24">
      {/* Header */}
      <header className="bg-white dark:bg-background-dark/90 border-b border-soft-mint dark:border-slate-800 sticky top-24 z-10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-soft-mint dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Back to cart"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Checkout</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          
          {/* Form Sections */}
          <div className="md:col-span-2 space-y-8">
            {errorMsg && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{errorMsg}</span>
              </div>
            )}
            
            {/* Shipping Info */}
            <section className="bg-white dark:bg-background-dark/50 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-primary" />
                </div>
                Shipping Information
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                  <input 
                    required 
                    type="text" 
                    autoComplete="given-name" 
                    placeholder="Jane" 
                    value={shippingInfo.firstName}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                  <input 
                    required 
                    type="text" 
                    autoComplete="family-name" 
                    placeholder="Doe" 
                    value={shippingInfo.lastName}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    autoComplete="email" 
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Street Address</label>
                  <input 
                    required 
                    type="text" 
                    autoComplete="street-address" 
                    placeholder="123 Magnolia Lane" 
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">City</label>
                  <input 
                    required 
                    type="text" 
                    autoComplete="address-level2" 
                    placeholder="New York" 
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 col-span-2 sm:col-span-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">State</label>
                    <input 
                      required 
                      type="text" 
                      autoComplete="address-level1" 
                      placeholder="NY" 
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ZIP</label>
                    <input 
                      required 
                      type="text" 
                      autoComplete="postal-code" 
                      inputMode="numeric" 
                      placeholder="10001" 
                      value={shippingInfo.zip}
                      onChange={(e) => setShippingInfo(prev => ({ ...prev, zip: e.target.value }))}
                      className="w-full px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Billing Info */}
            <section className="bg-white dark:bg-background-dark/50 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Method
                </h2>
                <div className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <Lock className="w-3 h-3" />
                  Secure
                </div>
              </div>
              
              {/* Alternative Payment Options as Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod(paymentMethod === 'apple_pay' ? 'card' : 'apple_pay')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                    paymentMethod === 'apple_pay' 
                      ? 'border-black bg-black text-white scale-[1.02] shadow-md' 
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                  aria-label="Pay with Apple Pay"
                  aria-pressed={paymentMethod === 'apple_pay'}
                >
                  <svg className="w-6 h-6" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                  <span className="text-xs font-bold">Apple Pay</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => setPaymentMethod(paymentMethod === 'paypal' ? 'card' : 'paypal')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                    paymentMethod === 'paypal' 
                      ? 'border-[#FFC439] bg-[#FFC439] text-[#003087] scale-[1.02] shadow-md' 
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                  aria-label="Pay with PayPal"
                  aria-pressed={paymentMethod === 'paypal'}
                >
                  <svg className="w-6 h-6" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true"><path d="M111.4 295.9c-3.5 19.2-17.4 108.7-21.5 134-.3 1.8-1 2.5-3 2.5H12.7c-2.5 0-4.6-2.4-4.2-4.9l47.5-298.3c.4-2.4 2.4-4.2 4.9-4.2h106.6c45.5 0 89.9 12 104.9 57.2 11.4 34.3 2 79-22.9 105.4-21.3 22.6-54.1 33.7-90.2 33.7H111.4z"/></svg>
                  <span className="text-xs font-bold">PayPal</span>
                </button>

                <button 
                  type="button" 
                  onClick={() => setPaymentMethod(paymentMethod === 'google_pay' ? 'card' : 'google_pay')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                    paymentMethod === 'google_pay' 
                      ? 'border-slate-900 bg-white text-slate-900 scale-[1.02] shadow-md dark:bg-slate-800 dark:text-white dark:border-white' 
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                  aria-label="Pay with Google Pay"
                  aria-pressed={paymentMethod === 'google_pay'}
                >
                  <svg className="w-6 h-6" viewBox="0 0 488 512" fill="currentColor" aria-hidden="true"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></svg>
                  <span className="text-xs font-bold">Google Pay</span>
                </button>
              </div>

              <div className="relative flex items-center py-6">
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Or pay with card</span>
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              </div>
              
              <div 
                className={`space-y-5 transition-all duration-500 p-6 rounded-2xl border-2 cursor-pointer ${
                  paymentMethod === 'card' 
                    ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                    : 'border-slate-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20 opacity-60 hover:opacity-100'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Credit or Debit Card</span>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                    <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                    <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Card Number</label>
                  <div className="relative">
                    <input required={paymentMethod === 'card'} disabled={paymentMethod !== 'card' && paymentMethod !== null} type="text" autoComplete="cc-number" inputMode="numeric" placeholder="0000 0000 0000 0000" maxLength={19} className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono disabled:bg-slate-50 dark:disabled:bg-slate-800/50" />
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Expiration</label>
                    <input required={paymentMethod === 'card'} disabled={paymentMethod !== 'card' && paymentMethod !== null} type="text" autoComplete="cc-exp" inputMode="numeric" placeholder="MM/YY" maxLength={5} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono disabled:bg-slate-50 dark:disabled:bg-slate-800/50" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">CVC</label>
                    <input required={paymentMethod === 'card'} disabled={paymentMethod !== 'card' && paymentMethod !== null} type="text" autoComplete="cc-csc" inputMode="numeric" placeholder="123" maxLength={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono disabled:bg-slate-50 dark:disabled:bg-slate-800/50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                  <input required={paymentMethod === 'card'} disabled={paymentMethod !== 'card' && paymentMethod !== null} type="text" autoComplete="cc-name" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-background-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:bg-slate-50 dark:disabled:bg-slate-800/50" />
                </div>
              </div>
            </section>
          </div>

          {/* Order Summary - Desktop */}
          <div className="hidden md:block md:col-span-1 self-start sticky top-24">
            <div className="bg-white dark:bg-background-dark/50 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Order Summary</h2>
              
              <div className="space-y-5 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                      key={item.product.name} 
                      className="flex gap-4 group"
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform">
                        <img src={item.product.image} alt={item.product.alt} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.product.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Quantity: {item.quantity}</p>
                        <p className="font-bold text-sm text-primary mt-2">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 mb-8">
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    <AnimatedNumber value={subtotal} />
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Shipping</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    <AnimatedNumber value={shipping} />
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    <AnimatedNumber value={tax} />
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                    <span className="text-3xl font-black text-primary">
                      <AnimatedNumber value={total} />
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  type="submit"
                  disabled={isProcessing || !paymentMethod}
                  className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-black py-5 rounded-2xl text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:active:scale-100 disabled:shadow-none"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      {paymentMethod === 'apple_pay' ? 'Pay with Apple Pay' : 
                       paymentMethod === 'paypal' ? 'Pay with PayPal' : 
                       paymentMethod === 'google_pay' ? 'Pay with Google Pay' : 
                       'Complete Purchase'}
                    </>
                  )}
                </button>
                
                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Secure Checkout</span>
                  </div>
                  <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                  </p>
                  <div className="flex gap-3 mt-1 grayscale opacity-50">
                    <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                    <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                    <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Mobile Summary Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <div className="px-4 py-4 flex items-center justify-between gap-4">
          <button 
            type="button"
            onClick={() => setIsMobileSummaryOpen(true)}
            className="flex flex-col items-start"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              Total
              <ChevronUp className="w-3 h-3" />
            </span>
            <span className="text-xl font-black text-primary">
              <AnimatedNumber value={total} />
            </span>
          </button>
          <button 
            type="button"
            onClick={() => {
              const form = document.querySelector('form');
              if (form) form.requestSubmit();
            }}
            disabled={isProcessing || !paymentMethod}
            className="flex-1 bg-primary hover:bg-primary/90 text-slate-900 font-black py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {isProcessing ? 'Processing...' : 
             paymentMethod === 'apple_pay' ? 'Pay with Apple Pay' : 
             paymentMethod === 'paypal' ? 'Pay with PayPal' : 
             paymentMethod === 'google_pay' ? 'Pay with Google Pay' : 
             'Complete Purchase'}
          </button>
        </div>
      </div>

      {/* Mobile Summary Bottom Sheet */}
      <AnimatePresence>
        {isMobileSummaryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSummaryOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white dark:bg-slate-900 rounded-t-[2.5rem] z-50 p-8 md:hidden max-h-[85vh] overflow-y-auto shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8" />
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Order Summary</h2>
                <button 
                  onClick={() => setIsMobileSummaryOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <div key={item.product.name} className="flex gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100 dark:border-slate-800">
                      <img src={item.product.image} alt={item.product.alt} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.product.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Quantity: {item.quantity}</p>
                      <p className="font-bold text-sm text-primary mt-2">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 mb-8">
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    <AnimatedNumber value={subtotal} />
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Shipping</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    <AnimatedNumber value={shipping} />
                  </span>
                </div>
                <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>Tax (8%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    <AnimatedNumber value={tax} />
                  </span>
                </div>
                <div className="flex justify-between items-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                    <span className="text-3xl font-black text-primary">
                      <AnimatedNumber value={total} />
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsMobileSummaryOpen(false)}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-5 rounded-2xl transition-all active:scale-95"
              >
                Continue to Payment
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
