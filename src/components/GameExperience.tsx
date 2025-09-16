"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import Image from 'next/image';
import { Character, Scene, GameState, GameQuestion } from '@/lib/types';
import ChatSheet from './ChatSheet';
import { type ChatContext } from './VoiceChat';

interface GameExperienceProps {
  character: Character;
  scene: Scene;
  onRefReady?: (ref: { beginGame: () => void; hasBegun: boolean; loading: boolean }) => void;
  onBegin?: () => void;
}

interface AnimatedGameOptionProps {
  option: string;
  optionIndex: number;
  isSelected: boolean;
  isAnswered: boolean;
  onClick: () => void;
}

const AnimatedGameOption: React.FC<AnimatedGameOptionProps> = ({
  option,
  optionIndex,
  isSelected,
  isAnswered,
  onClick
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const springProps = useSpring({
    backgroundColor: isAnswered 
      ? (isSelected ? '#f0f9ff' : '#ffffff')
      : (isHovered ? '#f9fafb' : '#ffffff'),
    borderColor: isAnswered
      ? (isSelected ? '#3b82f6' : '#e5e7eb')
      : (isHovered ? '#d1d5db' : '#e5e7eb'),
    config: config.default
  });

  const checkmarkSpring = useSpring({
    opacity: isSelected && isAnswered ? 1 : 0,
    transform: isSelected && isAnswered ? 'scale(1)' : 'scale(0.8)',
    config: config.gentle
  });

  let buttonClass = "w-full p-4 text-left cursor-pointer overflow-hidden ";
  buttonClass += "rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border ";

  return (
    <animated.button
      onClick={onClick}
      disabled={false}
      className={buttonClass}
      style={springProps}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center text-gray-900">
        {option}
        <animated.span 
          style={checkmarkSpring}
          className="ml-auto text-blue-600"
        >
          ✓
        </animated.span>
      </div>
    </animated.button>
  );
};

export const GameExperience: React.FC<GameExperienceProps> = ({
  character,
  scene,
  onRefReady,
  onBegin
}) => {
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 1,
    choices: [],
    questions: [],
    images: [],
    completed: false
  });
  
  const [loading, setLoading] = useState(false);
  const [hasBegun, setHasBegun] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [roundAnswered, setRoundAnswered] = useState(false);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [composerInput, setComposerInput] = useState('');
  const [dishName, setDishName] = useState<string | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<GameQuestion | null>(null);

  // Chat context for the reusable chat component with current game state
  const chatContext: ChatContext | null = React.useMemo(() => {
    if (!character || !scene) return null;
    
    let gameContext = `\n\nGame Context: This is "${scene.title}" - a 5-round progressive choice game where you build a dish step by step.`;
    
    if (hasBegun) {
      gameContext += `\n\nCurrent Progress: Round ${gameState.currentRound}/5`;
      
      if (gameState.choices.length > 0) {
        gameContext += `\nChoices so far: ${gameState.choices.join(' → ')}`;
      }
      
      if (currentQuestion) {
        gameContext += `\n\nCurrent Question: "${currentQuestion.question}"`;
        gameContext += `\nOptions: ${currentQuestion.options.join(', ')}`;
        
        if (selectedOption) {
          gameContext += `\nCurrently considering: "${selectedOption}"`;
        }
      }
      
      // Add dynamic dish description if we have choices
      if (gameState.choices.length > 0) {
        gameContext += `\n\nCurrent dish development: Building a dish with ${gameState.choices.join(', ')}`;
      }
    } else {
      // Pre-game context - include actual first round options if available
      gameContext += `\n\nThis game involves making 5 progressive choices to build a unique dish.`;
      
      if (previewQuestion) {
        gameContext += `\n\nFirst round options: ${previewQuestion.options.join(', ')}`;
        gameContext += `\nQuestion: "${previewQuestion.question}"`;
      }
      
      gameContext += `\n\nThe 5 rounds will be:`;
      gameContext += `\n1. Choose a protein foundation`;
      gameContext += `\n2. Select a cooking technique`;
      gameContext += `\n3. Pick visible sauces/coatings`;
      gameContext += `\n4. Add substantial sides/accompaniments`;
      gameContext += `\n5. Choose bold finishing touches`;
      gameContext += `\n\nEach choice generates a new image showing the dish evolving.`;
    }
    
    return {
      character,
      scene: {
        ...scene,
        description: (scene.description || '') + gameContext
      },
      // Add game-specific context for ChatSheet to recognize
      gameContext: {
        hasBegun: hasBegun,
        currentRound: gameState.currentRound,
        choices: gameState.choices,
        currentQuestion: currentQuestion,
        selectedOption: selectedOption
      }
    };
  }, [character, scene, hasBegun, gameState.currentRound, gameState.choices, currentQuestion, selectedOption]);

  const beginGame = useCallback(async () => {
    setHasBegun(true);
    setLoading(true);
    onBegin?.();

    try {
      // Generate first question directly without using the function that depends on gameState
      const response = await fetch('/api/game-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          sceneId: scene.id,
          gameType: 'cooking-showdown',
          previousChoices: [],
          currentRound: 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate question');
      }

      const question: GameQuestion = await response.json();
      setCurrentQuestion(question);
      
      // Use pre-supplied base image for game-progression type
      const baseImageUrl = '/game-base/cooking-showdown-base.jpg';
      
      setGameState(prev => ({
        ...prev,
        images: [baseImageUrl]
      }));
      
    } catch (error) {
      console.error('Error starting game:', error);
    } finally {
      setLoading(false);
    }
  }, [character.id, scene.id, onBegin]);

  const generateNextQuestion = useCallback(async (round: number, choices: string[]) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/game-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          sceneId: scene.id,
          gameType: 'cooking-showdown', // Could be dynamic based on scene
          previousChoices: choices,
          currentRound: round
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate question');
      }

      const question: GameQuestion = await response.json();
      setCurrentQuestion(question);
      
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setLoading(false);
    }
  }, [character.id, scene.id]);

  const generateGameImage = useCallback(async (prompt: string, choices: string[], round: number, currentImages: string[]) => {
    try {
      // Convert blob URL to base64 if needed
      let baseImageData = null;
      if (currentImages.length > 0) {
        const lastImageUrl = currentImages[currentImages.length - 1];
        if (lastImageUrl.startsWith('blob:')) {
          // Convert blob URL to base64
          const response = await fetch(lastImageUrl);
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();
          baseImageData = Buffer.from(arrayBuffer).toString('base64');
        } else {
          baseImageData = lastImageUrl;
        }
      }

      const response = await fetch('/api/game-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          sceneId: scene.id,
          round: round,
          previousChoices: choices,
          currentPrompt: prompt,
          baseImageData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      setGameState(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
      
    } catch (error) {
      console.error('Error generating image:', error);
    }
  }, [character.id, scene.id]);

  const handleOptionSelect = (option: string, index: number) => {
    if (loading) return;
    
    // Allow re-selection - different from quiz behavior
    setSelectedOption(option);
    setRoundAnswered(true);
    
    // Just update the selected choice - don't generate image yet
    // Image generation happens when user clicks "Next"
  };

  const handleNext = async () => {
    if (!roundAnswered || !selectedOption) return;

    // Immediately show loading state
    setLoading(true);
    setIsTransitioning(true);

    try {
      // Generate image for the selected choice
      if (currentQuestion) {
        const newChoices = [...gameState.choices, selectedOption];
        
        // Update game state with the choice
        setGameState(prev => ({
          ...prev,
          choices: newChoices
        }));

        // Generate dynamic dish description based on all choices so far
        console.log(`🍽️ Generating dynamic dish description for choices: ${newChoices.join(' → ')}`);
        
        const dishDescResponse = await fetch('/api/game-dish-description', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: character.id,
            choices: newChoices,
            gameType: 'cooking-showdown'
          })
        });

        let dishDescription = selectedOption; // fallback
        if (dishDescResponse.ok) {
          const dishData = await dishDescResponse.json();
          dishDescription = dishData.description;
          console.log(`✅ Dynamic dish description: "${dishDescription}"`);
        } else {
          console.log(`⚠️ Using fallback description: "${dishDescription}"`);
        }

        // Generate image with cumulative dish description
        console.log(`🎨 Generating image with dish description: "${dishDescription}"`);
        await generateGameImage(
          dishDescription, 
          newChoices, 
          gameState.currentRound, 
          gameState.images
        );
      }

      if (gameState.currentRound < 5) {
        const nextRound = gameState.currentRound + 1;
        
        // Move to next round
        setGameState(prev => ({
          ...prev,
          currentRound: nextRound
        }));
        
        setSelectedOption(null);
        setRoundAnswered(false);
        
        await generateNextQuestion(nextRound, gameState.choices);
        
      } else {
        // Complete the game and generate dish name
        setGameState(prev => ({
          ...prev,
          completed: true
        }));

        // Generate elegant dish name
        const dishNameResponse = await fetch('/api/game-dish-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: character.id,
            choices: gameState.choices,
            gameType: 'cooking-showdown'
          })
        });

        if (dishNameResponse.ok) {
          const dishData = await dishNameResponse.json();
          setDishName(dishData.name);
          console.log(`🏷️ Final dish name: "${dishData.name}"`);
        }
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
    } finally {
      // Stop loading and transition
      setLoading(false);
      setIsTransitioning(false);
      
      // Scroll to top
      setTimeout(() => {
        const container = document.querySelector('.overflow-y-auto');
        if (container) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleChatSheetClose = () => {
    setChatSheetOpen(false);
  };

  const handleRestartGame = () => {
    setGameState({
      currentRound: 1,
      choices: [],
      questions: [],
      images: [],
      completed: false
    });
    setCurrentQuestion(null);
    setSelectedOption(null);
    setRoundAnswered(false);
    setHasBegun(false);
    setIsTransitioning(false);
    setDishName(null);
  };

  // Fetch preview question for pre-game discussions
  useEffect(() => {
    if (!hasBegun && !previewQuestion) {
      const fetchPreviewQuestion = async () => {
        try {
          const response = await fetch('/api/game-questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              characterId: character.id,
              sceneId: scene.id,
              gameType: 'cooking-showdown',
              previousChoices: [],
              currentRound: 1
            })
          });

          if (response.ok) {
            const question: GameQuestion = await response.json();
            setPreviewQuestion(question);
            console.log(`🔍 Preview question loaded: ${question.options.join(', ')}`);
          }
        } catch (error) {
          console.error('Error fetching preview question:', error);
        }
      };

      fetchPreviewQuestion();
    }
  }, [character.id, scene.id, hasBegun, previewQuestion]);

  // Set up ref for parent component (same as QuizExperience)
  useEffect(() => {
    if (onRefReady) {
      onRefReady({
        beginGame,
        hasBegun,
        loading
      });
    }
  }, [hasBegun, loading]); // Remove beginGame and onRefReady from dependencies

  // Start screen (exact same as QuizExperience)
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
            onClick={beginGame}
            disabled={loading}
            className="text-sm text-gray-500 underline hover:text-gray-700 transition-colors cursor-pointer"
          >
            {loading ? 'Starting...' : `Begin ${scene.title}`}
          </button>
        </div>
      </div>
    );
  }

  // Final results screen (matching QuizExperience exactly)
  if (gameState.completed) {
    const currentImage = gameState.images[gameState.images.length - 1];
    
    return (
      <div className="flex-1 flex flex-col justify-start pt-6">
        {/* Completion Text - custom for cooking game */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 font-serif mb-2">
            Mamma Mia!
          </p>
          <h2 className="text-xl text-gray-700 mb-2">
            {dishName || 'Your Culinary Creation'}
          </h2>
          <p className="text-sm text-gray-500">
            {gameState.choices.join(', ')}
          </p>
        </div>

        {/* Final Image - Full width square below text */}
        {currentImage && (
          <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-6">
            <Image
              src={currentImage}
              alt="Your final creation"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Action Buttons - same styling as QuizExperience */}
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => {
              const shareText = `I just created something amazing in ${scene.title} with ${character.name}!`;
              navigator.share?.({
                title: `Game Results: ${scene.title}`,
                text: shareText,
                url: window.location.href
              }).catch(() => {
                navigator.clipboard?.writeText(`${shareText} ${window.location.href}`);
              });
            }}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <img src="/share.svg" alt="" className="w-4 h-4 filter brightness-0 invert" />
            Share
          </button>
          <button 
            onClick={handleRestartGame}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <img src="/restart.svg" alt="" className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state with shimmer (same as QuizExperience but with image shimmer)
  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center">
        <div className="w-full">
          {/* Image skeleton */}
          <div className="w-full aspect-square bg-gray-200 rounded-lg animate-pulse mb-4"></div>
          
          {/* Question text skeleton */}
          <div className="h-16 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
          
          {/* Answer options skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i}
                className="h-14 bg-gray-200 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentImage = gameState.images[gameState.images.length - 1];
  const fadeClass = isTransitioning ? "opacity-0" : "opacity-100";

  // Main game layout - exactly matching QuizExperience structure
  return (
    <div className="flex-1 flex flex-col">
      {/* Scrolling Game Content - same structure as QuizExperience */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full min-h-full">
          <div className={`w-full min-h-full flex flex-col justify-center transition-opacity duration-200 ${fadeClass}`}>
            
            {/* Current Image with overlaid progress pill */}
            {currentImage && (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
                <Image
                  src={currentImage}
                  alt={`Round ${gameState.currentRound}`}
                  fill
                  className="object-cover"
                />
                {/* Progress pill overlay */}
                <div className="absolute top-3 left-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full">
                  <p className="text-xs">{gameState.currentRound}/5</p>
                </div>
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            )}

            {/* Question Header - more compact without progress indicator */}
            <div className="mb-4">
              {currentQuestion && (
                <h2 className="text-lg font-medium leading-relaxed">
                  {currentQuestion.question}
                </h2>
              )}
            </div>

            {/* Game Options - same styling as QuizExperience answer options */}
            {currentQuestion && (
              <div className="space-y-3 mb-2">
                {currentQuestion.options.map((option, index) => (
                  <AnimatedGameOption
                    key={index}
                    option={option}
                    optionIndex={index}
                    isSelected={selectedOption === option}
                    isAnswered={roundAnswered}
                    onClick={() => handleOptionSelect(option, index)}
                  />
                ))}
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Action Buttons - exactly matching QuizExperience */}
      <div className="flex py-4" style={{ gap: '8px' }}>
        <button
          onClick={() => setChatSheetOpen(true)}
          className="flex-1 h-11 bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center font-medium text-sm gap-2 cursor-pointer"
        >
          <Image
            src="/wave.svg"
            alt="Discuss"
            width={20}
            height={20}
            className="text-gray-600"
          />
          Discuss
        </button>
        <button
          onClick={handleNext}
          disabled={!roundAnswered}
          className="flex-1 h-11 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center font-medium text-sm cursor-pointer disabled:cursor-not-allowed"
          style={{
            backgroundColor: !roundAnswered ? '#f1f1f1' : undefined,
            color: !roundAnswered ? '#9a9a9a' : undefined
          }}
        >
          {gameState.currentRound === 5 ? 'Finish' : 'Next'}
        </button>
      </div>

      {/* Chat Sheet - exactly matching QuizExperience */}
      {chatContext && (
        <ChatSheet
          isOpen={chatSheetOpen}
          onClose={handleChatSheetClose}
          context={chatContext}
          initialMessage={composerInput}
          onBegin={beginGame}
        />
      )}
    </div>
  );
};
