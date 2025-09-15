"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSpring, animated, useTransition } from '@react-spring/web';
import Image from 'next/image';
import { StreamingText } from './StreamingText';
import Composer from './Composer';
import { Character, Scene } from '@/lib/types';

export type Message = { 
  role: "assistant" | "user"; 
  content: string; 
  streaming?: boolean; 
  id?: string 
};

export interface ChatContext {
  character: Character;
  scene: Scene;
  quizQuestion?: {
    id: string;
    question: string;
    options: string[];
  };
}

interface ChatComponentProps {
  context: ChatContext;
  messages: Message[];
  onMessagesChange: (messages: Message[]) => void;
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  className?: string;
  showComposer?: boolean;
  composerMode?: 'normal' | 'sheet';
  onSheetOpen?: (initialMessage: string) => void;
  hasBegun?: boolean;
  onBegin?: () => void;
  // PIP control props
  isPipExpanded?: boolean;
  onTogglePip?: () => void;
}

export const ChatComponent: React.FC<ChatComponentProps> = ({
  context,
  messages,
  onMessagesChange,
  loading,
  onLoadingChange,
  className = "",
  showComposer = true,
  composerMode = 'normal',
  onSheetOpen,
  hasBegun = true,
  onBegin,
  isPipExpanded = false,
  onTogglePip
}) => {
  console.log('🟢 ChatComponent: hasBegun=', hasBegun, 'hasOnBegin=', !!onBegin);
  
  const [input, setInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [wasAtBottom, setWasAtBottom] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Animated loading star component
  const AnimatedLoadingStar = () => {
    const pulseAnimation = useSpring({
      from: { scale: 1, opacity: 0.6 },
      to: { scale: 1.2, opacity: 1 },
      config: { duration: 800 },
      loop: { reverse: true }
    });

    return (
      <animated.div style={pulseAnimation}>
        <Image
          src="/star.svg"
          alt="Loading"
          width={16}
          height={16}
        />
      </animated.div>
    );
  };

  // React Spring animation for scroll button
  const scrollButtonTransition = useTransition(showScrollButton, {
    from: { opacity: 0, transform: 'translateY(10px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(10px)' },
    config: { tension: 500, friction: 20 }
  });

  // Scroll handling
  const forceScrollToBottom = useCallback(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, []);

  const scrollToBottomSmooth = useCallback(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({
        top: scrollerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleContentHeightChange = useCallback(() => {
    if (wasAtBottom) {
      setTimeout(() => forceScrollToBottom(), 50);
    }
  }, [wasAtBottom, forceScrollToBottom]);

  // Scroll detection
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scroller;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const shouldShowButton = scrollTop < scrollHeight - clientHeight - 100;
      
      setWasAtBottom(isAtBottom);
      setShowScrollButton(shouldShowButton && messages.length > 0);
    };

    scroller.addEventListener('scroll', handleScroll);
    return () => scroller.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => forceScrollToBottom(), 200);
    }
  }, [messages.length, forceScrollToBottom]);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
    const userMessage = { role: "user" as const, content: messageContent.trim() };
    
    // Add user message immediately
    const newMessages = [...messages, userMessage];
    onMessagesChange(newMessages);
    
    // Ensure we scroll to show the new user message
    setTimeout(() => {
      if (wasAtBottom) {
        forceScrollToBottom();
      }
    }, 50);
    
    // Start new streaming message
    const messageId = `msg-${Date.now()}`;
    onLoadingChange(true);
    
    try {
      // Build context for API call
      const apiBody = {
        characterId: context.character.id,
        sceneId: context.scene.id,
        messages: newMessages,
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
        content: "", 
        streaming: true, 
        id: messageId 
      };
      onMessagesChange([...newMessages, streamingMsg]);
      
      // Set the full content immediately and let StreamingText handle the animation
      onMessagesChange([
        ...newMessages,
        { role: "assistant", content: data.message, streaming: true, id: messageId }
      ]);
      
      // After a delay, mark as complete (streaming animation will finish)
      setTimeout(() => {
        onMessagesChange([
          ...newMessages,
          { role: "assistant", content: data.message, streaming: false, id: messageId }
        ]);
      }, data.message.length * 15 + 200); // 15ms per character + 200ms buffer
    } finally {
      onLoadingChange(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (composerMode === 'sheet' && onSheetOpen) {
      // In sheet mode, open the sheet with the input
      onSheetOpen(input);
      setInput("");
    } else {
      // Normal mode, send the message
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Chat Messages */}
      <div 
        ref={scrollerRef} 
        className="flex-1 flex flex-col overflow-y-auto pt-2 relative scrollbar-hide"
        style={{ 
          overscrollBehavior: 'contain',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none' /* IE and Edge */
        }}
      >
        {messages.length === 0 && !loading ? (
          /* Empty state text */
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Image
              src="/star.svg"
              alt="Star"
              width={20}
              height={20}
              className="text-gray-400"
              style={{ opacity: 0.5 }}
            />
            <p className="text-sm text-gray-500 text-center">
              Send a message or{' '}
              {onBegin ? (
                <button 
                  onClick={() => {
                    console.log('🟢 ChatComponent: Begin button clicked');
                    onBegin();
                  }}
                  className="text-gray-500 underline hover:text-gray-700 transition-colors cursor-pointer"
                >
                  begin
                </button>
              ) : (
                `start a conversation with ${context.character.name.split(' ')[0]}`
              )}
            </p>
          </div>
        ) : messages.length === 0 && loading ? (
          /* Loading state when no messages yet - positioned where first message will appear */
          <div className="space-y-3">
            <div className="ml-0 flex items-center">
              <AnimatedLoadingStar />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
             {messages.map((m, i) => {
               // Only render messages that have content (or user messages which should always show)
               if (m.role === "assistant" && !m.content) {
                 return null;
               }
               
               return (
                 <div
                   key={m.id || i}
                   className={m.role === "assistant" ? "ml-0 max-w-[80%] rounded-2xl bg-gray-100 p-3 text-sm text-gray-900" : "ml-auto rounded-2xl bg-blue-500 text-white p-3 text-sm"}
                   style={m.role === "user" ? { width: "fit-content", maxWidth: "80%" } : {}}
                 >
                   {m.role === "user" ? (
                     m.content
                   ) : (
                     <StreamingText 
                       fullText={m.content} 
                       isStreaming={m.streaming}
                       delay={15}
                       onHeightChange={handleContentHeightChange}
                     />
                   )}
                 </div>
               );
             })}
            
             {/* Loading Indicator - Pulsing Star - show when loading and last message is empty and streaming */}
             {loading && messages.length > 0 && messages[messages.length - 1]?.streaming && !messages[messages.length - 1]?.content && (
               <div className="ml-0 flex items-center">
                 <AnimatedLoadingStar />
               </div>
             )}
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {scrollButtonTransition((style, item) =>
        item ? (
          <animated.button
            style={{
              ...style,
              position: 'absolute',
              left: '50%',
              width: '36px',
              height: '36px',
              marginLeft: '-18px',
              bottom: (showComposer && hasBegun) ? '80px' : '20px',
              zIndex: 20,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => {
              scrollToBottomSmooth();
              setShowScrollButton(false);
              setWasAtBottom(true);
            }}
             className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-150 cursor-pointer"
            aria-label="Scroll to bottom"
          >
            <Image
              src="/arrow-down.svg"
              alt="Scroll down"
              width={20}
              height={20}
              className="text-gray-600"
            />
          </animated.button>
        ) : null
      )}

      {/* Composer */}
      {showComposer && hasBegun && (
        <div className="pb-2">
          <Composer
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            placeholder={`Talk to ${context.character.name.split(' ')[0] || 'character'}`}
            disabled={loading}
            mode={composerMode}
            isPipExpanded={isPipExpanded}
            onTogglePip={onTogglePip}
          />
        </div>
      )}
    </div>
  );
};

export default ChatComponent;
