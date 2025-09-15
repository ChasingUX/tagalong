import { NextRequest } from "next/server";
import { getCharacter } from "@/lib/characters";
import { generateScenes } from "@/lib/scenes";
import { getTextModel } from "@/lib/ai";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const characterId = searchParams.get("characterId");
  const sceneId = searchParams.get("sceneId");
  if (!characterId || !sceneId) {
    return new Response(JSON.stringify({ error: "characterId and sceneId required" }), {
      status: 400,
    });
  }

  try {
    // Get character and scene data
    const character = getCharacter(characterId);
    if (!character) {
      return new Response(JSON.stringify({ error: "character not found" }), { status: 404 });
    }

    const scenes = await generateScenes(character);
    const scene = scenes.find(s => s.id === sceneId);
    if (!scene) {
      return new Response(JSON.stringify({ error: "scene not found" }), { status: 404 });
    }

    // Generate type-specific opening message
    const model = getTextModel();
    const typePrompts = {
      Game: `You are ${character.name}, a ${character.role}. Create a SHORT, energetic opening for the game "${scene.title}". Just greet the user and kick things off - don't explain rules or mechanics yet.`,
      Collab: `You are ${character.name}, a ${character.role}. Create a SHORT, welcoming opening for the collaboration "${scene.title}". Just greet the user and suggest getting started together.`,
      Learn: `You are ${character.name}, a ${character.role}. Create a SHORT, encouraging opening for the learning experience "${scene.title}". Just greet the user and ask one simple question to get started.`,
      Roleplay: `You are ${character.name}, a ${character.role}. Create a SHORT, immersive opening for the roleplay "${scene.title}". Just greet the user in character and set the immediate scene.`
    };
    
    const prompt = typePrompts[scene.type] + `

CRITICAL: This is for a VOICE-FIRST interface. Keep it EXTREMELY short:
- Maximum 1-2 sentences
- 15-25 words total
- Sound natural when spoken aloud
- Be punchy and engaging
- Don't explain everything - just get things started
- NEVER include voice directions like "(Warm voice)" or "(Enthusiastic tone)"
- Just write the spoken words directly without any stage directions

Scene: ${scene.title}
Description: ${scene.description}`;
    
    const result = await model.generateContent(prompt);
    const message = result.response.text() || `Hey there! Ready to get started?`;

    return new Response(JSON.stringify({ message }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error('Error generating seed message:', error);
    // Fallback message
    const message = `Hey there! Ready to get started?`;
    return new Response(JSON.stringify({ message }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
}


