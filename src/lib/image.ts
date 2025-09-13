import type { Character } from "./types";

export function getCharacterImageUrl(character: Character): string {
  if (character.imageUrl) return character.imageUrl;
  // Check for local generated image first, fallback to API generation if missing
  return `/characters/${character.id}.png`;
}


