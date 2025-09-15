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
  // Updated with custom voice IDs for each character
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
    voiceId: 's3://voice-cloning-zero-shot/2bfe78e3-a35f-4d30-b297-786bbcc730cd/original/manifest.json',
    name: 'Jax Rivera Voice',
    description: 'Creative, artistic voice'
  },
  'professor-ada-quill': {
    voiceId: 's3://voice-cloning-zero-shot/3a831d1f-2183-49de-b6d8-33f16b2e9867/dylansaad/manifest.json',
    name: 'Professor Ada Quill Voice',
    description: 'Academic, thoughtful voice'
  },
  'miles-cutter': {
    voiceId: 's3://voice-cloning-zero-shot/1bbc6986-fadf-4bd8-98aa-b86fed0476e9/original/manifest.json',
    name: 'Miles Cutter Voice',
    description: 'Sharp, precise voice'
  },
  'lola-starr': {
    voiceId: 's3://voice-cloning-zero-shot/3ab925e7-1c12-4906-bfa7-3c52ea1b4cfe/original/manifest.json',
    name: 'Lola Starr Voice',
    description: 'Bright, charismatic voice'
  },
  'dr-elias-archivus': {
    voiceId: 's3://voice-cloning-zero-shot/abc2d0e6-9433-4dcc-b416-0b035169f37e/original/manifest.json',
    name: 'Dr. Elias Archivus Voice',
    description: 'Scholarly, authoritative voice'
  },
  'terra-novak': {
    voiceId: 's3://voice-cloning-zero-shot/640a6636-dc16-4911-b75a-1549daae2c71/original/manifest.json',
    name: 'Terra Novak Voice',
    description: 'Adventurous, confident voice'
  },
  'riff-kwan': {
    voiceId: 's3://voice-cloning-zero-shot/87f7bb03-6551-4d80-84e8-b1ed3089a6cb/original/manifest.json',
    name: 'Riff Kwan Voice',
    description: 'Musical, rhythmic voice'
  },
  'sage-ellison': {
    voiceId: 's3://voice-cloning-zero-shot/a0fa25cc-5f42-4dd0-8a78-a950dd5297cd/original/manifest.json',
    name: 'Sage Ellison Voice',
    description: 'Wise, calming voice'
  },
  'mira-solange': {
    voiceId: 's3://voice-cloning-zero-shot/adb83b67-8d75-48ff-ad4d-a0840d231ef1/original/manifest.json',
    name: 'Mira Solange Voice',
    description: 'Sophisticated, analytical voice'
  },
  'pixel-patch': {
    voiceId: 's3://voice-cloning-zero-shot/30248400-25d1-47b0-9f08-c7abfa104ceb/original/manifest.json',
    name: 'Pixel Patch Voice',
    description: 'Playful, energetic voice'
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

