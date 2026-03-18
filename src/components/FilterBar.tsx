import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  selectedDietaryTags: string[];
  setSelectedDietaryTags: (tags: string[]) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  priceRange,
  setPriceRange,
  selectedDietaryTags,
  setSelectedDietaryTags,
  categories,
  selectedCategory,
  setSelectedCategory
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const dietaryTags = ['Gluten-Free', 'Nut-Free', 'Vegan', 'Dairy-Free'];

  const toggleTag = (tag: string) => {
    if (selectedDietaryTags.includes(tag)) {
      setSelectedDietaryTags(selectedDietaryTags.filter(t => t !== tag));
    } else {
      setSelectedDietaryTags([...selectedDietaryTags, tag]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange([0, 100]);
    setSelectedDietaryTags([]);
    setSelectedCategory('All');
  };

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) + 
    (priceRange[0] > 0 || priceRange[1] < 100 ? 1 : 0) + 
    selectedDietaryTags.length + 
    (selectedCategory !== 'All' ? 1 : 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-soft-mint dark:border-slate-700 p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search our treats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-soft-mint/30 dark:bg-slate-900/50 rounded-2xl border-none focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white"
          />
        </div>

        {/* Toggle Filters Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            isExpanded || activeFiltersCount > 0
              ? 'bg-primary text-slate-900'
              : 'bg-soft-mint dark:bg-slate-900/50 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm font-bold text-slate-500 hover:text-red-500 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-soft-mint dark:border-slate-700 mt-4">
              {/* Categories */}
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary text-slate-900'
                          : 'bg-soft-mint/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-primary/30'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Tags */}
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Dietary</h4>
                <div className="flex flex-wrap gap-2">
                  {dietaryTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        selectedDietaryTags.includes(tag)
                          ? 'bg-accent-maroon text-white'
                          : 'bg-soft-mint/50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-accent-maroon/30'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </h4>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full accent-primary h-2 bg-soft-mint dark:bg-slate-900 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                    <span>$0</span>
                    <span>$100+</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
