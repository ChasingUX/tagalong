"use client";

import { useEffect, useRef, useState, use, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSpring, animated, useTransition } from '@react-spring/web';
import MobileShell from "@/components/MobileShell";
import SceneModal from "@/components/SceneModal";
import { StreamingText } from "@/components/StreamingText";
import { QuizExperience } from "@/components/QuizExperience";
import CharacterPIP from "@/components/CharacterPIP";
import Composer from "@/components/Composer";
import { CHARACTERS } from "@/lib/characters";
import type { Scene } from "@/lib/types";
import { getExperienceType } from "@/lib/experiences";
import { type ExperienceType } from "@/lib/types";

type Message = { role: "assistant" | "user"; content: string; streaming?: boolean; id?: string };

interface Params {
  id: string;
  sceneId: string;
}

export default function SceneChatPage({ params }: { params: Promise<Params> }) {
  const { id, sceneId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sceneTitle, setSceneTitle] = useState("Chat");
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasBegun, setHasBegun] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [wasAtBottom, setWasAtBottom] = useState(true);
  const [experienceType, setExperienceType] = useState<ExperienceType>('conversation');
  const [quizRef, setQuizRef] = useState<{ beginQuiz: () => void; hasBegun: boolean; loading: boolean } | null>(null);
  // Check if user has started by seeing if there are user messages
  const hasStarted = messages.some(m => m.role === "user");
  const scrollerRef = useRef<HTMLDivElement>(null);

  const character = CHARACTERS.find((c) => c.id === id);

  // React Spring animation for scroll button
  const scrollButtonTransition = useTransition(showScrollButton, {
    from: { opacity: 0, transform: 'translateY(10px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(10px)' },
    config: { tension: 500, friction: 20 }
  });

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


  const closeModal = () => {
    setShowModal(false);
  };

  const beginScene = async () => {
    setShowModal(false);
    
    // Handle different experience types
    if (experienceType === 'quiz') {
      // For quiz, trigger the quiz's begin function
      if (quizRef?.beginQuiz) {
        quizRef.beginQuiz();
      }
      return;
    }
    
    // For conversation experience
    setHasBegun(true);
    
    // Fetch initial message for the scene with streaming
    const messageId = `msg-${Date.now()}`;
    
    // Add message immediately as streaming to hide empty state
    const streamingMsg: Message = { 
      role: "assistant", 
      content: "", 
      streaming: true, 
      id: messageId 
    };
    setMessages([streamingMsg]);
    setLoading(true);
    
    try {
      const res = await fetch(`/api/chat/seed?characterId=${id}&sceneId=${sceneId}`);
      const data = await res.json();
      
      // Set the full content immediately and let StreamingText handle the animation
      setMessages([{ role: "assistant", content: data.message, streaming: true, id: messageId }]);
      
      // After a delay, mark as complete (streaming animation will finish)
      setTimeout(() => {
        setMessages([{ role: "assistant", content: data.message, streaming: false, id: messageId }]);
      }, data.message.length * 15 + 200); // 15ms per character + 200ms buffer
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // Fetch scene data for hero image and modal
    (async () => {
      try {
        const res = await fetch(`/api/scenes?characterId=${id}&v=${Date.now()}`);
        const scenes = await res.json();
        const scene = scenes.find((s: any) => s.id === sceneId);
        setSceneTitle(scene?.title || "Chat");
        setCurrentScene(scene || null);
        
        // Set the experience type based on the scene
        setExperienceType(getExperienceType(scene));
        
        // Only show modal if the scene hasn't been begun yet
        if (!hasBegun) {
          setTimeout(() => {
            setShowModal(true);
          }, 300);
        }
      } catch (error) {
        console.error('Failed to fetch scene data:', error);
      }
    })();
  }, [id, sceneId, hasBegun]);

  // Smart scrolling logic
  const scrollToBottom = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  // Smooth animated scroll to bottom
  const scrollToBottomSmooth = () => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ 
      top: el.scrollHeight, 
      behavior: 'smooth' 
    });
  };

  const isNearBottom = (el: HTMLElement, threshold = 50) => {
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  // Force scroll to bottom (for new messages)
  const forceScrollToBottom = () => {
    const el = scrollerRef.current;
    if (!el) return;
    
    console.log('Force scroll - current:', el.scrollTop, 'max:', el.scrollHeight); // Debug
    
    // Multiple attempts to ensure scroll happens
    const attemptScroll = () => {
      // Just scroll to the natural bottom - the padding should be included in scrollHeight
      el.scrollTop = el.scrollHeight;
      console.log('Scroll attempt - scrollTop set to scrollHeight:', el.scrollHeight, 'actual:', el.scrollTop); // Debug
    };
    
    attemptScroll();
    setTimeout(attemptScroll, 10);
    setTimeout(attemptScroll, 50);
    setTimeout(attemptScroll, 100);
    setTimeout(attemptScroll, 200);
  };

  // Handle scroll events to show/hide scroll button
  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    
    const nearBottom = isNearBottom(el);
    
    // Only show button if user was at bottom and then scrolled up
    if (wasAtBottom && !nearBottom) {
      setShowScrollButton(true);
      setWasAtBottom(false);
    } else if (nearBottom) {
      setShowScrollButton(false);
      setWasAtBottom(true);
    }
  };

  // Scroll to bottom when content height changes during streaming
  const handleContentHeightChange = useCallback(() => {
    const el = scrollerRef.current;
    if (el && wasAtBottom) {
      // Short delay to let container animation start, then smooth scroll
      setTimeout(() => {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      }, 70); // 70ms - give container animation more time to start
    }
  }, [wasAtBottom]);

  // Auto-scroll only if user hasn't scrolled up (for new messages)
  useEffect(() => {
    const el = scrollerRef.current;
    if (el && wasAtBottom) {
      console.log('Auto-scrolling triggered, messages length:', messages.length); // Debug log
      
      // Initial scroll for new message
      setTimeout(() => forceScrollToBottom(), 10);
    }
  }, [messages, wasAtBottom]);

  // Add scroll listener
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle first message and ensure we're at bottom initially
  useEffect(() => {
    if (messages.length === 1) {
      console.log('First message, forcing scroll to bottom'); // Debug log
      setWasAtBottom(true);
      setTimeout(() => forceScrollToBottom(), 50);
      setTimeout(() => forceScrollToBottom(), 200);
    }
  }, [messages.length]);

  const send = async () => {
    if (!input.trim()) return;
    const prompt = input.trim();
    setInput("");
    const userMessage = { role: "user" as const, content: prompt };
    
    // Add user message immediately
    setMessages((m) => [...m, userMessage]);
    
    // Ensure we scroll to show the new user message
    setTimeout(() => {
      if (wasAtBottom) {
        forceScrollToBottom();
      }
    }, 50);
    
    // Start new streaming message
    const messageId = `msg-${Date.now()}`;
    setLoading(true);
    
    try {
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ characterId: id, sceneId: sceneId, messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      
      // Add streaming assistant message
      const streamingMsg: Message = { 
        role: "assistant", 
        content: "", 
        streaming: true, 
        id: messageId 
      };
      setMessages((m) => [...m, streamingMsg]);
      
      // Set the full content immediately and let StreamingText handle the animation
      setMessages((m) => [
        ...m.slice(0, -1), // All messages except the last one
        { role: "assistant", content: data.message, streaming: true, id: messageId }
      ]);
      
      // After a delay, mark as complete (streaming animation will finish)
      setTimeout(() => {
        setMessages((m) => [
          ...m.slice(0, -1), // All messages except the last one
          { role: "assistant", content: data.message, streaming: false, id: messageId }
        ]);
      }, data.message.length * 15 + 200); // 15ms per character + 200ms buffer
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send();
  };

  if (!character) {
    return (
      <div className="p-6 text-center text-sm text-white/60">
        Character not found.
      </div>
    );
  }

  return (
    <MobileShell title={sceneTitle} subtitle={character.name} currentCharacterId={id} showInfoButton={true} onInfoClick={() => setShowModal(true)}>
      <div className="flex h-full flex-col relative">
        {/* Character PIP - floats above all experience types */}
        {character && <CharacterPIP character={character} experienceType={experienceType} isVisible={experienceType === 'quiz' ? (quizRef?.hasBegun && !quizRef?.loading) : (hasBegun && !loading)} />}
        {/* Render different experience types */}
        {!currentScene ? (
          <div className="flex-1"></div>
        ) : experienceType === 'quiz' ? (
          <QuizExperience 
            character={character} 
            scene={currentScene} 
            onRefReady={setQuizRef}
          />
        ) : (
          <>
            {/* Chat Messages */}
        <div 
          ref={scrollerRef} 
          className="flex-1 flex flex-col overflow-y-auto px-1 pt-2 pb-8 relative scrollbar-hide"
          style={{ 
            overscrollBehavior: 'contain',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none' /* IE and Edge */
          }}
        >
          {messages.length === 0 ? (
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
                <button 
                  onClick={beginScene}
                  className="text-gray-500 underline hover:text-gray-700 transition-colors cursor-pointer"
                >
                  begin
                </button>
              </p>
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

        {/* Scroll to bottom button - positioned relative to the main container */}
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
                bottom: '80px',
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

        {/* Message Input */}
        <Composer
          value={input}
          onChange={setInput}
          onSubmit={onSubmit}
          placeholder={`Talk to ${character?.name.split(' ')[0] || 'character'}`}
          disabled={loading}
        />
          </>
        )}
      </div>

      {/* Scene Modal */}
      <SceneModal
        isOpen={showModal}
        onClose={closeModal}
        onBegin={beginScene}
        scene={currentScene}
        character={character}
        hasStarted={hasStarted}
      />
    </MobileShell>
  );
}


