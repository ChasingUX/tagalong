"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import Image from 'next/image';
import { Howl } from 'howler';
import { Character, Scene, ExploreState } from '@/lib/types';
import { getExploreData } from '@/lib/exploreData';
import VoiceChat, { type ChatContext } from './VoiceChat';

interface ExploreExperienceProps {
  character: Character;
  scene: Scene;
  onRefReady?: (ref: { beginExplore: () => void; hasBegun: boolean; loading: boolean }) => void;
  onBegin?: () => void;
}

interface ExploreButtonProps {
  label: string;
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  variant: 'primary' | 'secondary';
}

const ExploreButton: React.FC<ExploreButtonProps> = ({
  label,
  onClick,
  loading,
  disabled,
  variant
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const springProps = useSpring({
    backgroundColor: disabled 
      ? '#f3f4f6'
      : variant === 'primary'
        ? (isHovered ? '#2563eb' : '#3b82f6')
        : (isHovered ? '#374151' : '#4b5563'),
    transform: isHovered && !disabled ? 'scale(1.02)' : 'scale(1)',
    config: config.gentle
  });

  const buttonClass = `
    px-6 py-4 rounded-xl font-medium text-white shadow-lg transition-all duration-200
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
  `;

  return (
    <animated.button
      onClick={onClick}
      disabled={disabled}
      className={buttonClass}
      style={springProps}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : (
        label
      )}
    </animated.button>
  );
};

// Shimmer loading component
const ShimmerLoader: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-gray-100">
      <div className="w-full h-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
    </div>
  );
};

// Share screen component
const ShareScreen: React.FC<{
  exploreState: ExploreState;
  character: Character;
  onClose: () => void;
}> = ({ exploreState, character, onClose }) => {
  const fadeIn = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: config.gentle
  });

  return (
    <animated.div style={fadeIn} className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Venice Food Tour Complete! 🇮🇹
            </h2>
            <p className="text-gray-600">
              You explored {exploreState.visitedStops.length} unique moments with {character.name}
            </p>
          </div>

          {/* Thumbnail gallery */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {exploreState.visitedStops.map((visit, index) => (
              <div key={`${visit.stopId}-${visit.depth}`} className="relative">
                <div className="aspect-[9/16] rounded-lg overflow-hidden">
                  <Image
                    src={visit.image}
                    alt={visit.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs font-medium truncate">
                    {visit.title}
                  </p>
                  <p className="text-white/80 text-xs">
                    Stop {Math.floor(index / 3) + 1}
                    {visit.depth > 0 && ` • Level ${visit.depth}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Continue Exploring
            </button>
            <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Share
            </button>
          </div>
        </div>
      </div>
    </animated.div>
  );
};

export const ExploreExperience: React.FC<ExploreExperienceProps> = ({
  character,
  scene,
  onRefReady,
  onBegin
}) => {
  const [exploreState, setExploreState] = useState<ExploreState>({
    currentStop: 0,
    currentDepth: 0,
    visitedStops: [],
    completed: false
  });

  const [loading, setLoading] = useState(false);
  const [hasBegun, setHasBegun] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentDescription, setCurrentDescription] = useState<string>('');
  const [nextStepLoading, setNextStepLoading] = useState(false);
  const [goDeeperLoading, setGoDeeperLoading] = useState(false);
  const [showShareScreen, setShowShareScreen] = useState(false);
  const [tourId] = useState('venice-food-tour'); // For now, hardcoded to Venice tour
  const [isExpanded, setIsExpanded] = useState(false);

  // Audio refs
  const soundscapeRef = useRef<Howl | null>(null);
  const voiceRef = useRef<Howl | null>(null);

  // Get explore data
  const exploreData = getExploreData(character.id, tourId);

  // Chat context for voice composer
  const chatContext: ChatContext = {
    character: character,
    scene: scene
  };

  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string; id?: string }>>([]);
  const [voiceChatLoading, setVoiceChatLoading] = useState(false);

  // Initialize audio when component mounts
  useEffect(() => {
    if (exploreData && exploreData.length > 0) {
      const firstStop = exploreData[0];
      soundscapeRef.current = new Howl({
        src: [`/soundscapes/${firstStop.soundscapeFile}`],
        loop: true,
        volume: 0.3
      });
    }

    return () => {
      // Cleanup audio
      if (soundscapeRef.current) {
        soundscapeRef.current.unload();
      }
      if (voiceRef.current) {
        voiceRef.current.unload();
      }
    };
  }, [exploreData]);

  // Expose methods to parent
  useEffect(() => {
    if (onRefReady) {
      onRefReady({
        beginExplore: () => {
          beginExplore();
        },
        hasBegun,
        loading
      });
    }
  }, [hasBegun, loading, onRefReady]);

  const beginExplore = useCallback(async () => {
    if (!exploreData || exploreData.length === 0) return;

    setLoading(true);
    setHasBegun(true);
    
    // Start soundscape
    if (soundscapeRef.current) {
      soundscapeRef.current.play();
    }

    try {
      // Load first stop
      await loadStop(0, 0);
      onBegin?.();
    } catch (error) {
      console.error('Error beginning explore:', error);
    } finally {
      setLoading(false);
    }
  }, [exploreData, onBegin]);

  const playVoiceWithMixing = useCallback((audioUrl: string) => {
    // Stop any existing voice audio
    if (voiceRef.current) {
      voiceRef.current.unload();
    }

    // Create new voice audio with ducking
    voiceRef.current = new Howl({
      src: [audioUrl],
      volume: 1.0,
      onplay: () => {
        // Duck the soundscape
        if (soundscapeRef.current) {
          soundscapeRef.current.fade(0.3, 0.1, 500);
        }
      },
      onend: () => {
        // Restore soundscape volume
        if (soundscapeRef.current) {
          soundscapeRef.current.fade(0.1, 0.3, 500);
        }
      }
    });

    voiceRef.current.play();
  }, []);

  const generateStepGreeting = useCallback(async (title: string, description: string, imagePrompt: string) => {
    try {
      console.log('🎵 ExploreExperience: Generating voice greeting for:', title);
      
      // Create visual description prompt based on the image generation prompt
      const visualPrompt = `You are Chef Nomi, describing what you see at ${title} in Venice. Based on this scene: "${imagePrompt}", describe what's happening around you in a vivid, immersive way. Be highly descriptive and provocative, painting a picture with words of the sights, sounds, smells, and atmosphere. Keep it to 2-3 sentences and make it feel like you're right there experiencing it. Don't repeat basic descriptions - focus on the sensory details and what makes this moment special.`;
      
      // First get the descriptive text from the chat API
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          sceneId: scene.id,
          messages: [
            { role: 'user', content: visualPrompt, id: `greeting-${Date.now()}` }
          ]
        })
      });
      
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        console.log('🎵 ExploreExperience: Generated visual description:', chatData.message);
        
        // Now generate TTS for the descriptive text
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            text: chatData.message,
            characterId: character.id
          })
        });
        
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          console.log('🎵 ExploreExperience: Voice greeting received from Play.ai');
          
          // Play with Howler and mix with soundscape
          if (ttsData.audioUrl) {
            playVoiceWithMixing(ttsData.audioUrl);
          }
        }
      }
    } catch (error) {
      console.error('🎵 ExploreExperience: Voice greeting error:', error);
    }
  }, [character.id, scene.id, playVoiceWithMixing]);

  const generateQuickGreeting = useCallback((title: string, imagePrompt: string): string => {
    // Create concise, location-specific greetings based on the visual scene
    const greetings = {
      'Rialto Market': "Look at those glistening fish on ice! The vendors are calling out their freshest catch.",
      'Bacaro Wine Bar': "Step into this cozy bacaro - smell those delicious cicchetti and local wine.",
      'Gelateria by the Canal': "Perfect timing for gelato! See how the sunset light dances on the canal.",
      'Campo Santa Margherita': "The energy here is electric! Students and locals gathering for late-night bites.",
      'Grand Canal Terrace Feast': "What a view! The Grand Canal sparkles as we celebrate with this incredible feast."
    };

    // Return predefined greeting or create a simple one
    return greetings[title as keyof typeof greetings] || `Welcome to ${title}! Take in this beautiful Venice scene.`;
  }, []);

  const loadStop = useCallback(async (stopIndex: number, depth: number) => {
    if (!exploreData || stopIndex >= exploreData.length) return;

    const stop = exploreData[stopIndex];
    
    try {
      // Use the combined API that generates both image and voice description
      const response = await fetch('/api/explore-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          tourId,
          stopId: stop.id,
          depth,
          previousChoices: exploreState.visitedStops.map(v => v.title)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load stop:', response.status, errorText);
        throw new Error(`Failed to load stop: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      setCurrentImage(data.imageUrl);
      setCurrentTitle(data.title);
      setCurrentDescription(data.description);

      // Update explore state
      setExploreState(prev => ({
        ...prev,
        currentStop: stopIndex,
        currentDepth: depth,
        visitedStops: [
          ...prev.visitedStops,
          {
            stopId: stop.id,
            depth,
            image: data.imageUrl,
            title: data.title
          }
        ]
      }));

      // Update soundscape if moving to new stop
      if (depth === 0 && soundscapeRef.current) {
        soundscapeRef.current.unload();
        soundscapeRef.current = new Howl({
          src: [`/soundscapes/${stop.soundscapeFile}`],
          loop: true,
          volume: 0.3
        });
        soundscapeRef.current.play();
      }

      // Generate TTS from the voice description if available
      if (data.voiceDescription) {
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            text: data.voiceDescription,
            characterId: character.id
          })
        });
        
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          console.log('🎵 ExploreExperience: Voice greeting received from Play.ai');
          
          // Play with Howler and mix with soundscape
          if (ttsData.audioUrl) {
            playVoiceWithMixing(ttsData.audioUrl);
          }
        }
      }

    } catch (error) {
      console.error('Error loading stop:', error);
    }
  }, [exploreData, character.id, tourId, exploreState.visitedStops, playVoiceWithMixing]);

  const handleNextStop = useCallback(async () => {
    setNextStepLoading(true);
    
    const nextStopIndex = exploreState.currentStop + 1;
    
    if (nextStopIndex >= (exploreData?.length || 0)) {
      // Tour complete
      setExploreState(prev => ({ ...prev, completed: true }));
      setShowShareScreen(true);
      if (soundscapeRef.current) {
        soundscapeRef.current.fade(0.3, 0, 1000);
      }
    } else {
      await loadStop(nextStopIndex, 0);
    }
    
    setNextStepLoading(false);
  }, [exploreState.currentStop, exploreData, loadStop]);

  const handleGoDeeper = useCallback(async () => {
    setGoDeeperLoading(true);
    
    const nextDepth = exploreState.currentDepth + 1;
    await loadStop(exploreState.currentStop, nextDepth);
    
    setGoDeeperLoading(false);
  }, [exploreState.currentStop, exploreState.currentDepth, loadStop]);


  // Determine button states
  const canGoDeeper = exploreData && exploreState.currentDepth < 2 && 
    exploreData[exploreState.currentStop]?.goDeeper?.[exploreState.currentDepth === 0 ? 'level1' : 'level2'];
  
  const isLastStop = exploreState.currentStop >= (exploreData?.length || 0) - 1;

  if (!hasBegun) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <Image
            src="/star.svg"
            alt="Star"
            width={20}
            height={20}
            className="text-gray-400"
            style={{ opacity: 0.5 }}
          />
          <button 
            onClick={beginExplore}
            className="text-sm text-gray-500 underline hover:text-gray-700 transition-colors cursor-pointer"
          >
            Begin {scene.title}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Background overlay - animates to black when expanded */}
      <div 
        className={`fixed inset-0 transition-all duration-300 ${
          isExpanded ? 'bg-black z-40' : 'bg-transparent pointer-events-none'
        }`}
      />
      
      <div className={`h-full flex flex-col relative transition-all duration-300 ${
        isExpanded ? 'fixed inset-0 z-50 -mx-5' : 'justify-between mx-0'
      }`}>
      {/* Image container - responsive to expanded state */}
      <div 
        className={`relative cursor-pointer transition-all duration-300 ${
          isExpanded 
            ? 'absolute inset-0 flex items-center justify-center bg-black/90' 
            : 'w-full aspect-[5/6] rounded-xl overflow-hidden'
        }`}
        style={{
          marginTop: isExpanded ? '50px' : '0px'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded && (
          <div className="w-full max-h-[95vh] aspect-[5/6] rounded-xl overflow-hidden">
            {!loading && currentImage ? (
              <Image
                src={currentImage}
                alt={currentTitle}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <ShimmerLoader />
            )}
          </div>
        )}
        
        {!isExpanded && (
          <>
            {loading || !currentImage ? (
              <ShimmerLoader />
            ) : (
              <Image
                src={currentImage}
                alt={currentTitle}
                fill
                className="object-cover"
                priority
              />
            )}
          </>
        )}

        {/* Expand button - bottom right - only show when image is loaded */}
        {!loading && currentImage && (
          <div className="absolute bottom-3 right-3">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-colors hover:bg-white/8"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.04)', 
                backdropFilter: 'blur(50px)' 
              }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Image
                src={isExpanded ? "/collapse.svg" : "/expand.svg"}
                alt={isExpanded ? "Collapse" : "Expand"}
                width={16}
                height={16}
                className="filter invert"
              />
            </div>
          </div>
        )}
      </div>

      {/* Title and description below image - fade out and collapse when expanded */}
      <div className={`transition-all duration-300 overflow-hidden ${
        isExpanded 
          ? 'opacity-0 pointer-events-none h-0 mt-0' 
          : 'opacity-100 h-auto mt-4'
      }`}>
        {loading || !currentTitle ? (
          /* Shimmer placeholders for title and description */
          <>
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          </>
        ) : (
          <>
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              {currentTitle}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {currentDescription}
            </p>
          </>
        )}
      </div>

      {/* Action buttons below text - fade out and collapse when expanded */}
      <div className={`flex transition-all duration-300 overflow-hidden ${
        isExpanded 
          ? 'opacity-0 pointer-events-none h-0 mt-0' 
          : 'opacity-100 h-auto mt-4'
      }`} style={{ gap: '8px' }}>
        {canGoDeeper && (
          <button
            onClick={handleGoDeeper}
            disabled={goDeeperLoading || nextStepLoading}
            className="flex-1 h-11 bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-medium text-sm cursor-pointer disabled:cursor-not-allowed"
            style={{
              backgroundColor: goDeeperLoading ? '#f1f1f1' : undefined,
              color: goDeeperLoading ? '#9a9a9a' : undefined
            }}
          >
            {goDeeperLoading ? 'Loading...' : 'Go Deeper'}
          </button>
        )}
        
        <button
          onClick={handleNextStop}
          disabled={nextStepLoading || goDeeperLoading}
          className={`${canGoDeeper ? 'flex-1' : 'w-full'} h-11 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center font-medium text-sm cursor-pointer disabled:cursor-not-allowed`}
          style={{
            backgroundColor: nextStepLoading ? '#f1f1f1' : undefined,
            color: nextStepLoading ? '#9a9a9a' : undefined
          }}
        >
          {nextStepLoading ? 'Loading...' : (isLastStop ? 'Complete Tour' : 'Next Stop')}
        </button>
      </div>

      {/* Voice Chat Integration - positioned at bottom, hidden when expanded */}
      <div className={`transition-all duration-300 overflow-hidden ${
        isExpanded 
          ? 'opacity-0 pointer-events-none h-0 mt-0' 
          : 'opacity-100 h-auto mt-auto'
      }`}>
        <VoiceChat
          context={chatContext}
          messages={messages}
          onMessagesChange={setMessages}
          loading={voiceChatLoading}
          onLoadingChange={setVoiceChatLoading}
          showComposer={true}
          composerMode="normal"
          hasBegun={true}
          className=""
          silenceThreshold={2000}
          hideCharacterVideo={true}
          hideEmptyState={true}
        />
      </div>

      {/* Share Screen */}
      {showShareScreen && (
        <ShareScreen
          exploreState={exploreState}
          character={character}
          onClose={() => setShowShareScreen(false)}
        />
      )}
      </div>
    </>
  );
};

export default ExploreExperience;
