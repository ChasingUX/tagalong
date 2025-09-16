import type { Character } from "./types";

export function getCharacterImageUrl(character: Character): string {
  if (!character?.id) {
    console.warn('getCharacterImageUrl: character or character.id is undefined');
    return '/characters/default.png';
  }
  if (character.imageUrl) return character.imageUrl;
  // Check for local generated image first, fallback to API generation if missing
  return `/characters/${character.id}.png`;
}

export function getCharacterIdleVideoUrl(character: Character): string {
  if (!character?.id) {
    console.warn('getCharacterIdleVideoUrl: character or character.id is undefined');
    return '/idle/default_idle.mp4';
  }
  return `/idle/${character.id}_idle.mp4`;
}


