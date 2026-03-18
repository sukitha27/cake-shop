import React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { FALLBACK_IMAGE } from '../App';

const testimonials = [
  {
    id: 1,
    quote: "You made it so simple. My new site is so much faster and easier to work with than my old site. I just choose the page, make the change.",
    name: "Leslie Alexander",
    avatar: "https://i.pravatar.cc/150?u=leslie",
    rating: 5
  },
  {
    id: 2,
    quote: "Simply the best. Better than all the rest. I'd recommend this product to beginners and advanced users.",
    name: "Jacob Jones",
    avatar: "https://i.pravatar.cc/150?u=jacob",
    rating: 5
  },
  {
    id: 3,
    quote: "I cannot believe that I have got a brand new landing page after getting Omega. It was super easy to edit and publish.",
    name: "Jenny Wilson",
    avatar: "https://i.pravatar.cc/150?u=jenny",
    rating: 5
  }
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 mb-6">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
        />
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-24 bg-white dark:bg-background-dark overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-20 tracking-tight">
          Our happy clients say about us
        </h2>
        
        <div className="relative">
          {/* Rainbow Glow Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[80%] blur-[100px] opacity-20 pointer-events-none z-0">
            <div className="w-full h-full bg-gradient-to-r from-green-400 via-blue-500 via-purple-500 via-red-500 to-yellow-400 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: testimonial.id * 0.1 }}
                className="bg-white dark:bg-slate-900 p-10 rounded-sm shadow-[0_10px_30px_rgba(0,0,0,0.05)] text-left flex flex-col h-full border border-slate-50 dark:border-slate-800"
              >
                <StarRating rating={testimonial.rating} />
                
                <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed mb-10 flex-1">
                  “{testimonial.quote}”
                </p>
                
                <div className="flex items-center gap-4 mt-auto">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== FALLBACK_IMAGE) {
                        target.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
                  <span className="font-bold text-slate-900 dark:text-white text-lg">
                    {testimonial.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="mt-20">
          <a 
            href="#" 
            className="text-slate-900 dark:text-white font-bold border-b-2 border-slate-900 dark:border-white pb-1 hover:opacity-70 transition-opacity"
          >
            Check all 2,157 reviews
          </a>
        </div>
      </div>
    </section>
  );
}
