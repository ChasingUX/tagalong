"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useTransition, animated } from '@react-spring/web';
import Image from 'next/image';
import VoiceChat, { type Message, type ChatContext, type VoiceChatRef } from './VoiceChat';

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  context: ChatContext;
  initialMessage?: string;
  onBegin?: () => void;
}

export const ChatSheet: React.FC<ChatSheetProps> = ({
  isOpen,
  onClose,
  context,
  initialMessage,
  onBegin
}) => {
  console.log('🔥 ChatSheet: Component rendered, isOpen:', isOpen);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const voiceChatRef = useRef<VoiceChatRef>(null);

  // Handle close with audio cleanup
  const handleClose = () => {
    console.log('🔇 ChatSheet: Closing sheet and stopping audio');
    
    // Stop VoiceChat audio using ref
    if (voiceChatRef.current) {
      console.log('🔇 ChatSheet: Stopping VoiceChat audio via ref');
      voiceChatRef.current.stopAudio();
    }
    
    // Call the original onClose
    onClose();
  };

  const transition = useTransition(isOpen, {
    from: { opacity: 0, height: '0%' },
    enter: { opacity: 1, height: '93%' },
    leave: { opacity: 0, height: '0%' },
    config: { tension: 280, friction: 30 }
  });

  // Handle initial message when sheet opens
  useEffect(() => {
    if (isOpen) {
      // For quiz context, generate automatic greeting
      if (context.quizQuestion && !initialMessage) {
        const generateQuizGreeting = async () => {
          setLoading(true);
          const messageId = `quiz-greeting-${Date.now()}`;
          
          try {
            // Create a greeting message about the quiz question
            const greetingText = `So you want to discuss "${context.quizQuestion?.question}"? What's on your mind?`;
            
            console.log('🎯 ChatSheet: Generating quiz greeting:', greetingText);
            
            // Add the AI greeting message
            const aiMessage: Message = { 
              role: "assistant", 
              content: greetingText,
              id: messageId
            };
            
            setMessages([aiMessage]);

            // Generate TTS for the greeting
            console.log('🎵 ChatSheet: Sending quiz greeting to Play.ai TTS');
            try {
              const ttsRes = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                  text: greetingText,
                  characterId: context.character.id
                })
              });
              
              if (ttsRes.ok) {
                const ttsData = await ttsRes.json();
                
                console.log('🎵 ChatSheet: TTS audio received for quiz greeting');
                
                // Update message with audio URL
                const messageWithAudio: Message = {
                  role: "assistant",
                  content: greetingText,
                  id: messageId,
                  audioUrl: ttsData.audioUrl
                };
                
                setMessages([messageWithAudio]);
              }
            } catch (ttsError) {
              console.error('🎵 ChatSheet: TTS Error for quiz greeting:', ttsError);
            }
          } finally {
            setLoading(false);
          }
        };
        
        // Small delay to let the sheet animate in first
        setTimeout(generateQuizGreeting, 300);
        return; // Exit early for quiz greeting
      }
      
      // Handle regular initial message
      if (initialMessage && initialMessage.trim()) {
      // Add the initial message and trigger AI response
      const userMessage: Message = { 
        role: "user", 
        content: initialMessage.trim(),
        id: `initial-${Date.now()}`
      };
      
      setMessages([userMessage]);
      
      // Trigger AI response
      const sendInitialMessage = async () => {
        setLoading(true);
        const messageId = `msg-${Date.now()}`;
        
        try {
          // Build context for API call
          const apiBody = {
            characterId: context.character.id,
            sceneId: context.scene.id,
            messages: [userMessage],
            quizContext: context.quizQuestion ? {
              questionId: context.quizQuestion.id,
              question: context.quizQuestion.question,
              options: context.quizQuestion.options
            } : undefined
          };

          console.log('🤖 ChatSheet: Sending initial message to LLM API');
          const res = await fetch(`/api/chat`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(apiBody),
          });
          const data = await res.json();
          
          console.log('🤖 ChatSheet: LLM response received for initial message');
          console.log('📝 ChatSheet: LLM response text:', data.message);
          
          // Add streaming assistant message
          const streamingMsg: Message = { 
            role: "assistant", 
            content: data.message, 
            streaming: true, 
            id: messageId 
          };
          setMessages([userMessage, streamingMsg]);

          // Generate TTS for the response
          console.log('🎵 ChatSheet: Sending LLM response to Play.ai TTS');
          try {
            const ttsRes = await fetch('/api/tts', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                text: data.message,
                characterId: context.character.id
              })
            });
            
            if (ttsRes.ok) {
              const ttsData = await ttsRes.json();
              
              console.log('🎵 ChatSheet: TTS audio received from Play.ai');
              
              // Update message with audio URL and auto-play
              const messageWithAudio: Message = {
                role: "assistant",
                content: data.message,
                streaming: true,
                id: messageId,
                audioUrl: ttsData.audioUrl
              };
              
              setMessages([userMessage, messageWithAudio]);
              
              // Auto-play the audio
              if (ttsData.audioUrl) {
                console.log('🔊 ChatSheet: Starting audio playback for initial message');
                const audio = new Audio(ttsData.audioUrl);
                audio.play().catch((error) => {
                  console.error('🔊 ChatSheet: Failed to play initial message audio:', error);
                });
              }
            }
          } catch (ttsError) {
            console.error('🎵 ChatSheet: TTS Error:', ttsError);
          }
          
          // After a delay, mark as complete
          setTimeout(() => {
            setMessages([
              userMessage,
              { role: "assistant", content: data.message, streaming: false, id: messageId }
            ]);
          }, data.message.length * 15 + 200);
        } finally {
          setLoading(false);
        }
      };
      
      // Small delay to let the sheet animate in first
      setTimeout(sendInitialMessage, 300);
      }
    }
  }, [isOpen, initialMessage, context]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
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

  // Reset messages when sheet closes
  useEffect(() => {
    if (!isOpen) {
      // Clear messages when sheet closes (they don't persist across sessions)
      setMessages([]);
      setLoading(false);
    }
  }, [isOpen]);

  return transition((style, item) => item ? (
    <>
      {/* Scrim - clicking doesn't close the sheet */}
      <animated.div 
        style={{ opacity: style.opacity }}
        className="fixed inset-0 z-40 bg-black/20"
      />

      {/* Sheet */}
      <animated.div 
        style={{ 
          height: style.height,
          borderTopLeftRadius: '24px', 
          borderTopRightRadius: '24px'
        }}
        className="fixed inset-x-0 bottom-0 z-50 bg-white shadow-2xl"
      >
        <div className="mx-auto max-w-md flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center p-4 relative">
            <div className="text-center">
              <h2 className="text-sm font-medium text-gray-900">
                Chat with {context.character.name.split(' ')[0]}
              </h2>
              {context.quizQuestion && (
                <p className="text-xs text-gray-500">
                  About: {context.scene.title}
                </p>
              )}
            </div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <Image
                src="/close.svg"
                alt="Close"
                width={16}
                height={16}
                className="text-gray-600"
              />
            </button>
          </div>

          {/* Voice Chat Content */}
          <div className="flex-1 px-5 pb-6 flex flex-col min-h-0">
            <VoiceChat
              ref={voiceChatRef}
              context={context}
              messages={messages}
              onMessagesChange={setMessages}
              loading={loading}
              onLoadingChange={setLoading}
              className="flex-1 min-h-0"
              showComposer={true}
              composerMode="sheet"
              hasBegun={true}
              onBegin={() => {
                console.log('🔥 ChatSheet: Begin button clicked');
                console.log('🔥 ChatSheet: onBegin function exists?', !!onBegin);
                if (onBegin) {
                  console.log('🔥 ChatSheet: Calling onBegin function');
                  onBegin();
                  console.log('🔥 ChatSheet: onBegin called, now closing sheet');
                }
                onClose();
                console.log('🔥 ChatSheet: Sheet closed');
              }}
            />
          </div>
        </div>
      </animated.div>
    </>
  ) : null);
};

export default ChatSheet;
