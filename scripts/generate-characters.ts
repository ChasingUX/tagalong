import "dotenv/config";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";

type GenCharacter = {
  id: string;
  name: string;
  role: string;
  tags: string[];
  description: string;
  imagePrompt: string;
};

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");
  const count = Number(process.env.COUNT || 100);
  const modelName = process.env.GEMINI_TEXT_MODEL || "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `Generate ${count} distinct assistant characters for a mobile AI app. Requirements:
- Vary styles: photorealistic, 3D, anime, illustration, painterly, pixel, etc.
- Each character should be framed as a consistent bust (head and shoulders) with neutral background and balanced lighting.
- Each JSON object must have: id (kebab-case unique), name, role (1-3 words), tags (4-7 strings), description (1 sentence), imagePrompt (succinct prompt focusing on bust framing, pose, style, lighting, color palette).
- Include many fields: chef, therapist, teacher, coder, designer, gardener, musician, barista, mechanic, astronaut, historian, etc.
- Output strictly as a JSON array, no prose.`;

  const res = await model.generateContent({ contents: [{ role: "user", parts: [{ text: prompt }] }] });
  const text = res.response.text();
  let json: GenCharacter[] = [];
  try {
    json = JSON.parse(text) as GenCharacter[];
  } catch {
    // Attempt to salvage JSON fenced code if present
    const match = text.match(/\[([\s\S]*)\]/);
    if (match) {
      json = JSON.parse(`[${match[1]}]`);
    } else {
      throw new Error("Model did not return valid JSON");
    }
  }

  // Basic validation and normalization
  const seen = new Set<string>();
  const clean = json
    .filter((c) => c && c.id && c.name && c.role && Array.isArray(c.tags) && c.description && c.imagePrompt)
    .map((c) => ({
      ...c,
      id: String(c.id).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-").replace(/^-|-$/g, ""),
      tags: c.tags.map((t) => String(t).toLowerCase()),
    }))
    .filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

  const outDir = path.join(process.cwd(), "data");
  const outFile = path.join(outDir, "characters.json");
  const imgDir = path.join(process.cwd(), "public", "characters");
  await mkdir(outDir, { recursive: true });
  await mkdir(imgDir, { recursive: true });
  await writeFile(outFile, JSON.stringify(clean, null, 2));
  // eslint-disable-next-line no-console
  console.log(`Wrote ${clean.length} characters to ${outFile}`);

  // Generate images for each character
  const imageModel = genAI.getGenerativeModel({ model: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image-preview" });
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    try {
      // eslint-disable-next-line no-console
      console.log(`Generating image ${i + 1}/${clean.length}: ${char.name}`);
      const prompt = `${char.imagePrompt}\n\nComposition: tight bust (head and shoulders), neutral uncluttered background, soft diffused three-point lighting, sharp focus, consistent framing.`;
      const res = await imageModel.generateContent(prompt);
      const data = res.response.candidates?.[0]?.content?.parts?.[0] as any;
      const base64 = data?.inlineData?.data as string | undefined;
      if (base64) {
        const buffer = Buffer.from(base64, "base64");
        const imgFile = path.join(imgDir, `${char.id}.png`);
        await writeFile(imgFile, buffer);
        // eslint-disable-next-line no-console
        console.log(`  ✓ Saved image: ${char.id}.png`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`  ✗ No image data for ${char.name}`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`  ✗ Error generating image for ${char.name}:`, err instanceof Error ? err.message : err);
    }
    // Add small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});