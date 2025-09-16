import { NextRequest } from "next/server";
import { getTextModel } from "@/lib/ai";
import { getCharacter } from "@/lib/characters";
import { GameQuestion } from "@/lib/types";

interface GameQuestionsRequest {
  characterId: string;
  sceneId: string;
  gameType: string; // e.g., "cooking-showdown"
  previousChoices?: string[];
  currentRound: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: GameQuestionsRequest = await req.json();
    const { characterId, sceneId, gameType, previousChoices = [], currentRound } = body;

    const character = getCharacter(characterId);
    if (!character) {
      return new Response("character not found", { status: 404 });
    }

    const model = getTextModel();
    
    const choicesContext = previousChoices.length > 0 
      ? `Previous choices: ${previousChoices.join(' → ')}\n`
      : '';

    // Add randomization to prevent repetitive options
    const sessionId = Date.now().toString().slice(-6); // Last 6 digits for variation
    const variationPrompts = [
      "Explore bold and unexpected flavor combinations",
      "Consider seasonal ingredients and classic techniques", 
      "Think about regional specialties and fusion approaches",
      "Focus on texture contrasts and visual appeal",
      "Emphasize fresh, high-quality ingredients"
    ];
    const variationHint = variationPrompts[Math.floor(Math.random() * variationPrompts.length)];

    const prompt = `You are ${character.name}, a ${character.role}. Generate the next question for round ${currentRound} of a 5-round progressive choice game.

Game Type: ${gameType}
${choicesContext}
Session: ${sessionId}
Creative Direction: ${variationHint}

REQUIREMENTS:
- Generate exactly ONE question for round ${currentRound}/5
- Question should be 40-85 characters (aim for engaging, not too short)
- Provide exactly 3 distinct, interesting options
- Each option must be maximum 40 characters
- ALL options must be TANGIBLE INGREDIENTS or COOKING TECHNIQUES that appear on the plate
- NO abstract concepts like temperature, mood, or serving style
- Focus on what goes IN/ON the dish, not how it's served
- Build naturally on previous choices with CULINARY LOGIC
- Consider what actually pairs well with previous choices
- Use your expertise as ${character.name} to suggest complementary flavors/techniques
- Create an image prompt that describes what should be added/changed
- Make it engaging and true to ${character.name}'s expertise
- Questions should be descriptive and exciting, not just bare minimum
- VARY your options - avoid repetitive choices across different game sessions
- Draw from diverse culinary traditions, techniques, and ingredient families
- Consider the creative direction hint to inspire unique options
- ENSURE VISUAL IMPACT - each choice must create a dramatic, visible change to the dish
- Think about color, texture, shape, and overall appearance transformation
- Avoid subtle seasonings that don't change the visual - focus on elements that transform the look

CULINARY PAIRING LOGIC:
- Consider flavor profiles (delicate fish ≠ heavy sauces, robust meats = bold flavors)
- Think about cooking techniques (grilled items pair with different sides than poached)
- Match garnish intensity to dish complexity (simple proteins = elegant garnishes, hearty dishes = rustic elements)
- Consider texture contrasts (creamy dishes benefit from crunchy elements)
- Use seasonal and regional pairings that make culinary sense

Round progression should be:
1. Foundation/Protein (rack of lamb, filet mignon, tofu, chicken breast, salmon fillet, etc. - RAW ingredients)
2. Primary technique/style (grilled, poached, braised, roasted, seared, etc. - shows cooked state)
3. Visible sauce/coating (rich tomato sauce, creamy mushroom sauce, herb crust, glaze, etc. - dramatically changes appearance)
4. Substantial sides/accompaniments (roasted vegetables, risotto, pasta, polenta, etc. - adds major visual elements)
5. Bold finishing touches (fresh herbs, colorful garnishes, nuts, cheese, edible flowers, etc. - clear visual impact)

Return ONLY a JSON object with this exact structure:
{
  "round": ${currentRound},
  "question": "Question text here",
  "options": ["Option 1", "Option 2", "Option 3"],
  "imagePrompt": "What to add/change in the image for this round"
}`;

    console.log(`🎮 Generating game question - Round ${currentRound} for ${characterId}-${sceneId}`);
    console.log(`🔄 Previous choices: ${previousChoices.join(' → ')}`);

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
    });

    const responseText = result.response.text();
    
    // Parse JSON response - handle markdown code blocks
    let gameQuestion: GameQuestion;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      gameQuestion = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Invalid JSON response from AI');
    }

    console.log(`✅ Game question generated successfully - Round ${currentRound}`);

    return new Response(JSON.stringify(gameQuestion), {
      status: 200,
      headers: { "content-type": "application/json" }
    });

  } catch (error) {
    console.error('Game questions generation error:', error);
    return new Response(`Game questions generation error: ${error instanceof Error ? error.message : 'unknown error'}`, { status: 500 });
  }
}
