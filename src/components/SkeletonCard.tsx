import React from 'react';

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col items-center">
    <div className="aspect-square w-full rounded-xl bg-slate-200 dark:bg-slate-800 mb-4"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-3"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto"></div>
  </div>
);

export default SkeletonCard;
