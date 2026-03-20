import React from 'react';
import { motion } from 'motion/react';
import { SearchX } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { FilterBar } from '../components/FilterBar';
import { Product } from '../types';

interface ProductsPageProps {
  products: Product[];
  filteredProducts: Product[];
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedDietaryTags: string[];
  setSelectedDietaryTags: (tags: string[]) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  formatPrice: (price: number) => string;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleFavorite: (product: Product, e: React.MouseEvent) => void;
  onViewDetails: (product: Product) => void;
  favorites: Record<string, boolean>;
  addedItems: Record<string, boolean>;
}

const ProductsPage: React.FC<ProductsPageProps> = ({
  products, filteredProducts, isLoading, searchQuery, setSearchQuery,
  priceRange, setPriceRange, selectedDietaryTags, setSelectedDietaryTags,
  categories, selectedCategory, setSelectedCategory, formatPrice,
  onAddToCart, onToggleFavorite, onViewDetails, favorites, addedItems
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="py-16 pt-32 px-6 lg:px-20 max-w-[1440px] mx-auto min-h-screen"
    >
      <div className="mb-12">
        <h2 className="text-4xl font-black mb-4 uppercase tracking-tight">Our Full Menu</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">Explore our wide range of handcrafted treats, from our world-famous banana pudding to our classic cupcakes and seasonal specialties.</p>
      </div>

      <FilterBar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        selectedDietaryTags={selectedDietaryTags}
        setSelectedDietaryTags={setSelectedDietaryTags}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        formatPrice={formatPrice}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
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
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
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
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <SearchX className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No treats found</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters or search terms</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setPriceRange([0, 100]);
                  setSelectedDietaryTags([]);
                  setSelectedCategory('All');
                }}
                className="px-6 py-2 bg-primary text-slate-900 font-bold rounded-full hover:bg-primary/90 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProductsPage;
