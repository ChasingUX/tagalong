import { PREDEFINED_SCENES } from "./predefinedCharacters";
import fs from "fs";
import path from "path";

const SCENES_CACHE_DIR = path.join(process.cwd(), 'data', 'scenes');

function ensureCacheDir() {
  if (!fs.existsSync(SCENES_CACHE_DIR)) {
    fs.mkdirSync(SCENES_CACHE_DIR, { recursive: true });
  }
}

export function initializePredefinedScenes() {
  ensureCacheDir();
  
  Object.entries(PREDEFINED_SCENES).forEach(([characterId, scenes]) => {
    const cacheFile = path.join(SCENES_CACHE_DIR, `${characterId}.json`);
    
    // Only initialize if file doesn't exist (don't overwrite user-created scenes)
    if (!fs.existsSync(cacheFile)) {
      fs.writeFileSync(cacheFile, JSON.stringify(scenes, null, 2));
      console.log(`✅ Initialized ${scenes.length} predefined scenes for ${characterId}`);
    }
  });
}
