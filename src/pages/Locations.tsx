import * as React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Phone, Mail, Clock } from 'lucide-react';

interface Location {
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  image: string;
}

const LOCATIONS: Location[] = [
  {
    name: 'Main Street Bakery',
    address: '123 Main Street, Colombo 01, Sri Lanka',
    phone: '+94 11 234 5678',
    email: 'mainstreet@magnoliabakers.com',
    hours: 'Mon-Sun: 7:00 AM - 9:00 PM',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Galle Face Branch',
    address: '45 Galle Road, Colombo 03, Sri Lanka',
    phone: '+94 11 234 5679',
    email: 'galleface@magnoliabakers.com',
    hours: 'Mon-Sun: 8:00 AM - 10:00 PM',
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec41b5ec?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Kandy Express',
    address: '78 Dalada Veediya, Kandy, Sri Lanka',
    phone: '+94 81 234 5678',
    email: 'kandy@magnoliabakers.com',
    hours: 'Mon-Sun: 7:30 AM - 8:30 PM',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
  }
];

export const Locations = ({ onBack }: { onBack: () => void }) => {
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

        <header className="mb-16">
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase font-display">
            Our Locations
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Visit us at any of our cozy locations across the island. Each bakery offers our full range of signature treats and a warm, welcoming atmosphere.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {LOCATIONS.map((loc, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-soft-mint dark:border-slate-700 group hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img 
                  src={loc.image} 
                  alt={loc.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{loc.name}</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm leading-relaxed">{loc.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">{loc.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                    <Mail className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">{loc.email}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600 dark:text-slate-400">
                    <Clock className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm">{loc.hours}</span>
                  </div>
                </div>
                <button className="mt-8 w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors uppercase tracking-widest text-xs">
                  Get Directions
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
