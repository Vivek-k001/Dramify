import React, { useState } from 'react';
import { Bookmark, Eye, Check, ChevronDown } from 'lucide-react';
import { WatchStatus } from '../types/media';
import { cn } from '../utils/cn';

interface WatchStatusButtonProps {
  initialStatus?: WatchStatus | null;
  onStatusChange?: (status: WatchStatus | null) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const WatchStatusButton: React.FC<WatchStatusButtonProps> = ({
  initialStatus = null,
  onStatusChange,
  className,
  size = 'md',
}) => {
  const [status, setStatus] = useState<WatchStatus | null>(initialStatus);
  const [isOpen, setIsOpen] = useState(false);

  const statusOptions: Array<{ id: WatchStatus; label: string; icon: React.ReactNode; color: string }> = [
    { id: 'plan_to_watch', label: 'Plan to Watch', icon: <Bookmark size={14} />, color: 'text-sky-400' },
    { id: 'watching', label: 'Watching', icon: <Eye size={14} />, color: 'text-amber-400' },
    { id: 'watched', label: 'Watched', icon: <Check size={14} />, color: 'text-emerald-400' },
  ];

  const handleSelect = (selectedStatus: WatchStatus | null, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = status === selectedStatus ? null : selectedStatus;
    setStatus(newStatus);
    setIsOpen(false);
    onStatusChange?.(newStatus);
  };

  const currentOption = statusOptions.find((opt) => opt.id === status);

  return (
    <div className={cn('relative inline-block text-left', className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium transition-all backdrop-blur-md border shadow-sm',
          status
            ? 'bg-white/15 text-white border-white/20 hover:bg-white/25'
            : 'bg-black/50 text-slate-300 hover:text-white border-white/10 hover:border-white/25',
          size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs'
        )}
      >
        {currentOption ? (
          <>
            <span className={currentOption.color}>{currentOption.icon}</span>
            <span>{currentOption.label}</span>
          </>
        ) : (
          <>
            <Bookmark size={13} className="text-slate-400" />
            <span>Add to List</span>
          </>
        )}
        <ChevronDown size={12} className={cn('opacity-60 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-dramify-surface/95 backdrop-blur-xl border border-white/15 shadow-2xl z-30 py-1.5 animate-scale-in"
        >
          <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-white/5 mb-1">
            Tracking Status
          </div>
          {statusOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={(e) => handleSelect(opt.id, e)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition-colors rounded-lg mx-1 max-w-[calc(100%-8px)]',
                status === opt.id
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <span className="flex items-center gap-2">
                <span className={opt.color}>{opt.icon}</span>
                {opt.label}
              </span>
              {status === opt.id && <Check size={14} className="text-rose-400" />}
            </button>
          ))}
          {status && (
            <div className="border-t border-white/5 mt-1 pt-1">
              <button
                type="button"
                onClick={(e) => handleSelect(null, e)}
                className="w-full text-left px-3 py-1.5 text-[11px] text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg mx-1 max-w-[calc(100%-8px)] transition-colors"
              >
                Remove from List
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
