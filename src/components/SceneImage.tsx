'use client';

import { useState, useEffect } from 'react';
import { ShimmerThumbnail } from 'react-shimmer-effects';

interface SceneImageProps {
  characterId: string;
  sceneId: string;
  title: string;
  characterRole: string;
}

export default function SceneImage({ characterId, sceneId, title, characterRole }: SceneImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    console.log(`✅ Scene image loaded successfully: ${characterId}-${sceneId}`);
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = (e: any) => {
    console.error(`❌ Failed to load scene image for ${characterId}-${sceneId}:`, e);
    setIsLoading(false);
    setHasError(true);
  };

  // Add timeout fallback for stuck loading states
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn(`⏰ Scene image loading timeout for ${characterId}-${sceneId}, showing anyway`);
        setIsLoading(false);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading, characterId, sceneId]);

  return (
    <div className="relative aspect-[3/4] overflow-hidden">
      {hasError ? (
        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
          <img 
            src="/error.svg" 
            alt="Failed to load" 
            className="w-5 h-5 opacity-50"
            style={{ filter: 'grayscale(100%)' }}
          />
        </div>
      ) : (
        <>
          <img
            src={`/api/scene-image?characterId=${characterId}&sceneId=${sceneId}&v=20240915`}
            alt={title}
            className={`h-full w-full object-cover object-top transition-all duration-500 group-hover:scale-[1.03] ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="eager"
          />
          
          {/* Shimmer loading placeholder */}
          {isLoading && (
            <div className="absolute inset-0 h-full transition-opacity duration-500">
              <div style={{width: "100%", height: "100%"}}><ShimmerThumbnail /></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
