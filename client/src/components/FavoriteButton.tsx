import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthPromptModal } from './AuthPromptModal';
import { cn } from '../utils/cn';

interface FavoriteButtonProps {
  initialFavorite?: boolean;
  onToggle?: (isFav: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  initialFavorite = false,
  onToggle,
  className,
  size = 'md',
}) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    const next = !isFavorite;
    setIsFavorite(next);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    onToggle?.(next);
  };

  const sizeStyles = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  const iconSizes = {
    sm: 15,
    md: 18,
    lg: 22,
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        className={cn(
          'rounded-full transition-all duration-300 backdrop-blur-md border flex items-center justify-center',
          isFavorite
            ? 'bg-rose-600/90 text-white border-rose-400/50 shadow-lg shadow-rose-900/40'
            : 'bg-black/50 hover:bg-black/80 text-white/70 hover:text-white border-white/10 hover:border-white/30',
          sizeStyles[size],
          isAnimating && 'scale-125',
          className
        )}
      >
        <Heart
          size={iconSizes[size]}
          className={cn(
            'transition-all duration-300',
            isFavorite ? 'fill-current text-white' : 'stroke-[2]'
          )}
        />
      </button>

      {/* Auth prompt modal when unauthenticated */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In to Save Favorites"
        description="Do you want to sign in? You need an account to save favorite dramas, curate your custom lists, and sync across devices."
      />
    </>
  );
};
