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
export type ExperienceType = 'conversation' | 'quiz' | 'flashcard' | 'game-progression' | 'explore';

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

// Explore-specific types
export interface ExploreStop {
  id: string;
  title: string;
  description: string;
  imagePrompt: string;
  soundscapeFile: string;
  goDeeper?: {
    level1?: {
      title: string;
      description: string;
      imagePrompt: string;
    };
    level2?: {
      title: string;
      description: string;
      imagePrompt: string;
    };
  };
}

export interface ExploreState {
  currentStop: number;
  currentDepth: number; // 0 = main stop, 1 = first deeper, 2 = second deeper
  visitedStops: Array<{
    stopId: string;
    depth: number;
    image: string;
    title: string;
  }>;
  completed: boolean;
}
