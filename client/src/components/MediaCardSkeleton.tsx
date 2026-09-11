import React from 'react';

export const MediaCardSkeleton: React.FC = () => {
  return (
    <div className="double-bezel animate-pulse">
      <div className="double-bezel-inner bg-dramify-card flex flex-col h-full overflow-hidden">
        {/* Poster Skeleton */}
        <div className="aspect-[2/3] w-full bg-slate-800/60" />

        {/* Info Skeleton */}
        <div className="p-3.5 flex flex-col gap-2.5">
          <div className="h-4 bg-slate-800/80 rounded w-4/5" />
          <div className="h-3 bg-slate-800/50 rounded w-1/2" />
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div className="h-5 bg-slate-800/80 rounded-full w-20" />
            <div className="h-5 bg-slate-800/80 rounded-full w-14" />
          </div>
        </div>
      </div>
    </div>
  );
};
