import type { Scene, ExperienceType } from "./types";

// Configuration for each experience type
export interface ExperienceConfig {
  type: ExperienceType;
  label: string;
  description: string;
  pipInitialExpanded?: boolean;
}

// Available experiences
export const EXPERIENCES: Record<ExperienceType, ExperienceConfig> = {
  conversation: {
    type: 'conversation',
    label: 'Conversation',
    description: 'Interactive discussion with the character',
    pipInitialExpanded: true // For focused voice conversation
  },
  quiz: {
    type: 'quiz',
    label: 'Quiz',
    description: 'Test your knowledge with AI-generated questions',
    pipInitialExpanded: false // Starts collapsed
  },
  flashcard: {
    type: 'flashcard',
    label: 'Flashcards',
    description: 'Study with AI-generated flashcards',
    pipInitialExpanded: false // Starts collapsed
  },
  'game-progression': {
    type: 'game-progression',
    label: 'Game',
    description: 'Progressive choice games that build step by step',
    pipInitialExpanded: false // Starts collapsed for full-screen experience
  }
};

// Get experience type from scene (now directly from scene data)
export const getExperienceType = (scene: Scene | null): ExperienceType => {
  return scene?.experience || 'conversation';
};

// Helper to determine if an experience supports a specific feature
export const experienceSupports = (
  experienceType: ExperienceType, 
  feature: 'streaming' | 'progress_tracking' | 'ai_generation'
): boolean => {
  switch (experienceType) {
    case 'conversation':
      return feature === 'streaming' || feature === 'ai_generation';
    case 'quiz':
      return feature === 'progress_tracking' || feature === 'ai_generation';
    case 'flashcard':
      return feature === 'progress_tracking' || feature === 'ai_generation';
    case 'game-progression':
      return feature === 'progress_tracking' || feature === 'ai_generation' || feature === 'streaming';
    default:
      return false;
  }
};
