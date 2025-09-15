"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

interface VoiceComposerProps {
  onMessage?: (message: string) => void;
  disabled?: boolean;
  className?: string;
  // Voice control props
  isMuted?: boolean;
  onToggleMute?: () => void;
  // Speech recognition settings
  silenceThreshold?: number; // milliseconds of silence before stopping
  // Auto-start listening
  autoStartListening?: boolean;
  // Interruption handling
  onUserSpeaking?: () => void;
}

export const VoiceComposer: React.FC<VoiceComposerProps> = ({
  onMessage,
  disabled = false,
  className = "",
  isMuted = false,
  onToggleMute,
  silenceThreshold = 5000, // 5 seconds default
  autoStartListening = false,
  onUserSpeaking
}) => {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  // Handle transcript completion
  useEffect(() => {
    if (!listening && transcript && transcript !== lastTranscript && transcript.trim()) {
      // Speech recognition has stopped and we have new content
      console.log('🎤 VoiceComposer: Audio transcribed successfully');
      console.log('📝 VoiceComposer: Transcription text:', transcript.trim());
      
      if (onMessage) {
        console.log('📤 VoiceComposer: Sending transcription to chat handler');
        onMessage(transcript.trim());
      }
      setLastTranscript(transcript);
      resetTranscript();
      setError(null);
    }
  }, [listening, transcript, lastTranscript, onMessage, resetTranscript]);

  // Handle silence detection
  useEffect(() => {
    if (listening) {
      // Clear existing timer
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }

      // Start new timer
      const timer = setTimeout(() => {
        if (listening && transcript.trim()) {
          // Send current transcript and reset for next input
          console.log('🕐 VoiceComposer: Silence threshold reached, sending transcript');
          console.log('📝 VoiceComposer: Auto-sending transcription:', transcript.trim());
          
          if (onMessage) {
            onMessage(transcript.trim());
          }
          
          // Reset transcript but keep listening
          resetTranscript();
          setLastTranscript('');
          setError(null);
        }
      }, silenceThreshold);

      setSilenceTimer(timer);
    } else {
      // Clear timer when not listening
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    }

    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [transcript, listening, silenceThreshold]);

  const [micEnabled, setMicEnabled] = useState(true);

  // Add effect to monitor transcript changes and handle interruptions
  useEffect(() => {
    if (transcript && transcript.trim()) {
      console.log('📝 VoiceComposer: Transcript updated:', transcript);
      
      // If user starts speaking (has at least one word), interrupt any playing audio
      const words = transcript.trim().split(/\s+/);
      if (words.length >= 1 && onUserSpeaking) {
        console.log('🗣️ VoiceComposer: User started speaking - triggering interruption');
        onUserSpeaking();
      }
    }
    console.log('🎤 VoiceComposer: Listening status:', listening);
  }, [transcript, listening, onUserSpeaking]);

  const startListening = useCallback(() => {
    console.log('🎤 VoiceComposer: Attempting to start listening...');
    console.log('🎤 VoiceComposer: Browser support:', browserSupportsSpeechRecognition);
    console.log('🎤 VoiceComposer: Microphone available:', isMicrophoneAvailable);
    console.log('🎤 VoiceComposer: Mic enabled:', micEnabled);
    console.log('🎤 VoiceComposer: Disabled prop:', disabled);
    
    if (disabled) {
      console.log('❌ VoiceComposer: Cannot start - component disabled');
      return;
    }
    
    if (!browserSupportsSpeechRecognition) {
      console.log('❌ VoiceComposer: Cannot start - browser does not support speech recognition');
      setError('Speech recognition not supported in this browser');
      return;
    }
    
    if (!isMicrophoneAvailable) {
      console.log('❌ VoiceComposer: Cannot start - microphone not available');
      setError('Microphone not available - please allow microphone access');
      return;
    }
    
    if (!micEnabled) {
      console.log('❌ VoiceComposer: Cannot start - microphone disabled');
      return;
    }
    
    console.log('🎤 VoiceComposer: Starting audio recording');
    resetTranscript();
    setIsListening(true);
    setError(null);
    
    try {
      SpeechRecognition.startListening({ 
        continuous: true,
        language: 'en-US'
      });
      console.log('🎤 VoiceComposer: Speech recognition started successfully');
    } catch (err) {
      console.error('🎤 VoiceComposer: Failed to start speech recognition:', err);
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [disabled, browserSupportsSpeechRecognition, isMicrophoneAvailable, micEnabled, resetTranscript]);

  const stopListening = useCallback(() => {
    console.log('🎤 VoiceComposer: Stopping audio recording');
    setIsListening(false);
    SpeechRecognition.stopListening();
    
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  }, [silenceTimer]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  const toggleMic = useCallback(() => {
    const newMicEnabled = !micEnabled;
    setMicEnabled(newMicEnabled);
    
    // If disabling mic while listening, stop listening
    if (!newMicEnabled && listening) {
      stopListening();
    }
    
    // If enabling mic, automatically start listening
    if (newMicEnabled && !listening) {
      // Use setTimeout to ensure state has updated
      setTimeout(() => {
        startListening();
      }, 100);
    }
  }, [micEnabled, listening, stopListening, startListening]);

  // Auto-start listening when requested
  useEffect(() => {
    console.log('🔄 VoiceComposer: Auto-start effect triggered');
    console.log('🔄 VoiceComposer: autoStartListening:', autoStartListening);
    console.log('🔄 VoiceComposer: listening:', listening);
    console.log('🔄 VoiceComposer: micEnabled:', micEnabled);
    
    if (autoStartListening && !listening && micEnabled) {
      console.log('🎤 VoiceComposer: Auto-starting listening due to audio playback');
      startListening();
    } else {
      console.log('⚠️ VoiceComposer: Auto-start conditions not met');
      if (!autoStartListening) console.log('  - autoStartListening is false');
      if (listening) console.log('  - already listening');
      if (!micEnabled) console.log('  - mic is disabled');
    }
  }, [autoStartListening, listening, micEnabled, startListening]);

  // Show error states
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
          <Image src="/error.svg" alt="Error" width={16} height={16} />
          Browser doesn't support speech recognition
        </div>
      </div>
    );
  }

  if (!isMicrophoneAvailable) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-600 text-sm p-3 rounded-lg">
          <Image src="/mic.svg" alt="Microphone" width={16} height={16} />
          Microphone access required
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-3">
        {/* Sound Toggle Button */}
        <button
          type="button"
          onClick={onToggleMute}
          className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-150"
          disabled={!onToggleMute}
          title={isMuted ? "Turn sound on" : "Turn sound off"}
        >
          <Image
            src={isMuted ? "/sound-off.svg" : "/sound.svg"}
            alt={isMuted ? "Sound off" : "Sound on"}
            width={20}
            height={20}
            className="text-gray-700"
          />
        </button>

        {/* Microphone Button */}
        <button
          type="button"
          onClick={micEnabled ? toggleListening : toggleMic}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${
            !micEnabled 
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          disabled={disabled}
          title={
            !micEnabled 
              ? "Enable microphone" 
              : listening 
                ? "Stop listening" 
                : "Start listening"
          }
        >
          <Image
            src={!listening ? "/mic-off.svg" : "/mic.svg"}
            alt={!listening ? "Microphone off" : "Stop recording"}
            width={20}
            height={20}
            className="text-gray-700"
          />
        </button>

        {/* Stop Button */}
        <button
          type="button"
          onClick={() => {
            // TODO: Hook this up later
            console.log('Stop button clicked - not yet implemented');
          }}
          className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150"
          style={{ backgroundColor: '#FBEDED' }}
          title="End voice chat (coming soon)"
        >
          <Image
            src="/stop.svg"
            alt="Stop"
            width={20}
            height={20}
            className="text-gray-700"
          />
        </button>
      </div>

      {/* Status indicator */}
      {error && (
        <div className="mt-2 text-center">
          <span className="text-red-500 text-xs">{error}</span>
        </div>
      )}
      
    </div>
  );
};

export default VoiceComposer;
