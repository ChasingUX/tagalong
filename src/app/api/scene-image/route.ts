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
      return new Response(new Uint8Array(cachedImage), {
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
    const rawCaption = scene?.caption ?? "general interaction";
    
    // Clean up caption for image generation - remove common prefixes
    const caption = rawCaption
      .replace(/^Interactive quiz on\s+/i, '')
      .replace(/^Quiz:\s+/i, '')
      .replace(/^Game:\s+/i, '');
    
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
    
    // Special prompt for Venice Food Tour
    const isVeniceFoodTour = scene?.title === "Venice Food Tour" || caption.toLowerCase().includes("venice");
    
    const prompt = isVeniceFoodTour ? 
      `Using the provided character image as reference, create a close-up scene image showing this chef character in Venice, Italy for: "${caption}".

CRITICAL: Maintain the exact same character appearance from the reference image - same face, hair, clothing style, and visual identity.

Create a scene showing this chef character in a beautiful Venice setting:
- PRESERVE the character's exact appearance, facial features, hair, and style from the reference image
- Show the character in Venice with iconic Venetian elements: canals, gondolas, historic architecture, bridges
- Include Venetian food culture elements: outdoor café tables, Italian ingredients, canal-side dining
- Character should be in chef attire or stylish Italian clothing, engaging with Venice food scene
- Show the character's face clearly with an expression of joy and culinary passion
- Include authentic Venice atmosphere: warm golden lighting, canal reflections, historic stone buildings
- Add Italian food elements: fresh ingredients, wine, traditional dishes, market scenes
- Use cinematic composition that captures both the character and Venice's romantic charm
- Create warm, inviting colors that evoke Italian cuisine and Venice's golden hour beauty
- Avoid including any text, labels, or written words in the image

The character should look like they belong in Venice, perhaps at a canal-side restaurant, local market, or cooking with a view of Venice's canals and architecture behind them. Make it feel authentically Venetian while keeping the character's identity consistent.` :
      `Using the provided character image as reference, create a close-up scene image for: "${caption}". 

CRITICAL: Maintain the exact same character appearance from the reference image - same face, hair, clothing style, and visual identity.

Create a scene showing this character engaged in the activity. Focus on a tight, recognizable close-up:
- PRESERVE the character's exact appearance, facial features, hair, and style from the reference image
- Show the character actively engaged in the described activity
- Include the character's face or recognizable features when possible
- Use the same clothing style and visual aesthetic as the reference
- Show relevant activity elements (tools, objects, environment) that support the scene
- Use dramatic, clear composition that reads well at small sizes
- Create strong visual contrast and clear focal points
- Avoid including any text, labels, or written words in the image

Examples of good character-focused framing:
- Cooking scenes: Character in chef attire preparing food, showing face/hands in action
- Games: Character engaged with game elements, showing expression and involvement
- Learning: Character studying or teaching, with relevant materials visible
- Entertainment: Character in professional setting with relevant props/environment

The character's appearance and identity must remain consistent with the reference image. Make it immediately recognizable as the same person doing the described activity.`;

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


