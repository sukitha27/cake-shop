import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { X, Download, Printer, ShoppingBag, CheckCircle2, Calendar, Mail, Hash, MapPin, Phone, Globe, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: any;
  customerEmail: string;
  userId: string;
  paymentMethod?: string;
  shippingInfo?: ShippingInfo;
}

interface InvoiceProps {
  order: Order;
  onClose: () => void;
  formatPrice: (price: number) => string;
}

export function Invoice({ order, onClose, formatPrice }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    if (date.toDate) return date.toDate().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 5.99;
  const tax = subtotal * 0.08;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || isGenerating) return;

    try {
      setIsGenerating(true);
      
      // Target the printable element
      const element = invoiceRef.current;
      
      // Create a canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff', // Force white background for PDF
        onclone: (clonedDoc) => {
          // Ensure the cloned element is visible and in light mode
          const clonedElement = clonedDoc.getElementById('invoice-printable');
          if (clonedElement) {
            clonedElement.style.padding = '40px';
            clonedElement.classList.remove('dark');
            
            // Inject a style block to override oklch colors with hex values
            // html2canvas has trouble parsing oklch colors from Tailwind v4
            const style = clonedDoc.createElement('style');
            style.innerHTML = `
              #invoice-printable, #invoice-printable * {
                color: #4A2B1A !important; /* slate-900 / accent */
                border-color: #EED4C5 !important; /* slate-200 */
                background-color: transparent !important;
                box-shadow: none !important;
                text-shadow: none !important;
              }
              #invoice-printable {
                background-color: #ffffff !important;
              }
              .bg-primary {
                background-color: #F7C6C7 !important; /* Pastel pink */
              }
              .text-primary {
                color: #F7C6C7 !important;
              }
              .bg-slate-50 {
                background-color: #ffffff !important;
              }
              .text-slate-400 {
                color: #C0957D !important;
              }
              .text-slate-500 {
                color: #A4755D !important;
              }
              .text-slate-200 {
                color: #EED4C5 !important;
              }
              .border-slate-100 {
                border-color: #F9EBE2 !important;
              }
              .border-slate-800 {
                border-color: #5C3621 !important;
              }
              .divide-slate-100 > * + * {
                border-color: #F9EBE2 !important;
              }
              .divide-slate-800 > * + * {
                border-color: #5C3621 !important;
              }
              /* Force visibility for all text */
              p, h1, h2, h3, h4, h5, h6, span, td, th {
                visibility: visible !important;
              }
            `;
            clonedDoc.head.appendChild(style);
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`invoice-${order.id?.slice(-8).toUpperCase() || 'order'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to print if PDF generation fails
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white print:static print:inset-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none print:w-full"
      >
        {/* Header - Hidden in Print */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <ShoppingBag className="text-slate-900" size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Invoice Preview</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-all font-bold text-sm"
            >
              <Printer size={16} />
              Print
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 print:p-0 print:overflow-visible bg-white dark:bg-slate-900 print:bg-white">
          <div id="invoice-printable" ref={invoiceRef} className="space-y-10 print:space-y-8 bg-white dark:bg-slate-900 p-4 rounded-xl">
            
            {/* Real World Invoice Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center print:bg-primary print:[-webkit-print-color-adjust:exact]">
                    <ShoppingBag className="text-slate-900" size={24} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Magnolia Bakery</h1>
                    <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Premium Confections</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                  <p className="flex items-center gap-2"><MapPin size={14} /> 401 Bleecker St, New York, NY 10014</p>
                  <p className="flex items-center gap-2"><Phone size={14} /> (212) 462-2572</p>
                  <p className="flex items-center gap-2"><Globe size={14} /> www.magnoliabakery.com</p>
                </div>
              </div>

              <div className="text-right space-y-2">
                <h2 className="text-5xl font-black text-slate-200 dark:text-slate-800 uppercase tracking-tighter print:text-slate-200">INVOICE</h2>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Invoice No: <span className="font-mono">#{order.id?.slice(-8).toUpperCase() || 'N/A'}</span></p>
                  <p className="text-sm text-slate-500">Date: {formatDate(order.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Bill To</h3>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white text-lg">
                    {order.shippingInfo ? `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}` : (order.customerEmail?.split('@')[0] || 'Customer')}
                  </p>
                  <p className="text-sm text-slate-500">{order.customerEmail || 'N/A'}</p>
                  {order.shippingInfo && (
                    <div className="text-sm text-slate-500 mt-2">
                      <p>{order.shippingInfo.address}</p>
                      <p>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 italic mt-2 uppercase tracking-widest">Customer ID: {order.userId?.slice(-6).toUpperCase() || 'N/A'}</p>
                </div>
              </div>
              <div className="space-y-4 text-right">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment Info</h3>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Method: {order.paymentMethod || 'Credit Card'}</p>
                  <p className="text-sm text-slate-500">Status: <span className="text-green-600 font-bold uppercase tracking-wider text-xs">Paid</span></p>
                </div>
              </div>
            </div>

            {/* Professional Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 print:bg-slate-50 print:[-webkit-print-color-adjust:exact]">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="group">
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-slate-400">Premium Bakery Item</p>
                      </td>
                      <td className="px-6 py-5 text-center text-slate-600 dark:text-slate-400 font-medium">{item.quantity}</td>
                      <td className="px-6 py-5 text-right text-slate-600 dark:text-slate-400 font-medium">{formatPrice(item.price)}</td>
                      <td className="px-6 py-5 text-right font-bold text-slate-900 dark:text-white">{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-full md:w-72 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping & Handling</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sales Tax (8%)</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatPrice(tax)}</span>
                </div>
                <div className="pt-4 border-t-2 border-slate-900 dark:border-white flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Total Due</span>
                  <span className="text-3xl font-black text-primary print:text-slate-900">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Real World Footer */}
            <div className="pt-16 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terms & Conditions</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    All sales are final. Please inspect your order upon delivery. 
                    Magnolia Bakery is not responsible for damage after delivery. 
                    For wholesale inquiries, contact wholesale@magnoliabakery.com.
                  </p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <p className="text-sm font-serif italic text-slate-500">Thank you for your business!</p>
                </div>
              </div>
              
              <div className="h-1 bg-primary w-full rounded-full print:bg-primary print:[-webkit-print-color-adjust:exact]" />
            </div>
          </div>
        </div>

        {/* Actions Footer - Hidden in Print */}
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row gap-4 print:hidden">
          <button 
            onClick={onClose}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Back to Orders
          </button>
          <div className="flex-[2] flex gap-4">
            <button 
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
            >
              <Printer size={20} />
              Print
            </button>
            <button 
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex-[2] flex items-center justify-center gap-3 bg-primary text-slate-900 font-black py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-printable, #invoice-printable * {
            visibility: visible;
          }
          #invoice-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
          }
          .dark {
            color-scheme: light;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}} />
    </motion.div>
  );
}
