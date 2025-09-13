import type { Scene, Character } from "./types";
import { PREDEFINED_SCENES } from "./predefinedCharacters";
import fs from "fs";
import path from "path";

const SCENES_CACHE_DIR = path.join(process.cwd(), 'data', 'scenes');

function loadCachedScenes(characterId: string): Scene[] | null {
  try {
    const cacheFile = path.join(SCENES_CACHE_DIR, `${characterId}.json`);
    if (fs.existsSync(cacheFile)) {
      const raw = fs.readFileSync(cacheFile, 'utf-8');
      return JSON.parse(raw) as Scene[];
    }
  } catch (error) {
    console.error(`Error loading cached scenes for ${characterId}:`, error);
  }
  return null;
}

export async function generateScenes(character: Character): Promise<Scene[]> {
  // First try to load cached scenes (includes user-created scenes)
  const cachedScenes = loadCachedScenes(character.id);
  if (cachedScenes && cachedScenes.length > 0) {
    console.log(`Using cached scenes for character: ${character.id} (${cachedScenes.length} scenes)`);
    return cachedScenes;
  }

  // Fallback to predefined scenes
  const predefinedScenes = PREDEFINED_SCENES[character.id];
  if (predefinedScenes) {
    console.log(`Using predefined scenes for character: ${character.id} (${predefinedScenes.length} scenes)`);
    return predefinedScenes;
  }

  // Final fallback if no scenes exist
  console.log(`No scenes found for character: ${character.id}, using empty array`);
  return [];
}

export function getScenesByType(character: Character, type: 'Game' | 'Collab' | 'Learn' | 'Roleplay'): Scene[] {
  const allScenes = PREDEFINED_SCENES[character.id] || [];
  return allScenes.filter(scene => scene.type === type);
}

export function getAllScenesForCharacter(characterId: string): Scene[] {
  return PREDEFINED_SCENES[characterId] || [];
}