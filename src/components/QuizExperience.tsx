"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import Image from 'next/image';
import { Character, Scene } from '@/lib/types';
import Composer from './Composer';

interface QuizExperienceProps {
  character: Character;
  scene: Scene;
  onRefReady?: (ref: { beginQuiz: () => void; hasBegun: boolean; loading: boolean }) => void;
  isPipExpanded?: boolean;
  onTogglePip?: () => void;
}

interface AnimatedAnswerButtonProps {
  option: string;
  answerIndex: number;
  isSelected: boolean;
  isCorrect: boolean;
  isAnswered: boolean;
  showExplanation: boolean;
  explanation: string;
  onClick: () => void;
}

const AnimatedAnswerButton: React.FC<AnimatedAnswerButtonProps> = ({
  option,
  answerIndex,
  isSelected,
  isCorrect,
  isAnswered,
  showExplanation,
  explanation,
  onClick
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = React.useState(56);

  // Measure content height when explanation shows
  React.useEffect(() => {
    if (showExplanation && contentRef.current) {
      // Small delay to ensure content is fully rendered
      const timer = setTimeout(() => {
        if (contentRef.current) {
          const contentHeight = contentRef.current.scrollHeight;
          // Add button padding (p-4 = 16px top + 16px bottom = 32px total)
          setContentHeight(contentHeight + 32);
        }
      }, 10);
      return () => clearTimeout(timer);
    } else {
      setContentHeight(56);
    }
  }, [showExplanation]);

  const springProps = useSpring({
    height: contentHeight,
    backgroundColor: isAnswered 
      ? (isCorrect ? '#f7fef7' : (isSelected && !isCorrect ? '#fef7f7' : '#ffffff'))
      : '#ffffff',
    borderColor: isAnswered
      ? (isCorrect ? '#afdbaf' : (isSelected && !isCorrect ? '#ffc6c6' : '#e5e7eb'))
      : '#e5e7eb',
    config: config.default
  });

  let buttonClass = "w-full p-4 text-left cursor-pointer overflow-hidden ";
  buttonClass += "rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border ";
  
  if (!isAnswered) {
    buttonClass += "hover:border-gray-300 hover:bg-gray-50";
  }

  return (
    <animated.button
      onClick={onClick}
      disabled={isAnswered}
      className={buttonClass}
      style={springProps}
    >
      <div ref={contentRef}>
        <div className="flex items-center text-gray-900">
          {option}
        </div>
        
        {showExplanation && (
          <div className="pt-3">
            <div className={`text-sm font-medium mb-2`} style={{ color: isCorrect ? '#3fa03c' : '#e64848' }}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </div>
            <div className="text-sm leading-relaxed text-gray-700">
              {explanation}
            </div>
          </div>
        )}
      </div>
    </animated.button>
  );
};

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuestionState {
  selectedAnswer: number | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
}

interface QuizState {
  score: number;
  questionStates: QuestionState[];
  isComplete: boolean;
}

export const QuizExperience: React.FC<QuizExperienceProps> = ({ character, scene, onRefReady, isPipExpanded, onTogglePip }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasBegun, setHasBegun] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);



  const [quizState, setQuizState] = useState<QuizState>({
    score: 0,
    questionStates: [],
    isComplete: false
  });

  const beginQuiz = useCallback(async () => {
    setHasBegun(true);
    setLoading(true);
    
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          sceneId: scene.id,
          sceneTitle: scene.title,
          sceneDescription: scene.description
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }
      
      const { questions } = await response.json();
      const generatedQuestions = questions;
      
      setQuestions(generatedQuestions);
      
      // Initialize question states
      setQuizState({
        score: 0,
        questionStates: generatedQuestions.map(() => ({
          selectedAnswer: null,
          isAnswered: false,
          isCorrect: null
        })),
        isComplete: false
      });
    } catch (error) {
      console.error('Failed to generate quiz questions:', error);
      // Show error state or retry
      setHasBegun(false);
      alert('Failed to generate quiz questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [character.id, scene.id, scene.title, scene.description]);

  // Expose beginQuiz function and state to parent component
  useEffect(() => {
    if (onRefReady) {
      onRefReady({ beginQuiz, hasBegun, loading });
    }
  }, [onRefReady, beginQuiz, hasBegun, loading]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    // Don't allow changing answer if already answered
    if (quizState.questionStates[questionIndex]?.isAnswered) return;

    const question = questions[questionIndex];
    const isCorrect = answerIndex === question.correctAnswer;

    setQuizState(prev => {
      const newQuestionStates = [...prev.questionStates];
      newQuestionStates[questionIndex] = {
        selectedAnswer: answerIndex,
        isAnswered: true,
        isCorrect: isCorrect
      };

      const newScore = isCorrect ? prev.score + 1 : prev.score;
      const allAnswered = newQuestionStates.every(state => state.isAnswered);

      return {
        ...prev,
        score: newScore,
        questionStates: newQuestionStates,
        isComplete: allAnswered
      };
    });
  };

  const handleRestartQuiz = () => {
    setHasBegun(false);
    setQuestions([]);
    setQuizState({
      score: 0,
      questionStates: [],
      isComplete: false
    });
    setActiveQuestionIndex(0);
  };

  const getNextUnansweredIndex = () => {
    return quizState.questionStates.findIndex(state => !state.isAnswered);
  };

  // Show empty state if quiz hasn't begun
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
            onClick={beginQuiz}
            className="text-sm text-gray-500 underline hover:text-gray-700 transition-colors cursor-pointer"
          >
            Begin Quiz
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-start pt-6 pb-6">
        <div className="w-full max-w-md">
          {/* Question number skeleton */}
          <div className="mb-6">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
          </div>
          
          {/* Question text skeleton - entire block */}
          <div className="h-16 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
          
          {/* Answer options skeleton - entire shimmer blocks */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
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

  if (questions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No questions available for this quiz.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const answeredCount = quizState.questionStates.filter(state => state.isAnswered).length;
  const nextUnansweredIndex = getNextUnansweredIndex();

  if (quizState.isComplete) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div style={{ marginBottom: '20px' }}>
            <h1 className="font-light" style={{ fontSize: '50px', marginBottom: '8px' }}>{quizState.score}/{questions.length}</h1>
            <p className="text-sm text-gray-600 font-serif mb-2">
              Expertise in
            </p>
            <h2 className="text-xl text-gray-700">
              {scene.title}
            </h2>
          </div>

          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => {
                // TODO: Implement share functionality
                navigator.share?.({
                  title: `Quiz Results: ${scene.title}`,
                  text: `I scored ${quizState.score}/${questions.length} on the ${scene.title} quiz with ${character.name}!`,
                  url: window.location.href
                }).catch(() => {
                  // Fallback: copy to clipboard
                  navigator.clipboard?.writeText(`I scored ${quizState.score}/${questions.length} on the ${scene.title} quiz with ${character.name}! ${window.location.href}`);
                });
              }}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <img src="/share.svg" alt="" className="w-4 h-4 filter brightness-0 invert" />
              Share
            </button>
            <button 
              onClick={handleRestartQuiz}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <img src="/restart.svg" alt="" className="w-4 h-4" />
              Restart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Scrolling Questions */}
      <div className="flex-1 overflow-y-auto">
        <div className="w-full min-h-full">
          {questions.map((question, questionIndex) => {
            const questionState = quizState.questionStates[questionIndex];
            const shouldShow = questionIndex === activeQuestionIndex;
            
            if (!shouldShow) return null;

            const isActive = questionIndex === activeQuestionIndex;
            const fadeClass = isTransitioning ? "opacity-0" : "opacity-100";
            const containerClass = isActive 
              ? `w-full min-h-full flex flex-col justify-center transition-opacity duration-200 ${fadeClass}` 
              : "w-full";

            return (
              <div key={question.id} data-question-index={questionIndex} className={containerClass}>
                {/* Question Header */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">{questionIndex + 1}/{questions.length}</p>
                  <h2 className="text-lg font-medium leading-relaxed">
                    {question.question}
                  </h2>
                </div>

                {/* Answer Options */}
                <div className="space-y-3 mb-4">
                  {question.options.map((option, answerIndex) => {
                    const isSelected = questionState?.selectedAnswer === answerIndex;
                    const isCorrect = answerIndex === question.correctAnswer;
                    const isAnswered = questionState?.isAnswered;
                    const showExplanation = isAnswered && isSelected;

                    return (
                      <AnimatedAnswerButton
                        key={answerIndex}
                        option={option}
                        answerIndex={answerIndex}
                        isSelected={isSelected}
                        isCorrect={isCorrect}
                        isAnswered={isAnswered}
                        showExplanation={showExplanation}
                        explanation={question.explanation}
                        onClick={() => handleAnswerSelect(questionIndex, answerIndex)}
                      />
                    );
                  })}
                </div>


                {/* Next Button */}
                {questionState?.isAnswered && questionIndex < questions.length - 1 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        const nextIndex = questionIndex + 1;
                        
                        // Start fade out
                        setIsTransitioning(true);
                        
                        // After fade out completes, change question and fade in
                        setTimeout(() => {
                          setActiveQuestionIndex(nextIndex);
                          
                          // Scroll to top and fade in
                          setTimeout(() => {
                            const container = document.querySelector('.overflow-y-auto');
                            if (container) {
                              container.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                            setIsTransitioning(false);
                          }, 50);
                        }, 200);
                      }}
                      className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Message Input Composer - positioned at bottom, unaffected by quiz steps */}
      <Composer
        placeholder={`Talk to ${character?.name.split(' ')[0] || 'character'}`}
        disabled={true}
        isPipExpanded={isPipExpanded}
        onTogglePip={onTogglePip}
      />
    </div>
  );
};
