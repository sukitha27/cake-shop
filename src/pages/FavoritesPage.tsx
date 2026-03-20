import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

interface FavoritesPageProps {
  favoriteProducts: Product[];
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleFavorite: (product: Product, e: React.MouseEvent) => void;
  onViewDetails: (product: Product) => void;
  favorites: Record<string, boolean>;
  addedItems: Record<string, boolean>;
  formatPrice: (price: number) => string;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({
  favoriteProducts, onAddToCart, onToggleFavorite, onViewDetails, favorites, addedItems, formatPrice
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
      <h3 className="text-3xl font-bold mb-8">My Favorites</h3>
      {favoriteProducts.length === 0 ? (
        <div className="text-center py-20 bg-soft-mint/20 rounded-3xl">
          <Heart className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-xl text-slate-500 font-medium">You haven't saved any favorites yet.</p>
          <button onClick={() => navigate('/products')} className="mt-6 bg-primary text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors">
            Browse Products
          </button>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          {favoriteProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={index} 
              isFavorite={favorites[product.name] || false}
              isAdded={addedItems[product.name] || false}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
              onViewDetails={onViewDetails}
              formatPrice={formatPrice}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default FavoritesPage;
