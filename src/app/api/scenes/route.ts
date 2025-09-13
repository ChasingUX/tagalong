import { NextRequest } from "next/server";
import { generateScenes } from "@/lib/scenes";
import { getCharacter } from "@/lib/characters";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const characterId = searchParams.get("characterId");
  if (!characterId) {
    return new Response(JSON.stringify({ error: "characterId required" }), {
      status: 400,
    });
  }

  const character = getCharacter(characterId);
  if (!character) {
    return new Response(JSON.stringify({ error: "character not found" }), {
      status: 404,
    });
  }

  try {
    const scenes = await generateScenes(character);
    return new Response(JSON.stringify(scenes), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error('Error generating scenes:', error);
    return new Response(JSON.stringify({ error: "failed to generate scenes" }), {
      status: 500,
    });
  }
}


