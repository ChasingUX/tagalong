const fs = require('fs');
const path = require('path');

async function generateBaseImage() {
  // Customizable prompt - modify this to adjust the base image
  const prompt = "Closeup of hands holding an empty clean white plate, organized Italian kitchen background with warm wood cabinets, copper pots hanging softly out of focus, small potted herbs, and natural window lighting. Do not show a face, make sure it is a closeup of the plate. Square aspect ratio, high quality, photorealistic style.";

  try {
    console.log('🎨 Generating base cooking image...');
    console.log('📝 Prompt:', prompt);
    
    const response = await fetch('http://localhost:3000/api/game-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        characterId: 'chef-nomi-delgado',
        sceneId: 'base',
        round: 0,
        previousChoices: [],
        currentPrompt: prompt,
        baseImageData: null
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const outputPath = path.join(__dirname, 'public', 'game-base', 'cooking-showdown-base.jpg');
    
    fs.writeFileSync(outputPath, Buffer.from(imageBuffer));
    console.log(`✅ Base image saved to: ${outputPath}`);
    console.log(`📏 Image size: ${Math.round(imageBuffer.byteLength / 1024)}KB`);
    
  } catch (error) {
    console.error('❌ Error generating base image:', error);
  }
}

// Instructions for customizing the image:
console.log(`
🎨 Base Image Generator
======================

To customize the image, modify the 'prompt' variable above.

Current settings:
- Style: Professional cooking workspace
- Plate: White ceramic dinner plate
- Angle: 3/4 view
- Background: Italian kitchen with warm wood, copper pots, herbs
- Lighting: Natural window lighting
- Format: Square aspect ratio, high quality

Example modifications:
- Change plate color: "pristine black ceramic dinner plate"
- Adjust lighting: "dramatic studio lighting" or "soft candlelight"
- Modify background: "modern minimalist kitchen" or "rustic farmhouse kitchen"
- Change angle: "overhead shot" or "straight-on view"

Run with: node generate-base-image.js
`);

generateBaseImage();
