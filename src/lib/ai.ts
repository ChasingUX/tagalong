import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGenAI() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_API_KEY env var");
  }
  return new GoogleGenerativeAI(apiKey);
}

export function getTextModel() {
  const modelName = process.env.GEMINI_TEXT_MODEL || "gemini-2.0-flash-exp";
  return getGenAI().getGenerativeModel({ model: modelName });
}

export function getImageModel() {
  const modelName = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image-preview";
  return getGenAI().getGenerativeModel({ model: modelName });
}

export async function arrayBufferToBase64(buf: ArrayBuffer): Promise<string> {
  const bytes = Buffer.from(buf);
  return bytes.toString("base64");
}


