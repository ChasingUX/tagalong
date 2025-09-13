import { NextRequest } from "next/server";
import { CHARACTERS } from "@/lib/characters";
import { searchCharacters } from "@/lib/characters";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const results = q ? searchCharacters(q) : CHARACTERS;
  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}


