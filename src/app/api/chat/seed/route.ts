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
      Game: `You are ${character.name}, a ${character.role}. Start a game-based chat experience for "${scene.title}". Set up the scenario with clear objectives, game mechanics, and an engaging challenge. Be enthusiastic and establish the rules/goals upfront.`,
      Collab: `You are ${character.name}, a ${character.role}. Start a collaborative chat experience for "${scene.title}". Introduce the project we'll work on together, explain how we'll collaborate, and ask what aspect they'd like to start with. Be welcoming and partnership-focused.`,
      Learn: `You are ${character.name}, a ${character.role}. Start an educational chat experience for "${scene.title}". Introduce the learning objectives, explain how you'll teach (lectures, quizzes, flashcards), and ask about their current knowledge level. Be encouraging and pedagogical.`
    };

    const rulesText = scene.rules && scene.rules.length > 0 
      ? `\n\nScene rules to follow:\n${scene.rules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}`
      : '';
    
    const prompt = typePrompts[scene.type] + `\n\nScene description: ${scene.description}${rulesText}\n\nKeep the opening message concise but engaging (2-3 sentences max). Incorporate the scene rules naturally into how you set up the experience.`;
    
    const result = await model.generateContent(prompt);
    const message = result.response.text() || `Hey! I'm here for this ${scene.type.toLowerCase()} experience. What would you like to explore first?`;

    return new Response(JSON.stringify({ message }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error('Error generating seed message:', error);
    // Fallback message
    const message = `Hey! I'm here for this scene. What would you like to explore first?`;
    return new Response(JSON.stringify({ message }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
}


