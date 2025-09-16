'use client';

import { useState, useEffect } from "react";
import { CHARACTERS } from "@/lib/characters";
import { getCharacterImageUrl, getCharacterIdleVideoUrl } from "@/lib/image";
import type { Scene, ExperienceType } from "@/lib/types";
import MobileShell from "@/components/MobileShell";
import SceneImage from "@/components/SceneImage";
import Link from "next/link";
import { ShimmerThumbnail } from "react-shimmer-effects";

type Params = Promise<{ id: string }>;


// Experience type display configuration
const getExperiencePill = (experience: ExperienceType) => {
  const config = {
    conversation: { label: 'Chat', color: 'bg-gray-100 text-gray-600' },
    quiz: { label: 'Quiz', color: 'bg-emerald-50 text-emerald-600' },
    flashcard: { label: 'Cards', color: 'bg-violet-50 text-violet-600' },
    'game-progression': { label: 'Game', color: 'bg-blue-50 text-blue-500' }
  };
  
  return config[experience || 'conversation'] || config.conversation;
};

export default function CharacterPage({ params }: { params: Params }) {
  const [id, setId] = useState<string>('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract id from params
  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  const character = CHARACTERS.find((c) => c.id === id);

  // Fetch scenes client-side
  useEffect(() => {
    if (!character) return;
    
    console.log(`[Character Page] Making API request to /api/scenes for character: ${character.id}`);
    setLoading(true);
    
    fetch(`/api/scenes?characterId=${character.id}&v=${Date.now()}`)
      .then(async (r) => {
        const data = await r.json();
        console.log(`[Character Page] API request succeeded for character: ${character.id}. Received ${data.length} scenes.`);
        setScenes(data);
      })
      .catch((error) => {
        console.error(`[Character Page] API request failed for character: ${character.id}`, error);
        setScenes([]);
      })
      .finally(() => {
        console.log(`[Character Page] Setting loading to false for character: ${character.id}`);
        setLoading(false);
      });
  }, [character]);

  if (!character) {
    return (
      <div className="p-6 text-center text-sm text-white/60">
        Character not found.
      </div>
    );
  }

  return (
      <MobileShell title={character.name} subtitle={character.role} currentCharacterId={character.id} showComposeButton={true}>
      <div>

      <div className="relative mb-7 overflow-hidden rounded-2xl">
        <video
          src={getCharacterIdleVideoUrl(character)}
          autoPlay
          loop
          muted
          playsInline
          className="h-84 w-full object-cover object-top"
        >
          {/* Fallback image if video fails to load */}
          <img
            src={getCharacterImageUrl(character)}
            alt={character.name}
            className="h-84 w-full object-cover object-top"
          />
        </video>
      </div>

      {/* Scene Types */}
      {(['Learn', 'Game', 'Collab', 'Roleplay'] as const).map((sceneType) => {
        const typeScenes = scenes.filter(s => s.type === sceneType);
        
        // Map scene types to display titles
        const typeDisplayNames = {
          'Learn': 'Learn',
          'Game': 'Play games',
          'Collab': 'Create together',
          'Roleplay': 'Roleplay'
        };

        return (
          <div key={sceneType} className="mb-8">
            {/* Section Header */}
            <div className="mb-2">
              <h2 className="text-sm font-semibold text-gray-900">{typeDisplayNames[sceneType]}</h2>
            </div>

            {/* Scene List */}
            {loading ? (
              // Loading state - show shimmer placeholders
              <div className="rounded-xl border border-[#ebeef0] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                {[...Array(3)].map((_, index) => (
                  <div key={index}>
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <ShimmerThumbnail />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-100 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-gray-100 rounded w-full"></div>
                      </div>
                    </div>
                    {index < 2 && <div className="border-b border-[#ebeef0] mx-3"></div>}
                  </div>
                ))}
              </div>
            ) : typeScenes.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500 rounded-xl border border-[#ebeef0] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                No {typeDisplayNames[sceneType].toLowerCase()} scenes yet.
              </div>
            ) : (
              <div className="rounded-xl border border-[#ebeef0] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
                {typeScenes.map((s, index) => (
                  <div key={s.id}>
                    <Link
                      href={`/character/${character.id}/scene/${s.id}`}
                      className="group flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 aspect-[3/4] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <SceneImage 
                          characterId={character.id}
                          sceneId={s.id}
                          title={s.title}
                          characterRole={character.role}
                        />
                      </div>
                      
                      {/* Metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold leading-tight text-gray-900 truncate">
                          {s.title}
                        </div>
                        {s.description && (
                          <div className="mt-1 text-xs text-gray-600 line-clamp-2">
                            {s.description}
                          </div>
                        )}
                        {/* Experience Type Pill */}
                        <div className="mt-1.5">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${getExperiencePill(s.experience).color}`}>
                            {getExperiencePill(s.experience).label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Arrow */}
                      <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/>
                        </svg>
                      </div>
                    </Link>
                    {/* Horizontal divider (except for last item) */}
                    {index < typeScenes.length - 1 && (
                      <div className="border-b border-[#ebeef0] mx-3"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Create Scene Button */}
      <div className="mt-1">
        <Link
          href={`/character/${character.id}/create-scene`}
          className="w-full flex items-center justify-center px-6 py-3 bg-black hover:bg-gray-800 text-sm font-semibold text-white rounded-xl transition-colors"
        >
          Create Scene
        </Link>
      </div>
      </div>
    </MobileShell>
  );
}


