import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  FileText, 
  Package, 
  Truck, 
  Car, 
  CheckCircle, 
  Info 
} from 'lucide-react';

interface OrderTrackerProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const TRACKING_STEPS = [
  { id: 'placed', label: 'Order Placed', icon: FileText },
  { id: 'processing', label: 'Processing', icon: Package },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'out_for_delivery', label: 'Out for Delivery', icon: Car },
  { id: 'delivered', label: 'Delivered', icon: CheckCircle }
];

export function OrderTracker({ order, isOpen, onClose }: OrderTrackerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [stepTimestamps, setStepTimestamps] = useState<string[]>([]);

  useEffect(() => {
    if (!order) return;

    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    // Calculate current step based on order status
    let step = 0;
    if (order.status === 'delivered') step = 4;
    else if (order.status === 'out_for_delivery') step = 3;
    else if (order.status === 'shipped') step = 2;
    else if (order.status === 'processing') step = 1;
    else if (order.status === 'cancelled') step = -1;
    else step = 0; // Placed

    setCurrentStepIndex(step);

    // Calculate timestamps for each step
    const timestamps = [];
    
    // Placed
    timestamps.push(orderDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }));
    
    // Processing (approx 2 hours after order)
    const processingDate = new Date(orderDate);
    processingDate.setHours(processingDate.getHours() + 2);
    timestamps.push(processingDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }));
    
    // Shipped (approx 24 hours after order)
    const shippedDate = new Date(orderDate);
    shippedDate.setHours(shippedDate.getHours() + 24);
    timestamps.push(shippedDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }));
    
    // Out for Delivery (approx 48 hours after order)
    const outForDeliveryDate = new Date(orderDate);
    outForDeliveryDate.setHours(outForDeliveryDate.getHours() + 48);
    timestamps.push(outForDeliveryDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }));
    
    // Delivered (approx 72 hours after order)
    const deliveredDate = new Date(orderDate);
    deliveredDate.setHours(deliveredDate.getHours() + 72);
    timestamps.push(deliveredDate.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }));
    
    setStepTimestamps(timestamps);

    // Calculate estimated delivery (3 days from order date)
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    setEstimatedDelivery(deliveryDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }));

  }, [order]);

  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white dark:bg-slate-900 w-full md:w-[500px] md:rounded-3xl rounded-t-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-tracker-title"
          >
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <div>
                <h2 id="order-tracker-title" className="text-xl font-bold text-slate-900 dark:text-white">Track Order</h2>
                <p className="text-sm text-slate-500">Order #{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                aria-label="Close order tracker"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-8 text-center">
                <p className="text-sm text-slate-500 mb-1">Status</p>
                <p className={`text-2xl font-black ${currentStepIndex === -1 ? 'text-red-500' : 'text-primary'}`}>
                  {currentStepIndex === -1 ? 'Cancelled' : currentStepIndex === 4 ? 'Delivered' : `Est. ${estimatedDelivery}`}
                </p>
              </div>

              {currentStepIndex !== -1 && (
                <div className="relative pl-6 space-y-8">
                  {/* Vertical Line */}
                  <div className="absolute left-[35px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800" />
                  
                  {/* Active Line */}
                  <motion.div 
                    className="absolute left-[35px] top-2 w-0.5 bg-primary origin-top"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: currentStepIndex / (TRACKING_STEPS.length - 1) }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
                    style={{ bottom: '8px' }}
                  />

                  {TRACKING_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    
                    return (
                      <div key={step.id} className="relative flex items-center gap-6">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.15 }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${
                            isCompleted 
                              ? 'bg-primary text-slate-900' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                        >
                          <step.icon className="w-5 h-5" aria-hidden="true" />
                        </motion.div>
                        
                        <div className={`flex-1 ${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                          <h4 className={`font-bold ${isCurrent ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                            {step.label}
                          </h4>
                          {isCompleted && (
                            <p className="text-xs text-slate-500 mt-1">
                              {stepTimestamps[index]}
                            </p>
                          )}
                          {isCurrent && index !== 4 && (
                            <p className="text-xs text-slate-500 mt-1">
                              Currently in progress
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Shipping Updates</p>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-3 items-start">
                <Info className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {currentStepIndex === -1
                    ? "This order has been cancelled."
                    : currentStepIndex === 4 
                    ? "Your package was delivered successfully. Enjoy your treats!" 
                    : "We'll send you an email when your package is out for delivery."}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
