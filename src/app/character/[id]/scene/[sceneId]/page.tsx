"use client";

import { useEffect, useState, use, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileShell from "@/components/MobileShell";
import SceneModal from "@/components/SceneModal";
import { QuizExperience } from "@/components/QuizExperience";
import CharacterPIP from "@/components/CharacterPIP";
import ChatComponent, { type ChatContext, type Message } from "@/components/ChatComponent";
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
  const [isPipExpanded, setIsPipExpanded] = useState(false);
  
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
      const res = await fetch(`/api/chat/seed?characterId=${character.id}&sceneId=${currentScene.id}`);
      const data = await res.json();
      
      if (data.message) {
        // Add streaming assistant message
        const streamingMsg: Message = { 
          role: "assistant", 
          content: "", 
          streaming: true, 
          id: messageId 
        };
        setMessages([streamingMsg]);
        
        // Stop loading immediately when we start showing the message
        setLoading(false);
        
        // Set the full content immediately and let StreamingText handle the animation
        setTimeout(() => {
          setMessages([
            { role: "assistant", content: data.message, streaming: true, id: messageId }
          ]);
          
          // After a delay, mark as complete (streaming animation will finish)
          setTimeout(() => {
            setMessages([
              { role: "assistant", content: data.message, streaming: false, id: messageId }
            ]);
          }, data.message.length * 15 + 200); // 15ms per character + 200ms buffer
        }, 500); // Small delay to show loading animation first
      }
    } catch (error) {
      console.error('Failed to seed conversation:', error);
      setLoading(false);
    }
  };

  const togglePip = () => {
    console.log(`🎯 togglePip called - current isPipExpanded:`, isPipExpanded);
    setIsPipExpanded(prev => {
      console.log(`🎯 togglePip - changing from ${prev} to ${!prev}`);
      return !prev;
    });
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

  // Update PIP expansion when experience type changes
  useEffect(() => {
    const expConfig = EXPERIENCES[experienceType];
    setIsPipExpanded(expConfig?.pipInitialExpanded || false);
  }, [experienceType]);

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
      currentCharacterId={character.id}
      showInfoButton={true}
      onInfoClick={() => setShowModal(true)}
    >
      <div className="h-full flex flex-col relative">
        {/* Character PIP */}
        {character && hasBegun && (
          <CharacterPIP 
            character={character} 
            isVisible={true}
            initialExpanded={EXPERIENCES[experienceType]?.pipInitialExpanded || false}
            isExpanded={isPipExpanded} 
            onToggleExpanded={togglePip} 
          />
        )}
        
        {/* Render different experience types */}
        {!currentScene ? (
          <div className="flex-1"></div>
        ) : experienceType === 'quiz' ? (
          <QuizExperience 
            character={character} 
            scene={currentScene} 
            onRefReady={setQuizRef}
            isPipExpanded={isPipExpanded}
            onTogglePip={togglePip}
            onBegin={() => setHasBegun(true)}
          />
        ) : chatContext ? (
          <ChatComponent
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
            isPipExpanded={isPipExpanded}
            onTogglePip={togglePip}
          />
        ) : (
          <div className="flex-1"></div>
        )}
      </div>

      {/* Scene Modal */}
      <SceneModal
        isOpen={showModal}
        onClose={closeModal}
        onBegin={experienceType === 'quiz' ? () => { quizRef?.beginQuiz(); setShowModal(false); } : beginScene}
        scene={currentScene}
        character={character}
        hasStarted={hasStarted}
      />
    </MobileShell>
  );
}