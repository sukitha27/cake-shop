import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Ban, Check, ShoppingBag } from 'lucide-react';
import { ProductReviews } from './ProductReviews';
import { User } from 'firebase/auth';
import { FALLBACK_IMAGE } from '../App';

interface Product {
  id?: string;
  name: string;
  category: string;
  image: string;
  alt: string;
  price: number;
  stockQuantity: number;
  description?: string;
  ingredients?: string;
  nutrition?: string;
  dietaryTags?: string[];
}

interface ProductDetailsProps {
  product: Product;
  user: User | null;
  onBack: () => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  isAdded: boolean;
}

export function ProductDetails({ product, user, onBack, onAddToCart, isAdded }: ProductDetailsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1440px] mx-auto px-6 lg:px-20 py-12 pt-32"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold mb-8"
        aria-label="Back to Menu"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        Back to Menu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-3xl overflow-hidden bg-secondary shadow-lg aspect-square"
        >
          <img 
            src={product.image} 
            alt={product.alt} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== FALLBACK_IMAGE) {
                target.src = FALLBACK_IMAGE;
              }
            }}
          />
        </motion.div>

        {/* Details Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-soft-mint text-slate-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
              {product.category}
            </span>
            <h1 className="text-4xl lg:text-5xl font-black text-accent dark:text-white tracking-tight mb-6">
              {product.name}
            </h1>
            <div className="flex items-center justify-between mb-6">
              <div className="text-2xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </div>
              {product.stockQuantity > 0 ? (
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                  In Stock ({product.stockQuantity})
                </span>
              ) : (
                <span className="text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full border border-red-100 dark:border-red-800">
                  Out of Stock
                </span>
              )}
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
              {product.description || 'A delicious treat from Magnolia Bakery.'}
            </p>
          </div>

          <div className="space-y-6 mb-10">
            {product.ingredients && (
              <div>
                <h3 className="text-sm font-bold text-accent dark:text-white uppercase tracking-wider mb-2">Ingredients</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {product.ingredients}
                </p>
              </div>
            )}
            
            {product.nutrition && (
              <div>
                <h3 className="text-sm font-bold text-accent dark:text-white uppercase tracking-wider mb-2">Nutritional Info</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {product.nutrition}
                </p>
              </div>
            )}

            {product.dietaryTags && product.dietaryTags.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-accent dark:text-white uppercase tracking-wider mb-2">Dietary Info</h3>
                <div className="flex flex-wrap gap-2">
                  {product.dietaryTags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-accent-maroon/10 text-accent-maroon dark:bg-accent-maroon/20 dark:text-red-300 text-xs font-bold rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={(e) => product.stockQuantity > 0 && onAddToCart(product, e)}
            disabled={product.stockQuantity === 0}
            className={`w-full sm:w-auto px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              product.stockQuantity === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isAdded 
                  ? 'bg-green-500 text-white scale-105' 
                  : 'bg-primary text-accent hover:bg-primary/90 hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            {product.stockQuantity === 0 ? (
              <>
                <Ban className="w-5 h-5" aria-hidden="true" />
                Out of Stock
              </>
            ) : isAdded ? (
              <>
                <Check className="w-5 h-5" aria-hidden="true" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                Add to Cart
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Reviews Section */}
      {product.id && (
        <ProductReviews 
          productId={product.id} 
          productName={product.name}
          user={user}
        />
      )}
    </motion.div>
  );
}
