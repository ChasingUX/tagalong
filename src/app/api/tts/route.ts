import { NextRequest } from "next/server";
import { getCharacterVoiceId } from "@/lib/voiceMapping";

const PLAY_AI_AUTH_KEY = process.env.PLAY_AI_AUTH_KEY;

// Function to clean voice directions from text
function cleanVoiceDirections(text: string): string {
  // Remove voice directions in parentheses like "(Warm, enthusiastic voice)" or "(Excited tone)"
  const cleaned = text
    .replace(/\([^)]*voice[^)]*\)/gi, '') // Remove anything in parentheses containing "voice"
    .replace(/\([^)]*tone[^)]*\)/gi, '')  // Remove anything in parentheses containing "tone"
    .replace(/\([^)]*enthusiastic[^)]*\)/gi, '') // Remove enthusiastic directions
    .replace(/\([^)]*warm[^)]*\)/gi, '')  // Remove warm directions
    .replace(/\([^)]*excited[^)]*\)/gi, '') // Remove excited directions
    .replace(/\([^)]*cheerful[^)]*\)/gi, '') // Remove cheerful directions
    .replace(/\([^)]*friendly[^)]*\)/gi, '') // Remove friendly directions
    .replace(/\([^)]*softly[^)]*\)/gi, '') // Remove softly directions
    .replace(/\([^)]*gently[^)]*\)/gi, '') // Remove gently directions
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .trim();
  
  return cleaned;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { text, characterId } = body as {
    text: string;
    characterId?: string;
  };

  if (!text || !text.trim()) {
    return new Response(JSON.stringify({ error: "Text is required" }), { status: 400 });
  }

  if (!PLAY_AI_AUTH_KEY) {
    console.error('PLAY_AI_AUTH_KEY environment variable not set');
    return new Response(JSON.stringify({ error: "TTS service not configured" }), { status: 500 });
  }

  try {
    // Clean voice directions from text
    const cleanedText = cleanVoiceDirections(text);
    
    // Get the appropriate voice for this character
    const voiceId = characterId ? getCharacterVoiceId(characterId) : getCharacterVoiceId('default');
    
    console.log(`🎵 TTS API: Received TTS request for character: ${characterId}`);
    console.log(`📝 TTS API: Original text: "${text.trim()}"`);
    if (cleanedText !== text.trim()) {
      console.log(`✨ TTS API: Cleaned text: "${cleanedText}"`);
    }
    console.log(`🎙️ TTS API: Using voice ID: ${voiceId}`);
    console.log(`🎵 TTS API: Sending request to Play.ai...`);

    // Create TTS request to Play.ai
    const response = await fetch('https://api.play.ht/playht-fal/playht-tts-ldm/stream', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PLAY_AI_AUTH_KEY}`,
        'accept': '*/*',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        text: cleanedText,
        voice: voiceId,
        output_format: 'wav',
        voice_engine: 'PlayDialog',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`🎵 TTS API: Play.ai API error: ${response.status} - ${errorText}`);
      throw new Error(`Play.ai API error: ${response.status}`);
    }

    console.log(`🎵 TTS API: Play.ai responded successfully`);

    // Get the audio stream as buffer
    const audioBuffer = await response.arrayBuffer();
    
    if (audioBuffer.byteLength === 0) {
      console.error(`🎵 TTS API: Received empty audio response from Play.ai`);
      throw new Error('Received empty audio response');
    }
    
    console.log(`🎵 TTS API: Received ${audioBuffer.byteLength} bytes of audio from Play.ai`);
    
    // Convert to base64 for easy transmission
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/wav;base64,${base64Audio}`;
    
    console.log(`🎵 TTS API: Successfully converted audio to base64 (${base64Audio.length} characters)`);
    console.log(`🎵 TTS API: Returning TTS response to client`);
    
    return new Response(JSON.stringify({ 
      audioUrl: audioDataUrl,
      format: 'wav',
      characterId: characterId,
      voiceId: voiceId,
      textLength: cleanedText.length,
      originalTextLength: text.length
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  } catch (error) {
    console.error('TTS Error:', error);
    
    // Return different error messages based on the error type
    let errorMessage = "Failed to generate speech";
    if (error instanceof Error) {
      if (error.message.includes('Play.ai API error: 401')) {
        errorMessage = "TTS authentication failed";
      } else if (error.message.includes('Play.ai API error: 429')) {
        errorMessage = "TTS rate limit exceeded";
      } else if (error.message.includes('empty audio response')) {
        errorMessage = "TTS generated empty audio";
      }
    }
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ 
    status: "TTS API is running",
    configured: !!PLAY_AI_AUTH_KEY,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
