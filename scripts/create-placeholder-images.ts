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

// Create a simple SVG placeholder
function createPlaceholderSVG(name: string, role: string): string {
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase();
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
  ];
  const color = colors[name.length % colors.length];
  
  return `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" fill="${color}"/>
    <text x="200" y="180" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="80" font-weight="bold">${initials}</text>
    <text x="200" y="240" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" opacity="0.9">${name}</text>
    <text x="200" y="270" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" opacity="0.7">${role}</text>
  </svg>`;
}

function createPlaceholderImage(character: any) {
  const imagePath = path.join(PUBLIC_CHARACTERS_DIR, `${character.id}.png`);
  
  // Skip if image already exists
  if (fs.existsSync(imagePath)) {
    console.log(`⏭️  Skipping ${character.name} - image already exists`);
    return;
  }

  console.log(`🎨 Creating placeholder for ${character.name}...`);
  
  // For now, create SVG files (browsers can display them)
  const svgPath = path.join(PUBLIC_CHARACTERS_DIR, `${character.id}.svg`);
  const svgContent = createPlaceholderSVG(character.name, character.role);
  
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Created placeholder for ${character.name}`);
}

function createAllPlaceholders() {
  console.log("🚀 Creating placeholder images...");
  ensureCharactersDir();
  
  for (const character of PREDEFINED_CHARACTERS) {
    createPlaceholderImage(character);
  }
  
  console.log("✅ Placeholder creation complete!");
  console.log("💡 Note: Set GOOGLE_API_KEY in .env to enable real image generation");
}

createAllPlaceholders();
