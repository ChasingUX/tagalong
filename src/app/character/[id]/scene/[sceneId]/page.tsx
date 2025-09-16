"use client";

import { useEffect, useState, use, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import SceneModal from "@/components/SceneModal";
import { QuizExperience } from "@/components/QuizExperience";
import { GameExperience } from "@/components/GameExperience";
import VoiceChat, { type ChatContext, type Message } from "@/components/VoiceChat";
import { CHARACTERS } from "@/lib/characters";
import type { Scene } from "@/lib/types";
import { getExperienceType, EXPERIENCES } from "@/lib/experiences";
import { type ExperienceType } from "@/lib/types";

interface Params {
  id: string;
  sceneId: string;
}

export default function SceneChatPage({ params }: { params: Promise<Params> }) {
  const { id, sceneId } = use(params);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sceneTitle, setSceneTitle] = useState("Chat");
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [hasBegun, setHasBegun] = useState(false);
  const [experienceType, setExperienceType] = useState<ExperienceType>('conversation');
  const [quizRef, setQuizRef] = useState<{ beginQuiz: () => void; hasBegun: boolean; loading: boolean } | null>(null);
  const [gameRef, setGameRef] = useState<{ beginGame: () => void; hasBegun: boolean; loading: boolean } | null>(null);
  
  // Check if user has started by seeing if there are user messages
  const hasStarted = messages.some(m => m.role === "user");

  const character = CHARACTERS.find((c) => c.id === id);

  // Chat context for the reusable chat component
  const chatContext: ChatContext | null = useMemo(() => {
    if (!character || !currentScene) return null;
    return {
      character,
      scene: currentScene
    };
  }, [character, currentScene]);

  const closeModal = () => {
    setShowModal(false);
  };

  const beginScene = async () => {
    if (!character || !currentScene) return;
    
    setHasBegun(true);
    setShowModal(false);
    setLoading(true);
    
    // Start new streaming message
    const messageId = `seed-${Date.now()}`;
    
    try {
      console.log('🌱 Scene: Starting conversation seed');
      const res = await fetch(`/api/chat/seed?characterId=${character.id}&sceneId=${currentScene.id}`);
      const data = await res.json();
      
      if (data.message) {
        console.log('🌱 Scene: Seed message received from LLM');
        console.log('📝 Scene: Seed message text:', data.message);
        
        // Add streaming assistant message
        const streamingMsg: Message = { 
          role: "assistant", 
          content: data.message, 
          streaming: true, 
          id: messageId 
        };
        setMessages([streamingMsg]);
        
        // Stop loading immediately when we start showing the message
        setLoading(false);
        
        // Generate TTS for the seed message
        console.log('🎵 Scene: Sending seed message to Play.ai TTS');
        try {
          const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              text: data.message,
              characterId: character.id
            })
          });
          
          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            console.log('🎵 Scene: TTS audio received for seed message');
            
            // Update message with audio URL
            const messageWithAudio: Message = {
              role: "assistant",
              content: data.message,
              streaming: true,
              id: messageId,
              audioUrl: ttsData.audioUrl
            };
            
            console.log('🔊 Scene: Setting message with audio - VoiceChat will handle playback and mic activation');
            setMessages([messageWithAudio]);
          }
        } catch (ttsError) {
          console.error('🎵 Scene: TTS Error for seed message:', ttsError);
        }
        
        // After a delay, mark as complete
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.id === messageId ? { ...m, streaming: false } : m
          ));
        }, 1000); // Give time for audio to start
      }
    } catch (error) {
      console.error('🌱 Scene: Failed to seed conversation:', error);
      setLoading(false);
    }
  };


  // Load scene data
  useEffect(() => {
    const loadScene = async () => {
      if (!character) return;
      
      try {
        const res = await fetch(`/api/scenes?characterId=${character.id}`);
        const scenes = await res.json();
        const scene = scenes.find((s: Scene) => s.id === sceneId);
        
        if (scene) {
          setCurrentScene(scene);
          setSceneTitle(scene.title);
          
          // Determine experience type based on scene
          const expType = getExperienceType(scene);
          setExperienceType(expType);
          
          // Show modal for new scenes
          if (!hasStarted) {
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error('Failed to load scene:', error);
      }
    };

    loadScene();
  }, [character, sceneId, hasStarted]);


  if (!character) {
    return (
      <MobileShell title="Character Not Found">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Character not found</p>
            <Link href="/" className="text-blue-500 hover:underline">
              Go back home
            </Link>
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell 
      title={sceneTitle} 
      subtitle={character.name}
      currentCharacterId={character.id}
      showInfoButton={true}
      onInfoClick={() => setShowModal(true)}
    >
      <div className="h-full flex flex-col relative">        
        {/* Render different experience types */}
        {!currentScene ? (
          <div className="flex-1"></div>
        ) : experienceType === 'quiz' ? (
          <QuizExperience 
            character={character} 
            scene={currentScene} 
            onRefReady={setQuizRef}
            onBegin={() => setHasBegun(true)}
          />
        ) : experienceType === 'game-progression' ? (
          <GameExperience 
            character={character} 
            scene={currentScene} 
            onRefReady={setGameRef}
            onBegin={() => setHasBegun(true)}
          />
        ) : chatContext ? (
          <VoiceChat
            context={chatContext}
            messages={messages}
            onMessagesChange={setMessages}
            loading={loading}
            onLoadingChange={setLoading}
            className="flex-1"
            showComposer={true}
            composerMode="normal"
            hasBegun={hasBegun}
            onBegin={beginScene}
          />
        ) : (
          <div className="flex-1"></div>
        )}
      </div>

      {/* Scene Modal */}
      <SceneModal
        isOpen={showModal}
        onClose={closeModal}
        onBegin={experienceType === 'quiz' ? () => { quizRef?.beginQuiz(); setShowModal(false); } : experienceType === 'game-progression' ? () => { gameRef?.beginGame(); setShowModal(false); } : beginScene}
        scene={currentScene}
        character={character}
        hasStarted={hasStarted}
      />
    </MobileShell>
  );
}