export type Character = {
  id: string;
  name: string;
  role: string; // e.g., "chef", "therapist"
  tags: string[];
  description: string;
  imageUrl?: string; // bust-framed image
  imagePrompt?: string; // prompt to generate consistent bust image
};

export type SceneType = 'Game' | 'Collab' | 'Learn' | 'Roleplay';
export type ExperienceType = 'conversation' | 'quiz' | 'flashcard' | 'game-progression';

export type Scene = {
  id: string;
  characterId: string;
  title: string;
  caption: string;
  type: SceneType;
  experience: ExperienceType; // The specific experience type for this scene
  description?: string; // More detailed description of the scene
  rules?: string[]; // Rules that govern how the scene works (40-100 chars each)
};

// Game-specific types
export interface GameQuestion {
  round: number;
  question: string;
  options: string[];
  imagePrompt: string;
}

export interface GameState {
  currentRound: number;
  choices: string[];
  questions: GameQuestion[];
  images: string[]; // Base64 or URLs of generated images
  completed: boolean;
}
