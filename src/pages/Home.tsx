import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, SearchX, ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { FilterBar } from '../components/FilterBar';
import { Product } from '../types';

interface HomeProps {
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

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800';

const treats = [
  { title: 'Birthday Treats', description: 'Make their day extra sweet with our signature cakes and cupcakes.', image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=800', alt: 'Birthday Cake' },
  { title: 'Wedding Cakes', description: 'Beautifully crafted cakes for your most special day.', image: 'https://images.unsplash.com/photo-1535254973040-607b474cb843?auto=format&fit=crop&q=80&w=800', alt: 'Wedding Cake' },
  { title: 'Corporate Gifts', description: 'Impress clients and colleagues with delicious Magnolia Bakers treats.', image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=800', alt: 'Gift Box' },
  { title: 'Nationwide Shipping', description: 'Send a taste of NYC to loved ones across the country.', image: 'https://images.unsplash.com/photo-1549128247-37e905ebdb3f?auto=format&fit=crop&q=80&w=800', alt: 'Shipping Box' },
];

const Home: React.FC<HomeProps> = ({
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
    >
      <section className="relative h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1920')" }}>
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="relative h-full max-w-[1440px] mx-auto flex flex-col justify-center items-start px-6 lg:px-20 text-white">
          <h2 className="text-5xl lg:text-7xl font-black mb-6 leading-tight drop-shadow-lg">Cupcake Decorating <br /> Workshops</h2>
          <p className="text-lg lg:text-xl mb-8 max-w-xl font-medium drop-shadow-md">Join us for a hands-on experience in the art of cupcake decorating. Learn the signature swirl!</p>
          <div className="flex gap-4">
            <button className="bg-primary hover:bg-primary/90 text-slate-900 font-bold px-8 py-4 rounded-xl text-lg transition-transform active:scale-95">GET TICKETS</button>
          </div>
          <div className="absolute bottom-10 right-20 flex gap-4">
            <button className="bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-sm" aria-label="Previous slide"><ChevronLeft className="w-6 h-6" aria-hidden="true" /></button>
            <button className="bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-sm" aria-label="Next slide"><ChevronRight className="w-6 h-6" aria-hidden="true" /></button>
          </div>
        </div>
      </section>

      <section id="products" className="py-16 px-6 lg:px-20 max-w-[1440px] mx-auto">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-3xl font-bold">Our Products</h3>
          <button onClick={() => window.scrollTo({ top: document.getElementById('products')?.offsetTop || 0, behavior: 'smooth' })} className="text-primary font-bold border-b-2 border-primary pb-1">VIEW MORE</button>
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
      </section>

      <section className="py-16 bg-soft-mint/30 dark:bg-background-dark/50">
        <div className="px-6 lg:px-20 max-w-[1440px] mx-auto">
          <div className="flex justify-between items-end mb-10">
            <h3 className="text-3xl font-bold">Treats for any Occasion</h3>
            <button className="text-primary font-bold border-b-2 border-primary pb-1">VIEW MORE</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {treats.map((treat, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 rounded-xl bg-primary/10 flex items-center justify-center mb-6 overflow-hidden">
                  <img 
                    className="w-full h-full object-cover" 
                    alt={treat.alt} 
                    src={treat.image} 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== FALLBACK_IMAGE) {
                        target.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
                </div>
                <h4 className="text-xl font-bold mb-2">{treat.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{treat.description}</p>
                <button className="text-primary font-bold flex items-center gap-2">Shop Now <ArrowRight className="w-4 h-4" aria-hidden="true" /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="order" className="py-24 px-6 lg:px-20 max-w-[1440px] mx-auto text-center">
        <h2 className="text-5xl lg:text-7xl font-display text-slate-900 dark:text-white mb-6">Delivery and Pick Up Options</h2>
        <p className="max-w-3xl mx-auto text-slate-600 dark:text-slate-300 text-lg mb-6 leading-relaxed">
          We make it easy for you to get Magnolia Bakers' best, wherever you are. Order now for nationwide shipping, place an order to pickup at your local shop, or get in touch with our team to arrange custom catering for your next event.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-soft-mint/20 dark:bg-slate-800 p-8 rounded-3xl border border-soft-mint dark:border-slate-700">
            <h4 className="text-2xl font-bold mb-4">Nationwide Shipping</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Get our famous banana pudding and more delivered to your door anywhere in the US.</p>
            <button className="bg-primary text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">ORDER NOW</button>
          </div>
          <div className="bg-soft-mint/20 dark:bg-slate-800 p-8 rounded-3xl border border-soft-mint dark:border-slate-700">
            <h4 className="text-2xl font-bold mb-4">Local Pickup</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Order ahead and skip the line at your favorite Magnolia Bakers location.</p>
            <button className="bg-primary text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">FIND A SHOP</button>
          </div>
          <div className="bg-soft-mint/20 dark:bg-slate-800 p-8 rounded-3xl border border-soft-mint dark:border-slate-700">
            <h4 className="text-2xl font-bold mb-4">Local Delivery</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Order through our delivery partners for fresh treats delivered in under an hour.</p>
            <button className="bg-primary text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">ORDER DELIVERY</button>
          </div>
        </div>
      </section>

      <section id="locations" className="py-24 bg-slate-900 text-white">
        <div className="px-6 lg:px-20 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-display mb-8">Visit Our Shops</h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">From our original shop on Bleecker Street to our locations around the world, we can't wait to welcome you.</p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold">01</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">New York City</h4>
                    <p className="text-slate-400">The original home of our world-famous banana pudding.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold">02</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Chicago</h4>
                    <p className="text-slate-400">Find us in the heart of the Loop for your daily treat.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold">03</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Los Angeles</h4>
                    <p className="text-slate-400">Sweet treats and sunshine at our West Coast locations.</p>
                  </div>
                </div>
              </div>
              <button className="mt-12 border-2 border-primary text-primary font-bold px-8 py-4 rounded-xl hover:bg-primary hover:text-slate-900 transition-all">VIEW ALL LOCATIONS</button>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1000" 
                alt="Bakery Interior" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 px-6 lg:px-20 max-w-[1440px] mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-primary font-bold tracking-widest uppercase mb-4 block">Our Story</span>
          <h2 className="text-5xl font-display mb-8">Baking Spirits Bright Since 1996</h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-8">
            Magnolia Bakers opened its first location on a quiet street corner in the heart of New York City's West Village in 1996. From its beginnings as a small neighborhood bakery, Magnolia Bakers has become one of the most beloved bakeries in the world.
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            Today, we continue to bake our signature desserts from scratch in small batches throughout the day. Whether it's our world-famous banana pudding, our classic cupcakes, or our seasonal specialties, every treat is made with love and the finest ingredients.
          </p>
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
