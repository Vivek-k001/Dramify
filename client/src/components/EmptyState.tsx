import React from 'react';
import { Film, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  actionLink,
  onActionClick,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-dramify-surface/40 border border-white/5 max-w-md mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 shadow-inner">
        {icon || <Film size={26} />}
      </div>
      <h3 className="font-display font-bold text-lg text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed mb-6">{description}</p>
      {actionText && (
        actionLink ? (
          <Link
            to={actionLink}
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-rose-600 text-white border border-white/15 transition-all duration-300"
          >
            {actionText}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onActionClick}
            className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white/10 hover:bg-rose-600 text-white border border-white/15 transition-all duration-300"
          >
            {actionText}
          </button>
        )
      )}
    </div>
  );
};

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to fetch Korean media data. Please try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-rose-950/20 border border-rose-500/20 max-w-md mx-auto my-8">
      <AlertCircle size={32} className="text-rose-400 mb-3" />
      <h3 className="font-display font-semibold text-base text-rose-200 mb-1">Something went wrong</h3>
      <p className="text-rose-300/70 text-xs mb-4">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white transition-colors"
        >
          <RefreshCw size={13} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
