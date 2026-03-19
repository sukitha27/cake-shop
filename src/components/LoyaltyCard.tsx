import React from 'react';
import { motion } from 'motion/react';
import { Star, Award, Crown, Gift, ShoppingBag, Zap } from 'lucide-react';

interface LoyaltyCardProps {
  totalSpent: number;
  orderCount: number;
}

const TIERS = [
  {
    name: 'Bronze',
    min: 0,
    max: 499,
    Icon: Star,
    gradient: 'from-amber-600 to-amber-400',
    glow: 'shadow-amber-200 dark:shadow-amber-900',
    label: 'text-amber-700 dark:text-amber-400',
    soft: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-800',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400',
    perk: 'Early access to new flavours',
    emoji: '🍪',
  },
  {
    name: 'Silver',
    min: 500,
    max: 999,
    Icon: Award,
    gradient: 'from-slate-500 to-slate-300',
    glow: 'shadow-slate-200 dark:shadow-slate-700',
    label: 'text-slate-600 dark:text-slate-300',
    soft: 'bg-slate-50 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    perk: '5% off every order',
    emoji: '🎂',
  },
  {
    name: 'Gold',
    min: 1000,
    max: Infinity,
    Icon: Crown,
    gradient: 'from-yellow-500 to-yellow-300',
    glow: 'shadow-yellow-200 dark:shadow-yellow-900',
    label: 'text-yellow-700 dark:text-yellow-400',
    soft: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-200 dark:border-yellow-800',
    badge: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400',
    perk: '10% off + free shipping forever',
    emoji: '👑',
  },
];

export function LoyaltyCard({ totalSpent, orderCount }: LoyaltyCardProps) {
  const points = Math.floor(totalSpent); // 1 pt per $1
  const tierIdx = TIERS.findIndex(t => points >= t.min && points <= t.max);
  const tier = TIERS[tierIdx] ?? TIERS[0];
  const nextTier = TIERS[tierIdx + 1];
  const progress = nextTier
    ? Math.min(((points - tier.min) / (nextTier.min - tier.min)) * 100, 100)
    : 100;

  const { Icon } = tier;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-3xl border-2 ${tier.border} ${tier.soft} p-7 overflow-hidden mb-6`}
    >
      {/* Decorative background icon */}
      <div className="absolute -top-4 -right-4 w-36 h-36 opacity-[0.06] pointer-events-none">
        <Icon className="w-full h-full" />
      </div>

      {/* Top row */}
      <div className="flex items-start justify-between mb-5 relative">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Loyalty Tier</p>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center shadow-lg ${tier.glow}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-2xl font-black leading-none ${tier.label}`}>{tier.name}</h3>
              <span className="text-[10px] font-bold text-slate-400">Member</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Points</p>
          <p className={`text-3xl font-black tabular-nums leading-none ${tier.label}`}>
            {points.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">1 pt per $1 spent</p>
        </div>
      </div>

      {/* Perk banner */}
      <div className={`flex items-center gap-2.5 mb-5 px-4 py-2.5 rounded-2xl ${tier.badge}`}>
        <Gift className="w-4 h-4 flex-shrink-0" />
        <p className="text-sm font-bold">{tier.emoji} {tier.perk}</p>
      </div>

      {/* Progress bar */}
      {nextTier ? (
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Progress to {nextTier.name}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {(nextTier.min - points).toLocaleString()} pts away
            </span>
          </div>
          <div className="w-full h-3 bg-white/70 dark:bg-slate-900/50 rounded-full overflow-hidden border border-white dark:border-slate-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className={`h-full rounded-full bg-gradient-to-r ${tier.gradient}`}
            />
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-1.5 font-medium">
            Reach {nextTier.name} to unlock: {nextTier.perk}
          </p>
        </div>
      ) : (
        <div className={`flex items-center gap-2 mb-5 px-4 py-2 rounded-xl ${tier.badge} text-sm font-bold`}>
          <Zap className="w-4 h-4 flex-shrink-0" />
          You've reached our highest tier — thank you! 🎉
        </div>
      )}

      {/* Stats row */}
      <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-5 grid grid-cols-3 gap-2">
        {[
          { value: orderCount, label: 'Orders', Icon: ShoppingBag },
          { value: `$${totalSpent.toFixed(0)}`, label: 'Spent', Icon: Star },
          { value: `${tierIdx + 1}/3`, label: 'Tier', Icon: Crown },
        ].map(({ value, label, Icon: I }) => (
          <div key={label} className="text-center">
            <I className="w-4 h-4 mx-auto text-slate-300 dark:text-slate-600 mb-1" />
            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{value}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
