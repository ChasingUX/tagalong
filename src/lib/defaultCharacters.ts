import type { Character } from "./types";

export const DEFAULT_CHARACTERS: Character[] = [
  {
    id: "chef-aurora",
    name: "Chef Aurora",
    role: "chef",
    tags: ["cook", "kitchen", "food", "recipe", "culinary"],
    description: "Michelin-trained chef who makes cooking playful and precise.",
    imageUrl:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "therapist-nova",
    name: "Dr. Nova",
    role: "therapist",
    tags: ["mental health", "mindfulness", "counselor", "psychology"],
    description: "Compassionate CBT specialist focusing on practical tools.",
    imageUrl:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "coach-orion",
    name: "Coach Orion",
    role: "fitness coach",
    tags: ["workout", "exercise", "gym", "training"],
    description: "High-energy trainer with science-backed routines.",
    imageUrl:
      "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?q=80&w=800&auto=format&fit=crop",
  },
];


