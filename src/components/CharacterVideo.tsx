'use client';

import React from 'react';
import { getCharacterImageUrl, getCharacterIdleVideoUrl } from '@/lib/image';
import type { Character } from '@/lib/types';

interface CharacterVideoProps {
  character: Character;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  height?: string;
}

export const CharacterVideo: React.FC<CharacterVideoProps> = ({ 
  character, 
  className = '', 
  size = 'medium',
  fullWidth = false,
  height = 'h-24'
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32'
  };

  const containerClasses = fullWidth 
    ? `w-full aspect-square` 
    : sizeClasses[size];

  return (
    <div className={`${containerClasses} rounded-xl overflow-hidden bg-gray-100 ${className}`}>
      <video
        src={getCharacterIdleVideoUrl(character)}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover object-top"
      >
        {/* Fallback image if video fails to load */}
        <img
          src={getCharacterImageUrl(character)}
          alt={character.name}
          className="w-full h-full object-cover object-top"
        />
      </video>
    </div>
  );
};

export default CharacterVideo;
