"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import { CHARACTERS } from "@/lib/characters";
import Link from "next/link";

type Params = Promise<{ id: string }>;

export default function CreateScenePage({ params }: { params: Params }) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sceneType = searchParams.get("type") as "Game" | "Collab" | "Learn" | "Roleplay" || "Game";

  // Resolve params
  useState(() => {
    params.then(setResolvedParams);
  });

  if (!resolvedParams) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  const character = CHARACTERS.find((c) => c.id === resolvedParams.id);
  if (!character) {
    return (
      <MobileShell title="Character Not Found" currentCharacterId={resolvedParams?.id}>
        <div className="p-6 text-center text-sm text-gray-600">
          Character not found.
        </div>
      </MobileShell>
    );
  }

  const typeConfig = {
    Collab: { 
      emoji: '🤝', 
      color: 'bg-blue-100 text-blue-800 border-blue-200', 
      description: 'Co-create together',
      placeholder: 'e.g., Design a custom recipe together',
      examples: ['Build a themed dinner menu', 'Create a new cocktail', 'Design dream kitchen']
    },
    Learn: { 
      emoji: '📚', 
      color: 'bg-purple-100 text-purple-800 border-purple-200', 
      description: 'Interactive learning',
      placeholder: 'e.g., Master knife techniques with flashcards',
      examples: ['Spice identification quiz', 'Cooking methods tutorial', 'Food safety course']
    },
    Game: { 
      emoji: '🎮', 
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
      description: 'Goal-based challenges',
      placeholder: 'e.g., Mystery ingredient cook-off challenge',
      examples: ['Food emoji guessing game', 'Recipe rescue challenge', 'Kitchen timer challenge']
    },
    Roleplay: { 
      emoji: '🎭', 
      color: 'bg-pink-100 text-pink-800 border-pink-200', 
      description: 'Immersive scenarios',
      placeholder: 'e.g., Compete on their cooking show',
      examples: ['Be their assistant in action', 'Step into their world', 'Interactive story scenarios']
    }
  }[sceneType];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/scenes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: character.id,
          title: title.trim(),
          description: description.trim(),
          type: sceneType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create scene');
      }

      const result = await response.json();
      console.log(`✅ Scene created successfully:`, result);
      
      // Redirect back to character page
      router.push(`/character/${character.id}`);
    } catch (error) {
      console.error('Error creating scene:', error);
      alert('Failed to create scene. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <MobileShell title={`Create ${sceneType} Scene`} currentCharacterId={character.id}>
      <div className="pt-2">
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/character/${character.id}`}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Back to {character.name}
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border ${typeConfig.color}`}>
              <span className="text-base">{typeConfig.emoji}</span>
              <span>{sceneType}</span>
            </div>
            <div className="text-xs text-gray-500">{typeConfig.description}</div>
          </div>
          
          <div className="text-lg font-semibold text-gray-900">
            Create a new {sceneType.toLowerCase()} scene for {character.name}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Scene Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={typeConfig.placeholder}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happens in this scene and what the user will accomplish..."
              rows={4}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* Examples */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">
              {sceneType} Scene Examples:
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              {typeConfig.examples.map((example, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  {example}
                </li>
              ))}
            </ul>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!title.trim() || !description.trim() || isGenerating}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Scene...
                </span>
              ) : (
                `Create ${sceneType} Scene`
              )}
            </button>
          </div>
        </form>
      </div>
    </MobileShell>
  );
}
