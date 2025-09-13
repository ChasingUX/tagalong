#!/usr/bin/env tsx

import { PREDEFINED_CHARACTERS } from "../src/lib/predefinedCharacters";
import fs from "fs";
import path from "path";

const PUBLIC_CHARACTERS_DIR = path.join(process.cwd(), 'public', 'characters');

// Ensure characters directory exists
function ensureCharactersDir() {
  if (!fs.existsSync(PUBLIC_CHARACTERS_DIR)) {
    fs.mkdirSync(PUBLIC_CHARACTERS_DIR, { recursive: true });
  }
}

async function generateCharacterImage(character: any) {
  const imagePath = path.join(PUBLIC_CHARACTERS_DIR, `${character.id}.png`);
  
  // Skip if image already exists
  if (fs.existsSync(imagePath)) {
    console.log(`⏭️  Skipping ${character.name} - image already exists`);
    return;
  }

  console.log(`🎨 Generating image for ${character.name}...`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/character-image?prompt=${encodeURIComponent(character.imagePrompt)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
    
    console.log(`✅ Generated image for ${character.name} (${Math.round(imageBuffer.byteLength / 1024)}KB)`);
  } catch (error) {
    console.error(`❌ Failed to generate image for ${character.name}:`, error);
  }
}

async function generateAllCharacterImages() {
  console.log("🚀 Starting character image generation...");
  ensureCharactersDir();
  
  for (const character of PREDEFINED_CHARACTERS) {
    await generateCharacterImage(character);
    // Add a small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log("✅ Character image generation complete!");
}

generateAllCharacterImages().catch(console.error);
