"use client";

import React, { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useSpring, animated, useTransition } from '@react-spring/web';
import Image from 'next/image';
import VoiceComposer from './VoiceComposer';
import CharacterVideo from './CharacterVideo';
import { Character, Scene } from '@/lib/types';

export type Message = { 
  role: "assistant" | "user"; 
  content: string; 
  streaming?: boolean; 
  id?: string;
  audioUrl?: string;
  ttsError?: string;
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

export interface VoiceChatRef {
  stopAudio: () => void;
}

interface VoiceChatProps {
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
  // Voice settings
  silenceThreshold?: number;
  autoPlay?: boolean;
}

export const VoiceChat = forwardRef<VoiceChatRef, VoiceChatProps>(({
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
  silenceThreshold = 2000,
  autoPlay = true
}, ref) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [shouldStartListening, setShouldStartListening] = useState(false);
  const [playedMessages, setPlayedMessages] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const playAudio = useCallback(async (audioUrl: string, messageId: string, forcePlay: boolean = false) => {
    // Don't auto-play if muted (unless forced by user click)
    if (isMuted && !forcePlay) {
      console.log('🔇 VoiceChat: Audio muted, skipping auto-play');
      return;
    }

    try {
      console.log('🔊 VoiceChat: Preparing audio playback for message:', messageId);
      
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setCurrentlyPlaying(messageId);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Set initial mute state based on current mute setting
      audio.muted = isMuted;
      
      // Trigger microphone to start listening when audio starts
      console.log('🔊 VoiceChat: Setting shouldStartListening to true');
      setShouldStartListening(true);

      audio.onended = () => {
        console.log('🔊 VoiceChat: Audio playback completed for message:', messageId);
        setCurrentlyPlaying(null);
        audioRef.current = null;
        // Reset the listening trigger
        console.log('🔊 VoiceChat: Setting shouldStartListening to false (audio ended)');
        setShouldStartListening(false);
      };

      audio.onerror = (error) => {
        console.error('🔊 VoiceChat: Error playing audio for message:', messageId, error);
        setCurrentlyPlaying(null);
        audioRef.current = null;
        // Reset the listening trigger on error
        console.log('🔊 VoiceChat: Setting shouldStartListening to false (audio error)');
        setShouldStartListening(false);
      };

      await audio.play();
      console.log('🔊 VoiceChat: Audio playback started successfully for message:', messageId);
    } catch (error) {
      console.error('🔊 VoiceChat: Failed to start audio playback:', error);
      setCurrentlyPlaying(null);
      // Reset the listening trigger on error
      console.log('🔊 VoiceChat: Setting shouldStartListening to false (playback error)');
      setShouldStartListening(false);
    }
  }, [isMuted]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setCurrentlyPlaying(null);
    }
  }, []);

  const handleUserSpeaking = useCallback(() => {
    if (currentlyPlaying && audioRef.current) {
      console.log('🗣️ VoiceChat: User interruption detected - stopping AI audio');
      stopAudio();
      // Reset listening trigger since audio was interrupted
      setShouldStartListening(false);
    }
  }, [currentlyPlaying, stopAudio]);

  // Expose stopAudio function to parent components
  useImperativeHandle(ref, () => ({
    stopAudio
  }), [stopAudio]);

  // Character video fade-in transition
  const videoTransition = useTransition(hasBegun, {
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(20px)' },
    config: { tension: 280, friction: 30 }
  });

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    // Update the audio element's muted property without stopping playback
    if (audioRef.current) {
      audioRef.current.muted = newMuted;
      console.log('🔇 Audio', newMuted ? 'muted' : 'unmuted', '- playback continues');
    } else {
      console.log('🔇 Audio mute state changed:', newMuted, '(no active audio)');
    }
  }, [isMuted]);

  // Auto-play new messages with audio
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    
    if (latestMessage && 
        latestMessage.role === 'assistant' && 
        latestMessage.audioUrl && 
        !currentlyPlaying &&
        autoPlay) {
      
      // Check if this message has an ID and we haven't played it yet
      const messageId = ('id' in latestMessage && latestMessage.id) ? latestMessage.id : `msg-${Date.now()}`;
      
      // Only play if we haven't played this message before and audioUrl exists
      if (latestMessage.audioUrl && !playedMessages.has(messageId)) {
        console.log('🎵 VoiceChat: Auto-playing new message with audio:', messageId);
        setPlayedMessages(prev => new Set([...prev, messageId]));
        playAudio(latestMessage.audioUrl, messageId);
      } else {
        console.log('⚠️ VoiceChat: Message already played, skipping:', messageId);
      }
    }
  }, [messages, currentlyPlaying, autoPlay, playAudio, playedMessages]);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
    console.log('📤 VoiceChat: Received transcribed message for LLM processing');
    console.log('📝 VoiceChat: Message content:', messageContent.trim());
    
    const userMessage = { role: "user" as const, content: messageContent.trim() };
    
    // Add user message immediately
    const newMessages = [...messages, userMessage];
    onMessagesChange(newMessages);
    
    // Clear any previous TTS errors
    setTtsError(null);
    
    // Start new streaming message
    const messageId = `msg-${Date.now()}`;
    onLoadingChange(true);
    
    console.log('🤖 VoiceChat: Sending message to LLM API');
    
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
      
      if (!res.ok) {
        console.error('🤖 VoiceChat: LLM API error:', data.error);
        throw new Error(data.error || 'Chat API error');
      }
      
      console.log('🤖 VoiceChat: LLM response received');
      console.log('📝 VoiceChat: LLM response text:', data.message);
      
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

      // Generate TTS for the response in parallel
      console.log('🎵 VoiceChat: Sending LLM response to Play.ai TTS');
      const ttsPromise = (async () => {
        try {
          const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              text: data.message,
              characterId: context.character.id
            })
          });
          
          const ttsData = await ttsRes.json();
          
          if (!ttsRes.ok) {
            console.error('🎵 VoiceChat: TTS API error:', ttsData.error);
            throw new Error(ttsData.error || 'TTS API error');
          }
          
          console.log('🎵 VoiceChat: TTS audio received from Play.ai');
          console.log('🎵 VoiceChat: Audio format:', ttsData.format);
          console.log('🎵 VoiceChat: Audio URL length:', ttsData.audioUrl?.length || 0, 'characters');
          
          return ttsData;
        } catch (error) {
          console.error('🎵 VoiceChat: TTS Error:', error);
          setTtsError(error instanceof Error ? error.message : 'TTS failed');
          return null;
        }
      })();

      // Wait for TTS to complete
      const ttsData = await ttsPromise;
      
      if (ttsData?.audioUrl) {
        // Update message with audio URL
        const messageWithAudio: Message = {
          role: "assistant",
          content: data.message,
          streaming: true,
          id: messageId,
          audioUrl: ttsData.audioUrl
        };
        
        onMessagesChange([...newMessages, messageWithAudio]);
        
        // Auto-play the audio if enabled
        if (autoPlay) {
          console.log('🔊 VoiceChat: Starting audio playback');
          await playAudio(ttsData.audioUrl, messageId);
        } else {
          console.log('🔇 VoiceChat: Auto-play disabled, audio ready for manual play');
        }
      }
      
      // After a delay, mark as complete (streaming animation will finish)
      setTimeout(() => {
        const finalMessages = [...newMessages];
        const messageIndex = finalMessages.findIndex(m => 'id' in m && m.id === messageId);
        
        if (messageIndex !== -1) {
          finalMessages[messageIndex] = {
            role: "assistant",
            content: data.message,
            streaming: false,
            id: messageId,
            audioUrl: ttsData?.audioUrl,
            ttsError: ttsData ? undefined : (ttsError || 'TTS failed')
          };
        } else {
          // Message not found, add it
          finalMessages.push({
            role: "assistant",
            content: data.message,
            streaming: false,
            id: messageId,
            audioUrl: ttsData?.audioUrl,
            ttsError: ttsData ? undefined : (ttsError || 'TTS failed')
          });
        }
        
        onMessagesChange(finalMessages);
      }, data.message.length * 15 + 200); // 15ms per character + 200ms buffer
    } catch (error) {
      console.error('Chat Error:', error);
      
      // Add error message
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error processing your message.",
        streaming: false,
        id: messageId,
        ttsError: "Chat failed"
      };
      
      onMessagesChange([...newMessages, errorMessage]);
    } finally {
      onLoadingChange(false);
    }
  };

  const handleVoiceMessage = (transcript: string) => {
    if (composerMode === 'sheet' && onSheetOpen) {
      // In sheet mode, open the sheet with the transcript
      onSheetOpen(transcript);
    } else {
      // Normal mode, send the message
      sendMessage(transcript);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Character Video - fade in after user begins */}
      {videoTransition((style, item) => item ? (
        <animated.div style={style} className="mb-4">
          <CharacterVideo 
            character={context.character} 
            fullWidth={true}
            height="aspect-square"
            className="flex-shrink-0"
          />
        </animated.div>
      ) : null)}

      {/* TTS Error indicator */}
      {ttsError && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700 text-sm">
            <Image src="/error.svg" alt="Warning" width={14} height={14} />
            <span>Voice synthesis: {ttsError}</span>
          </div>
        </div>
      )}

      {/* Chat Messages - Simplified without scroll behavior */}
      <div className={`flex-1 flex flex-col pt-2 relative ${composerMode === 'sheet' ? 'min-h-0' : ''}`}>
        {messages.length === 0 && !loading && composerMode !== 'sheet' ? (
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
              Tap the microphone or{' '}
              {onBegin ? (
                <button 
                  onClick={() => {
                    console.log('🟢 VoiceChat: Begin button clicked');
                    onBegin();
                  }}
                  className="text-gray-500 underline hover:text-gray-700 transition-colors cursor-pointer"
                >
                  begin
                </button>
              ) : (
                `start talking to ${context.character.name.split(' ')[0]}`
              )}
            </p>
          </div>
        ) : messages.length === 0 && loading ? (
          /* Loading state when no messages yet */
          <div className="space-y-3">
            <div className="ml-0 flex items-center">
              <AnimatedLoadingStar />
            </div>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto flex-1">
             {messages.map((m, i) => {
               // Only render messages that have content (or user messages which should always show)
               if (m.role === "assistant" && !m.content) {
                 return null;
               }
               
               return (
                 <div
                   key={m.id || i}
                   className={m.role === "assistant" ? "ml-0 max-w-[80%] rounded-2xl bg-gray-100 p-3 text-sm text-gray-900 relative" : "ml-auto rounded-2xl bg-blue-500 text-white p-3 text-sm"}
                   style={m.role === "user" ? { width: "fit-content", maxWidth: "80%" } : {}}
                 >
                   {m.role === "user" ? (
                     m.content
                   ) : (
                     <>
                       {/* Voice-first: Show content without streaming animation */}
                       {m.content}
                       
                       {/* Audio controls for assistant messages */}
                       <div className="absolute top-2 right-2 flex gap-1">
                         {/* TTS Error indicator */}
                         {m.ttsError && (
                           <div 
                             className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center"
                             title={`TTS Error: ${m.ttsError}`}
                           >
                             <Image
                               src="/error.svg"
                               alt="TTS Error"
                               width={10}
                               height={10}
                               className="text-yellow-600"
                             />
                           </div>
                         )}
                         
                         {/* Audio play button */}
                         {m.audioUrl && (
                           <button
                             onClick={() => playAudio(m.audioUrl!, m.id!, true)} // Force play on user click
                             disabled={currentlyPlaying === m.id}
                             className="w-6 h-6 rounded-full hover:bg-gray-200 flex items-center justify-center transition-colors"
                             title={currentlyPlaying === m.id ? "Playing..." : "Play audio"}
                           >
                             <Image
                               src="/wave.svg"
                               alt="Play audio"
                               width={12}
                               height={12}
                               className={currentlyPlaying === m.id ? "animate-pulse text-blue-600" : ""}
                             />
                           </button>
                         )}
                       </div>
                     </>
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

      {/* Voice Composer */}
      {showComposer && hasBegun && (
        <div className="pb-2">
          <VoiceComposer
            onMessage={handleVoiceMessage}
            disabled={loading}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            silenceThreshold={silenceThreshold}
            autoStartListening={shouldStartListening}
            onUserSpeaking={handleUserSpeaking}
          />
        </div>
      )}
    </div>
  );
});

VoiceChat.displayName = 'VoiceChat';

export default VoiceChat;
