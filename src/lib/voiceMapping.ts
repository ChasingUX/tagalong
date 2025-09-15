// Character voice mapping for Play.ai TTS
// Each character can have a unique voice ID from Play.ai voice library

export interface VoiceConfig {
  voiceId: string;
  name: string;
  description?: string;
}

// Default voice to use when character doesn't have a specific mapping
export const DEFAULT_VOICE: VoiceConfig = {
  voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
  name: 'Default Voice',
  description: 'Default character voice'
};

// Character ID to voice mapping
// You can update these voice IDs from the Play.ai voice library: https://app.play.ht/voices/voice-library
export const CHARACTER_VOICE_MAP: Record<string, VoiceConfig> = {
  // Example mappings - replace with actual character IDs and desired voices
  'chef-gusteau': {
    voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
    name: 'Chef Gusteau Voice',
    description: 'Warm, authoritative chef voice'
  },
  'chef-nomi-delgado': {
    voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
    name: 'Chef Nomi Voice',
    description: 'Energetic, passionate chef voice'
  },
  'chef-rin': {
    voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
    name: 'Chef Rin Voice',
    description: 'Precise, technical chef voice'
  },
  'jax-rivera': {
    voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
    name: 'Jax Rivera Voice',
    description: 'Creative, artistic voice'
  },
  'mira-solange': {
    voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
    name: 'Mira Solange Voice',
    description: 'Sophisticated, analytical voice'
  },
  'pixel-patch': {
    voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
    name: 'Pixel Patch Voice',
    description: 'Playful, energetic voice'
  },
  'professor-ada-quill': {
    voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
    name: 'Professor Ada Quill Voice',
    description: 'Academic, thoughtful voice'
  },
  'riff-kwan': {
    voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
    name: 'Riff Kwan Voice',
    description: 'Musical, rhythmic voice'
  },
  'sage-ellison': {
    voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
    name: 'Sage Ellison Voice',
    description: 'Wise, calming voice'
  },
  'terra-novak': {
    voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
    name: 'Terra Novak Voice',
    description: 'Adventurous, confident voice'
  }
};

/**
 * Get the voice configuration for a character
 * @param characterId - The character ID to get voice for
 * @returns VoiceConfig object with voice ID and metadata
 */
export function getCharacterVoice(characterId: string): VoiceConfig {
  return CHARACTER_VOICE_MAP[characterId] || DEFAULT_VOICE;
}

/**
 * Get just the voice ID for a character (convenience function)
 * @param characterId - The character ID to get voice for
 * @returns Voice ID string for Play.ai API
 */
export function getCharacterVoiceId(characterId: string): string {
  return getCharacterVoice(characterId).voiceId;
}

/**
 * Update a character's voice mapping
 * @param characterId - Character ID to update
 * @param voiceConfig - New voice configuration
 */
export function updateCharacterVoice(characterId: string, voiceConfig: VoiceConfig): void {
  CHARACTER_VOICE_MAP[characterId] = voiceConfig;
}

/**
 * Get all available character voice mappings
 * @returns Record of all character voice mappings
 */
export function getAllCharacterVoices(): Record<string, VoiceConfig> {
  return { ...CHARACTER_VOICE_MAP };
}

