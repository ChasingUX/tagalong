import { NextRequest } from "next/server";
import { getImageModel } from "@/lib/ai";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt");
  if (!prompt) {
    return new Response("prompt required", { status: 400 });
  }

  if (!process.env.GOOGLE_API_KEY || process.env.DISABLE_IMAGE_GEN === "1") {
    return new Response("image generation disabled", { status: 503 });
  }

  try {
    const model = getImageModel();
    const res = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${prompt}\n\nFront facing close-up shot showing head and shoulders with a little clearance above the head. Full bleed composition. The style is vibrant, and realistic — not photorealistic, but very close to it. Character should contrast nicely with the background. Background should include very subtle suggestions of the character's environment. These background hints shouldn't compete with or distract from the character. Clothing, hats, or accessories subtly suggest the character's role. Beautiful color combinations with an emphasis on pastel, earth tones, and lighter shades. Balanced lighting, expressive eyes.`,
            },
          ],
        },
      ],
      // Don't specify responseMimeType for image generation
    });
    
    const candidate = res.response.candidates?.[0];
    if (!candidate?.content?.parts) {
      throw new Error("No content parts in response");
    }
    
    // Look for inline image data
    const imagePart = candidate.content.parts.find((part: any) => part.inlineData?.mimeType?.startsWith('image/'));
    if (!imagePart?.inlineData?.data) {
      console.error("No image data found. Response structure:", JSON.stringify(res.response, null, 2));
      throw new Error("No image data found in response");
    }
    
    const base64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const buffer = Buffer.from(base64, "base64");
    
    return new Response(buffer, { 
      status: 200, 
      headers: { "content-type": mimeType } 
    });
  } catch (e) {
    console.error("Character image generation error:", e);
    return new Response(`image generation error: ${e}`, { status: 500 });
  }
}
