import { NextRequest } from "next/server";
import { getImageModel } from "@/lib/ai";
import { getCharacter } from "@/lib/characters";
import fs from "fs";
import path from "path";

interface GameImageRequest {
  characterId: string;
  sceneId: string;
  round: number;
  previousChoices: string[];
  currentPrompt: string;
  baseImageData?: string; // Base64 of previous round's image
}

const GAME_IMAGES_CACHE_DIR = path.join(process.cwd(), 'data', 'game-images');

function ensureGameImagesCacheDir() {
  if (!fs.existsSync(GAME_IMAGES_CACHE_DIR)) {
    fs.mkdirSync(GAME_IMAGES_CACHE_DIR, { recursive: true });
  }
}

function getCacheKey(characterId: string, sceneId: string, round: number, choices: string[]): string {
  const choicesHash = Buffer.from(choices.join('|')).toString('base64').slice(0, 8);
  return `${characterId}-${sceneId}-r${round}-${choicesHash}`;
}

export async function POST(req: NextRequest) {
  try {
    const body: GameImageRequest = await req.json();
    const { characterId, sceneId, round, previousChoices, currentPrompt, baseImageData } = body;

    if (!process.env.GOOGLE_API_KEY || process.env.DISABLE_IMAGE_GEN === "1") {
      return new Response("image generation disabled", { status: 503 });
    }

    ensureGameImagesCacheDir();
    
    // Check cache
    const cacheKey = getCacheKey(characterId, sceneId, round, previousChoices);
    const cacheFile = path.join(GAME_IMAGES_CACHE_DIR, `${cacheKey}.png`);
    
    if (fs.existsSync(cacheFile)) {
      console.log(`Using cached game image for ${cacheKey}`);
      const cachedImage = fs.readFileSync(cacheFile);
      return new Response(cachedImage, {
        status: 200,
        headers: { 
          "content-type": "image/png",
          "cache-control": "public, max-age=86400, immutable"
        }
      });
    }

    const character = getCharacter(characterId);
    if (!character) {
      return new Response("character not found", { status: 404 });
    }

    const model = getImageModel();
    let inputImageData = baseImageData;

    // For round 0 and 1, use the character image as style reference
    if (round <= 1) {
      const characterImagePath = path.join(process.cwd(), 'public', 'characters', `${characterId}.png`);
      if (!fs.existsSync(characterImagePath)) {
        throw new Error(`Character image not found: ${characterId}.png`);
      }
      const imageBuffer = fs.readFileSync(characterImagePath);
      inputImageData = imageBuffer.toString('base64');
    }

    // Build prompt based on whether this is base generation or progressive
    const choicesContext = previousChoices.length > 0 
      ? `Previous choices made: ${previousChoices.join(' → ')}\n`
      : '';

    if (!inputImageData) {
      throw new Error("No base image data provided");
    }

    let prompt;
    let contentArray;

    if (round === 0) {
      // Base image generation - use character image for style reference only
      prompt = `Using the provided character image as a style reference ONLY, create a professional cooking workspace: "${currentPrompt}"

CRITICAL REQUIREMENTS:
- Use the reference image ONLY for artistic style, lighting, and visual quality
- DO NOT include the character's face, body, or any person in the generated image
- Focus entirely on the cooking workspace and plate
- Create a clean, professional cooking environment
- Use the same artistic style and lighting quality as the reference
- Show only hands holding the plate (anonymous hands, not the character)
- Use dramatic, clear composition that reads well at small sizes
- Avoid any text or labels in the image
- Square aspect ratio suitable for mobile display`;

      contentArray = [
        {
          inlineData: {
            data: inputImageData,
            mimeType: "image/png"
          }
        },
        { text: prompt }
      ];
    } else {
      // Progressive image generation - replace plate contents with cumulative description
      prompt = `${choicesContext}Using the provided image as the starting point, change the contents on the plate to: "${currentPrompt}"

CRITICAL REQUIREMENTS:
- Keep the same plate, hands, setting, lighting, and kitchen background from ${character.name}'s workspace
- ONLY change what's ON the plate - everything else stays the same
- Replace the current plate contents with the new description
- Maintain the same visual style and composition as ${character.name}'s professional kitchen
- Show ${character.name}'s hands holding the plate (maintain character consistency)
- Show the new dish contents clearly on the plate
- Use dramatic, clear composition that reads well at small sizes
- Create strong visual contrast and clear focal points
- Avoid any text or labels in the image

The plate should now show: ${currentPrompt}`;

      contentArray = [
        {
          inlineData: {
            data: inputImageData,
            mimeType: "image/png"
          }
        },
        { text: prompt }
      ];
    }

    console.log(`🎮 Generating game image - Round ${round} for ${characterId}-${sceneId}`);
    console.log(`📝 Dynamic dish description: "${currentPrompt}"`);
    console.log(`🔄 Previous choices: ${previousChoices.join(' → ')}`);
    console.log(`🎨 Full image prompt: "${prompt}"`);

    const result = await model.generateContent(contentArray);

    const response = result.response;
    
    // Try different possible locations for image data in Gemini response
    let imageData = null;
    const candidate = response.candidates?.[0];
    
    if (candidate?.content?.parts) {
      // Look through all parts for image data
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith('image/')) {
          imageData = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageData) {
      console.error(`❌ No image data returned from Gemini for ${cacheKey}`);
      console.error(`Response structure:`, JSON.stringify(response, null, 2));
      throw new Error("No image data returned from Gemini");
    }

    const generatedImageBuffer = Buffer.from(imageData, 'base64');
    
    // Cache the result
    fs.writeFileSync(cacheFile, generatedImageBuffer);
    console.log(`✅ Game image generated successfully - Round ${round} (${Math.round(generatedImageBuffer.length / 1024)}KB)`);

    return new Response(generatedImageBuffer, {
      status: 200,
      headers: { 
        "content-type": "image/png",
        "cache-control": "public, max-age=86400, immutable"
      }
    });

  } catch (error) {
    console.error('Game image generation error:', error);
    return new Response(`Game image generation error: ${error instanceof Error ? error.message : 'unknown error'}`, { status: 500 });
  }
}
