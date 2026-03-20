import * as React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Filter, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../App';
import { FilterBar } from '../components/FilterBar';

interface ProductsPageProps {
  products: Product[];
  onBack: () => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onToggleFavorite: (product: Product, e: React.MouseEvent) => void;
  favorites: Record<string, boolean>;
  formatPrice: (price: number) => string;
  addedItems: Record<string, boolean>;
  onViewProduct: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Products = ({ 
  products, 
  onBack, 
  onAddToCart, 
  onToggleFavorite, 
  favorites, 
  formatPrice,
  addedItems,
  onViewProduct,
  searchQuery,
  setSearchQuery
}: ProductsPageProps) => {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 100]);
  const [selectedDietaryTags, setSelectedDietaryTags] = React.useState<string[]>([]);

  const categories = ['All', 'Cupcakes', 'Brownies & Bars', 'Cakes', 'Sampler Packs', 'Banana Pudding'];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesDietary = selectedDietaryTags.length === 0 || 
                          selectedDietaryTags.every(tag => product.dietaryTags?.includes(tag));
    
    return matchesCategory && matchesSearch && matchesPrice && matchesDietary;
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pt-32 pb-20 px-6 lg:px-20">
      <div className="max-w-[1440px] mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-sm">Back to Home</span>
        </button>

        <header className="mb-12">
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase font-display">
            Our Menu
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Explore our full selection of hand-crafted treats, from our world-famous banana pudding to our signature cupcakes.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-32 space-y-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search treats..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-soft-mint dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
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
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-32 bg-soft-mint/10 rounded-[3rem] border-2 border-dashed border-soft-mint/30">
                <p className="text-2xl font-bold text-slate-400 mb-4">No treats found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                    setPriceRange([0, 100]);
                    setSelectedDietaryTags([]);
                  }}
                  className="text-primary font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product, index) => (
                  <motion.div 
                    key={product.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index % 6) * 0.05 }}
                    className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-soft-mint dark:border-slate-700 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => onViewProduct(product)}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img 
                        src={product.image} 
                        alt={product.alt} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <button 
                        onClick={(e) => onToggleFavorite(product, e)}
                        className="absolute top-4 right-4 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:scale-110 transition-transform z-10"
                      >
                        <Heart className={`w-5 h-5 ${favorites[product.name] ? 'text-red-500 fill-current' : 'text-slate-400'}`} />
                      </button>
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{product.name}</h3>
                        <p className="font-bold text-primary">{formatPrice(product.price)}</p>
                      </div>
                      <p className="text-sm text-slate-500 mb-6 line-clamp-2">{product.description}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product, e);
                        }}
                        className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                          addedItems[product.name] 
                            ? 'bg-green-500 text-white' 
                            : 'bg-primary text-slate-900 hover:bg-primary/90'
                        }`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {addedItems[product.name] ? 'Added to Cart!' : 'Add to Cart'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
