import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Clock } from 'lucide-react';

const locations = [
  {
    name: "Bleecker Street (Original)",
    address: "401 Bleecker Street, New York, NY 10014",
    phone: "(212) 462-2572",
    hours: "Mon-Sun: 9am - 11pm",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Rockefeller Center",
    address: "1240 Avenue of the Americas, New York, NY 10020",
    phone: "(212) 767-1160",
    hours: "Mon-Sun: 8am - 9pm",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec41b50b?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Grand Central Terminal",
    address: "89 East 42nd Street, New York, NY 10017",
    phone: "(212) 682-3588",
    hours: "Mon-Fri: 7am - 9pm, Sat-Sun: 8am - 8pm",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "Columbus Circle",
    address: "10 Columbus Circle, New York, NY 10019",
    phone: "(212) 974-2033",
    hours: "Mon-Sat: 10am - 8pm, Sun: 11am - 7pm",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"
  }
];

const LocationsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="py-16 pt-32 px-6 lg:px-20 max-w-[1440px] mx-auto min-h-screen"
    >
      <div className="text-center mb-16">
        <h2 className="text-5xl lg:text-7xl font-display text-slate-900 dark:text-white mb-6">Our Locations</h2>
        <p className="max-w-3xl mx-auto text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
          From our original shop on Bleecker Street to our locations around the world, we can't wait to welcome you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {locations.map((loc, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-soft-mint dark:border-slate-700 group">
            <div className="aspect-video overflow-hidden">
              <img 
                src={loc.image} 
                alt={loc.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-6">{loc.name}</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <p className="text-slate-600 dark:text-slate-400">{loc.address}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-slate-600 dark:text-slate-400">{loc.phone}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-slate-600 dark:text-slate-400">{loc.hours}</p>
                </div>
              </div>
              <button className="mt-8 w-full border-2 border-primary text-primary font-bold px-6 py-3 rounded-xl hover:bg-primary hover:text-slate-900 transition-all uppercase tracking-widest text-sm">GET DIRECTIONS</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 text-center">
        <h3 className="text-3xl font-display mb-8">International Locations</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">Magnolia Bakers is proud to have locations in the Middle East, India, and beyond. Find our international partners below.</p>
        <div className="flex flex-wrap justify-center gap-4">
          {['Abu Dhabi', 'Dubai', 'Doha', 'Amman', 'Riyadh', 'Bangalore', 'Hyderabad', 'Mumbai'].map(city => (
            <span key={city} className="px-6 py-3 bg-soft-mint/20 dark:bg-slate-800 rounded-full font-bold text-slate-700 dark:text-slate-300 border border-soft-mint dark:border-slate-700">{city}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default LocationsPage;
