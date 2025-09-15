"use client";

import React, { useEffect, useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import Image from 'next/image';
import ChatComponent, { type Message, type ChatContext } from './ChatComponent';

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

  const transition = useTransition(isOpen, {
    from: { opacity: 0, transform: 'translateY(100%)' },
    enter: { opacity: 1, transform: 'translateY(30%)' }, // 70% coverage means 30% from top
    leave: { opacity: 0, transform: 'translateY(100%)' },
    config: { tension: 280, friction: 30 }
  });

  // Handle initial message when sheet opens
  useEffect(() => {
    if (isOpen && initialMessage && initialMessage.trim()) {
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

          const res = await fetch(`/api/chat`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(apiBody),
          });
          const data = await res.json();
          
          // Add streaming assistant message
          const streamingMsg: Message = { 
            role: "assistant", 
            content: data.message, 
            streaming: true, 
            id: messageId 
          };
          setMessages([userMessage, streamingMsg]);
          
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
  }, [isOpen, initialMessage, context]);

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
          transform: style.transform,
          borderTopLeftRadius: '24px', 
          borderTopRightRadius: '24px' 
        }}
        className="fixed inset-x-0 top-0 z-50 bg-white shadow-2xl"
      >
        <div className="mx-auto max-w-md h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Image
                  src="/star.svg"
                  alt="Chat"
                  width={16}
                  height={16}
                  className="text-gray-600"
                />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-900">
                  Chat with {context.character.name.split(' ')[0]}
                </h2>
                {context.quizQuestion && (
                  <p className="text-xs text-gray-500">
                    About: {context.scene.title}
                  </p>
                )}
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
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

          {/* Chat Content */}
          <ChatComponent
            context={context}
            messages={messages}
            onMessagesChange={setMessages}
            loading={loading}
            onLoadingChange={setLoading}
            className="flex-1"
            showComposer={true}
            composerMode="normal"
            hasBegun={false}
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
      </animated.div>
    </>
  ) : null);
};

export default ChatSheet;
