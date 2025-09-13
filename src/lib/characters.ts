import type { Character } from "./types";
import { PREDEFINED_CHARACTERS } from "./predefinedCharacters";

export const CHARACTERS = PREDEFINED_CHARACTERS;

export function getCharacterImageUrl(character: Character): string {
  if (character.imageUrl) {
    // Add cache-busting parameter to force refresh
    const cacheBuster = Date.now();
    return `${character.imageUrl}?v=${cacheBuster}`;
  }
  if (character.imagePrompt) {
    const urlPrompt = encodeURIComponent(character.imagePrompt);
    return `/api/character-image?prompt=${urlPrompt}`;
  }
  // Fallback generic placeholder
  return `/api/character-image?prompt=${encodeURIComponent(
    `bust portrait of ${character.name} (${character.role}), neutral background, soft diffused lighting, crisp focus, clean color palette`
  )}`;
}

export function getAllCharacters(): Character[] {
  return CHARACTERS;
}

export function getCharacter(id: string): Character | undefined {
  return CHARACTERS.find(c => c.id === id);
}