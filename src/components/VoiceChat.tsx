"use client";

import React, { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useSpring, animated, useTransition } from '@react-spring/web';
import Image from 'next/image';
import VoiceComposer from './VoiceComposer';
import CharacterVideo from './CharacterVideo';
import { StreamingText } from './StreamingText';
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
    selectedAnswer?: number;
    explanation?: string;
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
  hideCharacterVideo?: boolean;
  hideEmptyState?: boolean;
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
  autoPlay = true,
  hideCharacterVideo = false,
  hideEmptyState = false
}, ref) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [playedMessages, setPlayedMessages] = useState<Set<string>>(new Set());
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const [hasPlayedFirstMessage, setHasPlayedFirstMessage] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [lastSpokenTranscript, setLastSpokenTranscript] = useState<string>('');
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
      <div className="flex items-center justify-center gap-2">
        <animated.div style={pulseAnimation}>
          <Image
            src="/star.svg"
            alt="Loading"
            width={16}
            height={16}
          />
        </animated.div>
        <span 
          className="text-sm"
          style={{
            background: 'linear-gradient(90deg, #9ca3af 0%, #4b5563 50%, #9ca3af 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
            animation: 'shimmer 3s linear infinite'
          }}
        >
          Connecting
        </span>
      </div>
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
      setActiveMessage(messageId); // Set this message as the active one to display
      setStreamingMessage(messageId); // Start streaming when audio begins
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      // Set initial mute state based on current mute setting
      audio.muted = isMuted;
      

      audio.onended = () => {
        console.log('🔊 VoiceChat: Audio playback completed for message:', messageId);
        setCurrentlyPlaying(null);
        setStreamingMessage(null); // Stop streaming when audio ends
        setMicrophoneEnabled(true); // Enable microphone after audio finishes
        audioRef.current = null;
      };

      audio.onerror = (error) => {
        console.error('🔊 VoiceChat: Error playing audio for message:', messageId, error);
        setCurrentlyPlaying(null);
        setStreamingMessage(null); // Stop streaming on error
        setMicrophoneEnabled(true); // Enable microphone after audio error
        audioRef.current = null;
      };

      // Add event listener to hide transcript when audio actually starts playing
      audio.addEventListener('play', () => {
        console.log('🔊 VoiceChat: Audio playback actually started - hiding transcript');
        console.log('🔊 VoiceChat: Current transcript state before hiding:', currentTranscript, 'showTranscript:', showTranscript);
        setShowTranscript(false);
        setLastSpokenTranscript(''); // Clear the persisted transcript
        setIsProcessing(false); // Stop processing animation when audio starts
      });

      await audio.play();
      console.log('🔊 VoiceChat: Audio playback started successfully for message:', messageId);
      
      // Mark that we've played the first message
      if (!hasPlayedFirstMessage) {
        setHasPlayedFirstMessage(true);
      }
    } catch (error) {
      console.error('🔊 VoiceChat: Failed to start audio playback:', error);
      setCurrentlyPlaying(null);
    }
  }, [isMuted]);

  const stopAudio = useCallback(() => {
    console.log('🔇 VoiceChat: Stopping audio playback');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setCurrentlyPlaying(null);
      setStreamingMessage(null); // Stop streaming when audio is stopped
    }
  }, []);



  const handleTranscriptChange = useCallback((transcript: string) => {
    console.log('🎤 VoiceChat: Transcript changed:', transcript, 'length:', transcript.length);
    setCurrentTranscript(transcript);
    
    if (transcript.trim().length > 0) {
      // User is actively speaking - show transcript and remember what they said
      console.log('🎤 VoiceChat: User speaking - showing transcript');
      setLastSpokenTranscript(transcript);
      setShowTranscript(true);
    } else if (lastSpokenTranscript.length > 0) {
      // Transcript was cleared but user had spoken - keep showing the last spoken text
      console.log('🎤 VoiceChat: Transcript cleared, but keeping last spoken text visible:', lastSpokenTranscript);
      setCurrentTranscript(lastSpokenTranscript);
      // Keep showTranscript as true - don't hide until AI speaks
    }
  }, [lastSpokenTranscript]);

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

  // Processing pulse animation
  const processingAnimation = useSpring({
    from: { opacity: 1 },
    to: { opacity: isProcessing ? 0.5 : 1 },
    loop: isProcessing ? { reverse: true } : false,
    config: {
      duration: 800,
    },
    immediate: !isProcessing, // snap back to 1 when stopped
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

  // Monitor showTranscript state changes for debugging
  useEffect(() => {
    console.log('🎤 VoiceChat: showTranscript state changed to:', showTranscript, 'currentTranscript:', currentTranscript);
  }, [showTranscript, currentTranscript]);

  // Monitor microphone state for debugging
  useEffect(() => {
    console.log('🎤 VoiceChat: Microphone enabled state:', microphoneEnabled);
  }, [microphoneEnabled]);

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

  // Stop audio playback when component unmounts (navigation away)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        console.log('🔇 VoiceChat: Stopping audio playback on navigation');
        audioRef.current.pause();
        audioRef.current = null;
        setCurrentlyPlaying(null);
        setStreamingMessage(null);
      }
    };
  }, []);

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
    
    // Disable microphone while processing
    setMicrophoneEnabled(false);
    
    // Start processing animation
    setIsProcessing(true);
    
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
      
      // Add assistant message with content immediately
      const assistantMessage: Message = { 
        role: "assistant", 
        content: data.message, 
        streaming: true, 
        id: messageId 
      };
      onMessagesChange([...newMessages, assistantMessage]);

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
      
      // Audio will be auto-played by the useEffect when the message is updated with audioUrl
      
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
      setIsProcessing(false); // Stop processing animation on completion or error
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
      {!hideCharacterVideo && videoTransition((style, item) => item ? (
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
          <div className="text-yellow-700 text-sm">
            <span>Voice synthesis: {ttsError}</span>
          </div>
        </div>
      )}

      {/* Chat Messages - Simplified without scroll behavior */}
      <div className={`${messages.length === 0 && hideEmptyState ? '' : 'flex-1'} flex flex-col pt-1 relative ${composerMode === 'sheet' ? 'min-h-0' : ''}`} style={{ minHeight: messages.length === 0 && hideEmptyState ? '0px' : '200px' }}>
        {messages.length === 0 && !loading && composerMode !== 'sheet' && !hideEmptyState ? (
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
              {onBegin ? (
                <button 
                  onClick={() => {
                    console.log('🟢 VoiceChat: Begin button clicked');
                    onBegin();
                  }}
                  className="text-gray-500 underline hover:text-gray-700 transition-colors cursor-pointer"
                >
                  Begin {context?.scene?.title || 'Experience'}
                </button>
              ) : (
                `Tap the microphone or start talking to ${context?.character?.name?.split(' ')[0] || 'character'}`
              )}
            </p>
          </div>
        ) : messages.length === 0 && loading ? (
          /* Loading state when no messages yet */
          <div className="flex-1 flex items-center justify-center">
            <AnimatedLoadingStar />
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto flex-1 relative">
             {(() => {
               // Find the active message to display
               const messageToShow = messages.find(m => m.id === activeMessage);
               
               // Show loading indicator only for the first message until audio is ready
               const showLoadingIndicator = !hasPlayedFirstMessage && (loading || (messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.audioUrl));
               
               if (showLoadingIndicator) {
                 return (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                     <AnimatedLoadingStar />
                   </div>
                 );
               }
               
               // If no active message, don't show anything
               if (!messageToShow || !messageToShow.content) {
                 return null;
               }
               
               return (
                 <animated.div
                   key={messageToShow.id}
                   className="ml-0 text-base text-gray-900 relative"
                   style={processingAnimation}
                 >
                   {/* Voice-first: Show content with streaming animation when audio plays */}
                   <StreamingText 
                     fullText={messageToShow.content} 
                     isStreaming={streamingMessage === messageToShow.id}
                     delay={18}
                   />
                       
                   {/* TTS Error indicator - only show if there's an error */}
                   {messageToShow.ttsError && (
                     <div className="absolute top-2 right-2">
                       <div 
                         className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs"
                         title={`TTS Error: ${messageToShow.ttsError}`}
                       >
                         TTS Error
                       </div>
                     </div>
                   )}
                 </animated.div>
               );
             })()}
          </div>
        )}
        {/* Real-time Transcript Display */}
        {showTranscript && (
          <div 
            className="absolute bottom-4 left-0 right-0 px-4 py-2 text-sm text-gray-500 text-center overflow-x-auto whitespace-nowrap pointer-events-none"
            style={{
              opacity: showTranscript ? 1 : 0,
              transition: 'opacity 0.3s ease-out'
            }}
          >
            {currentTranscript}
          </div>
        )}
      </div>

      {/* Voice Composer */}
      {showComposer && hasBegun && (
        <div className="pb-2">
          <VoiceComposer
            onMessage={handleVoiceMessage}
            disabled={!microphoneEnabled}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            silenceThreshold={silenceThreshold}
            onTranscriptChange={handleTranscriptChange}
          />
        </div>
      )}
    </div>
  );
});

VoiceChat.displayName = 'VoiceChat';

export default VoiceChat;
