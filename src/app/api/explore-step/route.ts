import { NextRequest, NextResponse } from 'next/server';
import { getImageModel, getTextModel } from '@/lib/ai';
import { getExploreData } from '@/lib/exploreData';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { 
      characterId, 
      tourId, 
      stopId, 
      depth = 0,
      previousChoices = []
    } = await request.json();

    if (!characterId || !tourId || !stopId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the explore data
    const exploreData = getExploreData(characterId, tourId);
    if (!exploreData) {
      return NextResponse.json(
        { error: 'Tour not found' },
        { status: 404 }
      );
    }

    // Find the specific stop
    const stop = exploreData.find(s => s.id === stopId);
    if (!stop) {
      return NextResponse.json(
        { error: 'Stop not found' },
        { status: 404 }
      );
    }

    // Determine the content based on depth
    let imagePrompt: string;
    let title: string;
    let description: string;

    if (depth === 0) {
      imagePrompt = stop.imagePrompt;
      title = stop.title;
      description = stop.description;
    } else if (depth === 1 && stop.goDeeper?.level1) {
      imagePrompt = stop.goDeeper.level1.imagePrompt;
      title = stop.goDeeper.level1.title;
      description = stop.goDeeper.level1.description;
    } else if (depth === 2 && stop.goDeeper?.level2) {
      imagePrompt = stop.goDeeper.level2.imagePrompt;
      title = stop.goDeeper.level2.title;
      description = stop.goDeeper.level2.description;
    } else {
      return NextResponse.json(
        { error: 'Invalid depth or deeper content not available' },
        { status: 400 }
      );
    }

    // Add context from previous choices
    let contextualPrompt = imagePrompt;
    if (previousChoices.length > 0) {
      const choiceContext = previousChoices.join(', ');
      contextualPrompt = `${imagePrompt}. Building on previous tour experiences: ${choiceContext}`;
    }

    // Enhance prompt for portrait orientation
    const portraitPrompt = `${contextualPrompt}

CRITICAL: Generate this image in PORTRAIT orientation (9:16 aspect ratio - taller than wide). 
Think of it as a vertical phone wallpaper or TikTok video frame. 
Compose the scene so the main subject fills the tall vertical frame, optimized for mobile viewing.`;

    console.log('🖼️ Generating explore step:', {
      characterId,
      tourId,
      stopId,
      depth,
      title
    });

    if (!process.env.GOOGLE_API_KEY || process.env.DISABLE_IMAGE_GEN === "1") {
      return NextResponse.json(
        { error: 'Image generation disabled' },
        { status: 503 }
      );
    }

    // Generate image and voice description in parallel
    const [imageUrl, voiceDescription] = await Promise.all([
      // Generate image
      (async () => {
        try {
          const imageModel = getImageModel();
          
          // Get character image as base
          const characterImagePath = path.join(process.cwd(), 'public', 'characters', `${characterId}.png`);
          if (!fs.existsSync(characterImagePath)) {
            throw new Error(`Character image not found: ${characterId}.png`);
          }
          
          const imageBuffer = fs.readFileSync(characterImagePath);
          const imageBase64 = imageBuffer.toString('base64');
          
          console.log('🖼️ Starting image generation...');
          
          const result = await imageModel.generateContent([
            {
              inlineData: {
                data: imageBase64,
                mimeType: "image/png"
              }
            },
            { text: portraitPrompt }
          ]);
          
          const response = result.response;
          const generatedImageData = response.candidates?.[0]?.content?.parts?.[0] as any;
          
          if (!generatedImageData?.inlineData?.data) {
            console.error('❌ No image data returned from Gemini');
            return null;
          }
          
          console.log('✅ Image generated successfully');
          return `data:image/png;base64,${generatedImageData.inlineData.data}`;
        } catch (error) {
          console.error('Image generation error:', error);
          return null;
        }
      })(),
      
      // Generate voice description
      (async () => {
        try {
          const textModel = getTextModel();
          
          const visualPrompt = `You are Chef Nomi at ${title} in Venice. Based on this visual scene: "${imagePrompt}", describe in a few short sentences what you see happening right now. Focus on the most striking visual or sensory detail from the scene. Be immediate, present, and paint a vivid picture with your words.`;
          
          console.log('🎙️ Starting voice description generation...');
          
          const result = await textModel.generateContent({
            contents: [
              { role: "user", parts: [{ text: visualPrompt }] }
            ]
          });
          
          const voiceText = result.response.text() || null;
          console.log('✅ Voice description generated:', voiceText);
          return voiceText;
        } catch (error) {
          console.error('Voice description generation error:', error);
          return null;
        }
      })()
    ]);

    // Return results
    return NextResponse.json({
      imageUrl,
      voiceDescription,
      title,
      description,
      stopId,
      depth
    });

  } catch (error) {
    console.error('Error in explore-step API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate step content',
        debug: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}