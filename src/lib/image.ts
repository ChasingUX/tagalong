import type { Character } from "./types";

export function getCharacterImageUrl(character: Character): string {
  if (character.imageUrl) return character.imageUrl;
  // Check for local generated image first, fallback to API generation if missing
  return `/characters/${character.id}.png`;
}

export function getCharacterIdleVideoUrl(character: Character): string {
  return `/idle/${character.id}_idle.mp4`;
}


