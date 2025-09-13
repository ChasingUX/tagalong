import { NextRequest } from "next/server";
import { getImageModel } from "@/lib/ai";
import { generateScenes } from "@/lib/scenes";
import { getCharacter } from "@/lib/characters";
import { getCharacterImageUrl } from "@/lib/image";
import fs from "fs";
import path from "path";

const SCENE_IMAGES_CACHE_DIR = path.join(process.cwd(), 'data', 'scene-images');

// Ensure cache directory exists
function ensureSceneImagesCacheDir() {
  if (!fs.existsSync(SCENE_IMAGES_CACHE_DIR)) {
    fs.mkdirSync(SCENE_IMAGES_CACHE_DIR, { recursive: true });
  }
}

// Load cached scene image
function loadCachedSceneImage(characterId: string, sceneId: string): Buffer | null {
  try {
    ensureSceneImagesCacheDir();
    const cacheFile = path.join(SCENE_IMAGES_CACHE_DIR, `${characterId}-${sceneId}.png`);
    if (fs.existsSync(cacheFile)) {
      return fs.readFileSync(cacheFile);
    }
  } catch (error) {
    console.error(`Error loading cached scene image for ${characterId}-${sceneId}:`, error);
  }
  return null;
}

// Save scene image to cache
function saveSceneImageCache(characterId: string, sceneId: string, imageBuffer: Buffer) {
  try {
    ensureSceneImagesCacheDir();
    const cacheFile = path.join(SCENE_IMAGES_CACHE_DIR, `${characterId}-${sceneId}.png`);
    fs.writeFileSync(cacheFile, imageBuffer);
    console.log(`Cached scene image for ${characterId}-${sceneId}`);
  } catch (error) {
    console.error(`Error saving scene image cache for ${characterId}-${sceneId}:`, error);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const characterId = searchParams.get("characterId") ?? "unknown";
  const sceneId = searchParams.get("sceneId") ?? "0";

  if (!process.env.GOOGLE_API_KEY || process.env.DISABLE_IMAGE_GEN === "1") {
    return new Response("image generation disabled", { status: 503 });
  }

  try {
    // Check cache first
    const cachedImage = loadCachedSceneImage(characterId, sceneId);
    if (cachedImage) {
      console.log(`Using cached scene image for ${characterId}-${sceneId}`);
      return new Response(cachedImage, {
        status: 200,
        headers: { 
          "content-type": "image/png", 
          "cache-control": "public, max-age=86400, immutable"
        },
      });
    }

    // Get character and scenes
    const character = getCharacter(characterId);
    if (!character) {
      return new Response("character not found", { status: 404 });
    }
    
    const scenes = await generateScenes(character);
    const scene = scenes.find((s) => s.id === sceneId);
    const caption = scene?.caption ?? "general interaction";
    
    console.log(`Generating new scene image for ${characterId}-${sceneId}: ${caption}`);
    
    // Get the original character image
    const characterImagePath = path.join(process.cwd(), 'public', 'characters', `${characterId}.png`);
    if (!fs.existsSync(characterImagePath)) {
      throw new Error(`Character image not found: ${characterId}.png`);
    }
    
    const imageBuffer = fs.readFileSync(characterImagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    // Use Gemini 2.5 Flash for image-to-image generation
    const model = getImageModel();
    const prompt = `Create a close-up scene image for: "${caption}". 

Focus on a tight, recognizable close-up that captures the essence of this activity. Choose the best framing for a small thumbnail image:
- Show the main action or key elements up close (hands working, tools in use, key objects)
- Include recognizable character details (clothing, hands, or partial face) to maintain identity
- Use dramatic, clear composition that reads well at small sizes
- Emphasize the most important visual elements of the scene
- Create strong visual contrast and clear focal points
- Avoid including any text, labels, or written words in the image

Examples of good close-up framing:
- Cooking scenes: Hands in chef coat preparing food, close-up of cooking action
- Games: Close-up of game elements, hands interacting with objects
- Learning: Books, flashcards, or study materials with character hands
- Competitions: Close-up of judging, tasting, or competitive elements

Make it immediately recognizable what activity is happening, even at thumbnail size. Focus on visual elements only, no text.`;

    console.log(`🎨 PROMPT FOR ${characterId}-${sceneId}:`);
    console.log(`📝 Scene: "${caption}"`);
    console.log(`📋 Full prompt: "${prompt}"`);
    console.log(`🖼️  Character image: ${characterImagePath} (${Math.round(imageBuffer.length / 1024)}KB)`);
    console.log(`🤖 Model: ${process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image-preview"}`);
    console.log(`⏳ Starting image generation...`);
    console.log(`🔄 Force cache refresh - timestamp: ${Date.now()}`);

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: "image/png"
        }
      },
      { text: prompt }
    ]);
    
    const response = result.response;
    const generatedImageData = response.candidates?.[0]?.content?.parts?.[0] as any;
    
    if (!generatedImageData?.inlineData?.data) {
      console.error(`❌ No image data returned from Gemini for ${characterId}-${sceneId}`);
      console.error(`Response structure:`, JSON.stringify(response, null, 2));
      throw new Error("No image data returned from Gemini");
    }
    
    const generatedImageBuffer = Buffer.from(generatedImageData.inlineData.data, 'base64');
    console.log(`✅ Image generated successfully for ${characterId}-${sceneId} (${Math.round(generatedImageBuffer.length / 1024)}KB)`);
    
    // Cache the generated image
    saveSceneImageCache(characterId, sceneId, generatedImageBuffer);
    
    return new Response(generatedImageBuffer, {
      status: 200,
      headers: { 
        "content-type": "image/png", 
        "cache-control": "public, max-age=86400, immutable"
      },
    });
  } catch (e) {
    console.error('Scene image generation error:', e);
    return new Response(`image generation error: ${e instanceof Error ? e.message : 'unknown error'}`, { status: 500 });
  }
}


