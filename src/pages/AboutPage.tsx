import React from 'react';
import { motion } from 'motion/react';

const AboutPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="py-16 pt-32 px-6 lg:px-20 max-w-[1440px] mx-auto min-h-screen"
    >
      <div className="max-w-4xl mx-auto text-center mb-24">
        <span className="text-primary font-bold tracking-widest uppercase mb-4 block">Our Story</span>
        <h2 className="text-5xl lg:text-7xl font-display text-slate-900 dark:text-white mb-8">Baking Spirits Bright Since 1996</h2>
        <p className="text-slate-600 dark:text-slate-300 text-xl leading-relaxed mb-8">
          Magnolia Bakers opened its first location on a quiet street corner in the heart of New York City's West Village in 1996. From its beginnings as a small neighborhood bakery, Magnolia Bakers has become one of the most beloved bakeries in the world.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
        <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000" 
            alt="Bakery Interior" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-8">
          <h3 className="text-4xl font-display">Handcrafted with Love</h3>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            Today, we continue to bake our signature desserts from scratch in small batches throughout the day. Whether it's our world-famous banana pudding, our classic cupcakes, or our seasonal specialties, every treat is made with love and the finest ingredients.
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            Our bakers are dedicated to the craft of traditional American baking. We believe that the best treats are made with real butter, fresh eggs, and a whole lot of passion.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div>
              <h4 className="text-4xl font-bold text-primary mb-2">30+</h4>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Years of Baking</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold text-primary mb-2">50+</h4>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Global Locations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-soft-mint/20 dark:bg-slate-800 rounded-[3rem] p-12 lg:p-20 text-center">
        <h3 className="text-4xl font-display mb-8">Our Mission</h3>
        <p className="max-w-3xl mx-auto text-slate-600 dark:text-slate-300 text-xl leading-relaxed italic font-serif">
          "To bring a little extra sweetness to the world, one treat at a time. We believe that every celebration, big or small, deserves a handcrafted dessert made with the finest ingredients and a touch of magic."
        </p>
      </div>
    </motion.div>
  );
};

export default AboutPage;
