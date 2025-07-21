'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/lib/gameLogic';
import { getRankSymbol, getSuitSymbol, getSuitColor } from '@/lib/gameUtils';

interface PlayingCardProps {
  card?: Card | null;
  isRevealed?: boolean;
  className?: string;
  onClick?: () => void;
  isFlipping?: boolean;
}

export default function PlayingCard({ 
  card, 
  isRevealed = true, 
  className = '', 
  onClick,
  isFlipping = false 
}: PlayingCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    console.error(`Failed to load card image: ${card?.imageUrl}`);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // If no card or not revealed, show enhanced card back
  if (!card || !isRevealed) {
    return (
      <div 
        className={`playing-card bg-gradient-to-br from-red-800 via-red-900 to-black border-2 border-yellow-400 cursor-pointer rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 ${className} ${isFlipping ? 'animate-card-flip' : ''}`}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label="Hidden card"
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-3 relative">
          {/* Decorative pattern */}
          <div className="absolute inset-2 border border-yellow-300/30 rounded-lg"></div>
          <div className="absolute inset-3 border border-yellow-300/20 rounded-md"></div>
          
          <div className="text-yellow-200 text-center z-10">
            <div className="text-2xl font-bold mb-2">♠♥♦♣</div>
            <div className="text-xs font-bold tracking-wider opacity-90">POKER</div>
            <div className="text-xs opacity-70 mt-1">CARD</div>
          </div>
        </div>
      </div>
    );
  }

  // Show actual card with enhanced design
  return (
    <div 
      className={`playing-card bg-white border-2 border-gray-400 cursor-pointer rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 overflow-hidden ${className} ${isFlipping ? 'animate-card-flip' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${getRankSymbol(card.rank)} of ${getSuitSymbol(card.suit)}`}
    >
      {!imageError ? (
        <div className="relative w-full h-full">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          <Image
            src={card.imageUrl}
            alt={`${getRankSymbol(card.rank)} of ${getSuitSymbol(card.suit)}`}
            fill
            className="object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            priority={true}
            sizes="(max-width: 768px) 80px, 120px"
          />
          {/* Enhanced card label overlay */}
          <div className="absolute top-1 left-1 bg-white/95 rounded-md px-2 py-1 text-sm font-bold shadow-sm border border-gray-200">
            <span className={getSuitColor(card.suit)}>
              {getRankSymbol(card.rank)}{getSuitSymbol(card.suit)}
            </span>
          </div>
        </div>
      ) : (
        // Enhanced fallback card design with professional poker card styling
        <div className="w-full h-full p-2 flex flex-col justify-between bg-white relative border border-gray-400 rounded-lg">
          {/* Top left corner */}
          <div className="flex flex-col items-start text-sm">
            <div className={`font-bold text-xl ${getSuitColor(card.suit)}`}>
              {getRankSymbol(card.rank)}
            </div>
            <div className={`text-xl ${getSuitColor(card.suit)}`}>
              {getSuitSymbol(card.suit)}
            </div>
          </div>

          {/* Center - Large rank and suit */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className={`text-5xl font-bold ${getSuitColor(card.suit)} mb-1`}>
              {getRankSymbol(card.rank)}
            </div>
            <div className={`text-4xl ${getSuitColor(card.suit)}`}>
              {getSuitSymbol(card.suit)}
            </div>
          </div>

          {/* Bottom right corner (rotated) */}
          <div className="flex flex-col items-end transform rotate-180 text-sm">
            <div className={`font-bold text-xl ${getSuitColor(card.suit)}`}>
              {getRankSymbol(card.rank)}
            </div>
            <div className={`text-xl ${getSuitColor(card.suit)}`}>
              {getSuitSymbol(card.suit)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Flippable card component with animation
interface FlippableCardProps extends PlayingCardProps {
  isFaceUp: boolean;
}

export function FlippableCard({ 
  card, 
  isFaceUp, 
  className = '', 
  onClick 
}: FlippableCardProps) {
  // Simplified approach - just show the card based on isFaceUp state
  return (
    <div className={className}>
      <PlayingCard 
        card={card} 
        isRevealed={isFaceUp} 
        onClick={onClick}
        className="w-full h-full"
      />
    </div>
  );
}

// Card placeholder for empty slots
export function CardPlaceholder({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`playing-card bg-casino-green/30 border-2 border-dashed border-casino-gold/50 ${className}`}>
      <div className="w-full h-full flex items-center justify-center text-casino-gold/70">
        {children || '?'}
      </div>
    </div>
  );
}
