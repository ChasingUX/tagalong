import { NextRequest } from "next/server";
import { getTextModel } from "@/lib/ai";
import { getCharacter } from "@/lib/characters";

interface DishNameRequest {
  characterId: string;
  choices: string[];
  gameType: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: DishNameRequest = await req.json();
    const { characterId, choices, gameType } = body;

    const character = getCharacter(characterId);
    if (!character) {
      return new Response("character not found", { status: 404 });
    }

    const model = getTextModel();
    
    const prompt = `You are ${character.name}, a ${character.role}. Based on the cooking choices made, create an elegant dish name for the final creation.

Choices made: ${choices.join(' → ')}

Create a sophisticated, restaurant-quality dish name (maximum 50 characters) that sounds like it would appear on a fine dining menu. Use proper culinary terminology.

Examples:
- ["Salmon fillet", "Poached", "Lemon herbs", "Microgreens"] → "Poached Salmon with Lemon Herbs & Microgreens"
- ["Rack of lamb", "Seared", "Rosemary", "Root vegetables"] → "Seared Rack of Lamb with Rosemary & Root Vegetables"
- ["Chicken breast", "Grilled", "Thyme", "Asparagus"] → "Grilled Chicken Breast with Thyme & Asparagus"

Return ONLY the dish name, nothing else. Make it sound elegant and professional.`;

    console.log(`🏷️ Generating dish name for choices: ${choices.join(' → ')}`);

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
    });

    const dishName = result.response.text().trim();
    
    console.log(`✅ Dish name generated: "${dishName}"`);

    return new Response(JSON.stringify({ name: dishName }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });

  } catch (error) {
    console.error('Dish name generation error:', error);
    return new Response(`Dish name generation error: ${error instanceof Error ? error.message : 'unknown error'}`, { status: 500 });
  }
}
