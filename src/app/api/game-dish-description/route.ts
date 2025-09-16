import { NextRequest } from "next/server";
import { getTextModel } from "@/lib/ai";
import { getCharacter } from "@/lib/characters";

interface DishDescriptionRequest {
  characterId: string;
  choices: string[];
  gameType: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: DishDescriptionRequest = await req.json();
    const { characterId, choices, gameType } = body;

    const character = getCharacter(characterId);
    if (!character) {
      return new Response("character not found", { status: 404 });
    }

    const model = getTextModel();
    
    const prompt = `You are ${character.name}, a ${character.role}. Based on the cooking choices made so far, generate a concise dish description that combines all elements.

Choices made: ${choices.join(' → ')}

Create a single, cohesive description (maximum 60 characters) that describes what should be ON THE PLATE right now. This will be used to generate an image.

IMPORTANT: 
- If there's only ONE choice (first round), add "raw" or "fresh" to show uncooked ingredient
- If there are multiple choices, describe the cooking progression without "raw"

Examples:
- ["Salmon Filet"] → "raw salmon filet"
- ["Rack of lamb"] → "raw rack of lamb"
- ["Filet mignon"] → "raw filet mignon"
- ["Tofu"] → "fresh tofu block"
- ["Filet mignon", "Seared"] → "seared filet mignon"
- ["Salmon fillet", "Poached", "Lemon herbs"] → "poached salmon with lemon herbs"
- ["Chicken breast", "Grilled", "Rosemary", "Microgreens"] → "grilled chicken with rosemary and microgreens"

Return ONLY the dish description, nothing else. Focus on what's actually on the plate.`;

    console.log(`🍽️ Generating dish description for choices: ${choices.join(' → ')}`);

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
    });

    const dishDescription = result.response.text().trim();
    
    console.log(`✅ Dish description generated: "${dishDescription}"`);

    return new Response(JSON.stringify({ description: dishDescription }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });

  } catch (error) {
    console.error('Dish description generation error:', error);
    return new Response(`Dish description generation error: ${error instanceof Error ? error.message : 'unknown error'}`, { status: 500 });
  }
}
