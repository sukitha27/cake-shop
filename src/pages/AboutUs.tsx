import * as React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Heart, Users, Star, Award } from 'lucide-react';

export const AboutUs = ({ onBack }: { onBack: () => void }) => {
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

        <header className="mb-20 text-center">
          <h1 className="text-6xl lg:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter uppercase font-display">
            Our Story
          </h1>
          <p className="text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-serif italic">
            "Baking memories since 1996, one sprinkle at a time."
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200" 
                alt="Our founder baking" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-primary p-12 rounded-3xl shadow-xl hidden md:block">
              <p className="text-4xl font-black text-slate-900">25+</p>
              <p className="text-sm font-bold uppercase tracking-widest">Years of Sweetness</p>
            </div>
          </motion.div>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white">A Legacy of Love</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Magnolia Bakers opened its first location in a quiet corner of the city in 1996. What started as a small neighborhood bakery quickly became a destination for those seeking the comforting taste of home-style baking.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Today, we continue that tradition by using only the finest ingredients—real butter, fresh eggs, and pure vanilla—to create treats that are as beautiful as they are delicious. Every cupcake is hand-frosted with our signature swirl, a mark of quality and care that has defined us for over two decades.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="flex flex-col gap-2">
                <Heart className="w-8 h-8 text-primary" />
                <h4 className="font-bold">Hand-Crafted</h4>
                <p className="text-sm text-slate-500">Every treat is made with love and attention to detail.</p>
              </div>
              <div className="flex flex-col gap-2">
                <Users className="w-8 h-8 text-primary" />
                <h4 className="font-bold">Community</h4>
                <p className="text-sm text-slate-500">We're proud to be a part of your celebrations.</p>
              </div>
            </div>
          </div>
        </div>

        <section className="bg-soft-mint dark:bg-slate-800 rounded-[3rem] p-12 lg:p-24 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-12 uppercase tracking-tighter">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-sm">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Quality First</h3>
              <p className="text-slate-600 dark:text-slate-400">We never compromise on the quality of our ingredients or our craft.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-sm">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Tradition</h3>
              <p className="text-slate-600 dark:text-slate-400">Honoring the time-tested recipes that our customers have loved for years.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-sm">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Joy</h3>
              <p className="text-slate-600 dark:text-slate-400">Our mission is to bring a little bit of sweetness and joy to every day.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
