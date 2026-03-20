import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  index: number;
  isFavorite: boolean;
  isAdded: boolean;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleFavorite: (product: Product, e: React.MouseEvent) => void;
  onViewDetails: (product: Product) => void;
  formatPrice: (price: number) => string;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800';

const ProductCard: React.FC<ProductCardProps> = React.memo(({ 
  product, index, isFavorite, isAdded, onAddToCart, onToggleFavorite, onViewDetails, formatPrice 
}) => (
  <motion.div 
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
    className="group cursor-pointer transition-all duration-300 hover:-translate-y-2 flex flex-col relative"
    onClick={() => onViewDetails(product)}
  >
    <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-slate-100 shadow-sm group-hover:shadow-xl transition-all duration-300 relative">
      <img 
        className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${product.stockQuantity <= 0 ? 'grayscale opacity-70' : ''}`} 
        alt={product.alt} 
        src={product.image} 
        referrerPolicy="no-referrer"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== FALLBACK_IMAGE) {
            target.src = FALLBACK_IMAGE;
          }
        }}
      />
      {product.stockQuantity <= 0 && (
        <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
          Out of Stock
        </div>
      )}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex items-center justify-center">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (product.stockQuantity > 0) onAddToCart(product, e);
          }}
          disabled={product.stockQuantity <= 0}
          className={`px-6 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ${
            product.stockQuantity <= 0
              ? 'bg-red-500 text-white cursor-not-allowed'
              : isAdded 
                ? 'bg-green-500 text-white scale-105' 
                : 'bg-primary text-slate-900 hover:bg-white hover:text-primary'
          }`}
          aria-label={product.stockQuantity <= 0 ? `Out of stock` : `Add ${product.name} to cart`}
        >
          {product.stockQuantity <= 0 ? 'Out of Stock' : isAdded ? 'Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
    <button 
      onClick={(e) => onToggleFavorite(product, e)}
      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:scale-110 transition-transform z-10"
      aria-label={`${isFavorite ? 'Remove' : 'Add'} ${product.name} ${isFavorite ? 'from' : 'to'} favorites`}
    >
      <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-slate-400'}`} aria-hidden="true" />
    </button>
    <p className="font-bold text-lg text-center transition-colors group-hover:text-primary">{product.name}</p>
    <p className="text-sm text-slate-500 text-center mb-1">{product.category}</p>
    <div className="flex justify-center gap-1 mb-2">
      {product.dietaryTags?.map(tag => (
        <span key={tag} className="text-[8px] font-bold px-1.5 py-0.5 bg-accent-maroon/10 text-accent-maroon rounded-full uppercase tracking-tighter">
          {tag.split('-')[0]}
        </span>
      ))}
    </div>
    <p className="font-bold text-primary text-center">{formatPrice(product.price)}</p>
    
    {/* Mobile Add to Cart Button */}
    <button 
      onClick={(e) => {
        e.stopPropagation();
        if (product.stockQuantity > 0) onAddToCart(product, e);
      }}
      disabled={product.stockQuantity <= 0}
      className={`mt-3 w-full py-2 rounded-full font-bold text-sm transition-all duration-300 lg:hidden ${
        product.stockQuantity <= 0
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
          : isAdded 
            ? 'bg-green-500 text-white' 
            : 'bg-primary text-slate-900 hover:bg-primary/90'
      }`}
      aria-label={product.stockQuantity <= 0 ? `Out of stock` : `Add ${product.name} to cart`}
    >
      {product.stockQuantity <= 0 ? 'Out of Stock' : isAdded ? 'Added!' : 'Add to Cart'}
    </button>
  </motion.div>
));

export default ProductCard;
