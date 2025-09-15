'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTransition, animated } from '@react-spring/web';
import type { Scene, Character } from '@/lib/types';
import { getCharacterImageUrl } from '@/lib/image';
import SceneImage from './SceneImage';

interface SceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBegin: () => void;
  scene: Scene | null;
  character: Character | null;
  hasStarted?: boolean;
}

export default function SceneModal({ isOpen, onClose, onBegin, scene, character, hasStarted = false }: SceneModalProps) {
  // Transition animations
  const transition = useTransition(isOpen, {
    from: { opacity: 0, transform: 'translateY(100%)' },
    enter: { opacity: 1, transform: 'translateY(0%)' },
    leave: { opacity: 0, transform: 'translateY(100%)' },
    config: { tension: 280, friction: 30 }
  });

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!scene || !character) {
    return null;
  }

  return transition((style, item) => item ? (
    <>
      {/* Scrim */}
      <animated.div 
        style={{ opacity: style.opacity }}
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Sheet */}
      <animated.div 
        style={{ 
          transform: style.transform,
          borderTopLeftRadius: '24px', 
          borderTopRightRadius: '24px' 
        }}
        className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-2xl"
      >
          <div className="mx-auto max-w-md">
          {/* Scene Image with Overlays */}
          <div className="mb-5 mx-3 mt-3">
            <div className="relative aspect-[1/0.4] overflow-hidden rounded-2xl">
              <img
                src={`/api/scene-image?characterId=${character.id}&sceneId=${scene.id}&v=20240915`}
                alt={scene.title}
                className="h-full w-full object-cover object-center"
                loading="eager"
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-5">
            {/* Scene Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{scene.title}</h2>

            {/* Scene Description */}
            {scene.description && (
              <p className="text-base text-gray-600 mb-5 leading-snug">
                {scene.description}
              </p>
            )}

            {/* Scene Rules */}
            {scene.rules && scene.rules.length > 0 ? (
              <div className="mb-6">
                <ol className="space-y-4">
                  {scene.rules.map((rule, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-gray-600 leading-snug">
                            <div className="flex-shrink-0 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-700">{index + 1}</span>
                      </div>
                      <span className="flex-1">{rule}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="mb-4 text-xs text-red-500">
                Debug: No rules found - {JSON.stringify(scene?.rules)}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={hasStarted ? onClose : onBegin}
              className="w-full flex items-center justify-center px-6 py-3 bg-black hover:bg-gray-800 text-sm font-semibold text-white rounded-xl transition-colors cursor-pointer"
            >
              {hasStarted ? 'Continue' : 'Begin'}
            </button>
          </div>

          {/* Bottom Handle */}
          <div>
            <Image
              src="/handle.png"
              alt="Handle"
              width={393}
              height={34}
              className="w-full h-auto"
            />
          </div>
          </div>
        </animated.div>
    </>
  ) : null);
}
