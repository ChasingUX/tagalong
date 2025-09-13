import { NextRequest, NextResponse } from "next/server";
import { getTextModel } from "@/lib/ai";
import type { Scene, SceneType } from "@/lib/types";
import fs from "fs";
import path from "path";

const SCENES_CACHE_DIR = path.join(process.cwd(), 'data', 'scenes');

// Ensure cache directory exists
function ensureCacheDir() {
  if (!fs.existsSync(SCENES_CACHE_DIR)) {
    fs.mkdirSync(SCENES_CACHE_DIR, { recursive: true });
  }
}

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

function saveScenesCache(characterId: string, scenes: Scene[]) {
  try {
    ensureCacheDir();
    const cacheFile = path.join(SCENES_CACHE_DIR, `${characterId}.json`);
    fs.writeFileSync(cacheFile, JSON.stringify(scenes, null, 2));
  } catch (error) {
    console.error(`Error saving scenes cache for ${characterId}:`, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, title, description, type } = body as {
      characterId: string;
      title: string;
      description: string;
      type: SceneType;
    };

    if (!characterId || !title || !description || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Load existing scenes
    const existingScenes = loadCachedScenes(characterId) || [];
    
    // Generate new scene ID
    const maxId = existingScenes.reduce((max, scene) => {
      const id = parseInt(scene.id);
      return isNaN(id) ? max : Math.max(max, id);
    }, 0);
    const newId = (maxId + 1).toString();

    // Create new scene
    const newScene: Scene = {
      id: newId,
      characterId,
      title: title.trim(),
      caption: title.trim(),
      type,
      description: description.trim()
    };

    // Add to existing scenes
    const updatedScenes = [...existingScenes, newScene];
    
    // Save to cache
    saveScenesCache(characterId, updatedScenes);

    console.log(`✅ Created new ${type} scene for ${characterId}: "${title}"`);
    
    return NextResponse.json({ 
      success: true, 
      scene: newScene,
      totalScenes: updatedScenes.length 
    });

  } catch (error) {
    console.error("Error creating scene:", error);
    return NextResponse.json(
      { error: "Failed to create scene" },
      { status: 500 }
    );
  }
}
