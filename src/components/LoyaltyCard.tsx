import React from 'react';
import { motion } from 'motion/react';
import { Award, Star, TrendingUp, Gift, ChevronRight } from 'lucide-react';

interface LoyaltyCardProps {
  points: number;
}

export function LoyaltyCard({ points }: LoyaltyCardProps) {
  const getTier = (pts: number) => {
    if (pts >= 1000) return { name: 'Gold', color: 'text-yellow-500', bg: 'bg-yellow-500/10', next: null, icon: Award };
    if (pts >= 500) return { name: 'Silver', color: 'text-slate-400', bg: 'bg-slate-400/10', next: 1000, icon: Star };
    return { name: 'Bronze', color: 'text-amber-700', bg: 'bg-amber-700/10', next: 500, icon: TrendingUp };
  };

  const tier = getTier(points);
  const progress = tier.next ? (points / tier.next) * 100 : 100;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Loyalty Points</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{points}</span>
            <span className="text-sm font-bold text-slate-400">pts</span>
          </div>
        </div>
        <div className={`${tier.bg} ${tier.color} p-4 rounded-2xl flex flex-col items-center gap-1`}>
          <tier.icon size={24} />
          <span className="text-[10px] font-black uppercase tracking-tighter">{tier.name}</span>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-slate-400">Progress to {tier.next ? getTier(tier.next).name : 'Max Tier'}</span>
          <span className="text-slate-900 dark:text-white">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-primary"
          />
        </div>
        {tier.next && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Earn {tier.next - points} more points to reach {getTier(tier.next).name} status!
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
          <div className="flex items-center gap-3">
            <Gift size={18} className="text-primary" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Redeem</span>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
        <button className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
          <div className="flex items-center gap-3">
            <Star size={18} className="text-primary" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Perks</span>
          </div>
          <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
