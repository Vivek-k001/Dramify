import React from 'react';
import { cn } from '../utils/cn';

interface TabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
  size = 'md',
}: TabsProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex items-center p-1 rounded-full bg-dramify-surface/90 backdrop-blur-md border border-white/10 shadow-inner',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full font-medium transition-all duration-300 relative',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-xs sm:text-sm',
              isActive
                ? 'bg-rose-600 text-white font-semibold shadow-md shadow-rose-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            )}
          >
            {tab.icon && <span className="opacity-80">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px]',
                  isActive ? 'bg-black/25 text-white' : 'bg-white/10 text-slate-400'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
