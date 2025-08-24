// ElevenLabs Configuration
export const ELEVENLABS_CONFIG = {
  // Get your API key from: https://elevenlabs.io/
  API_KEY: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || '',
  
  // Default voice ID - you can change this to any voice from your ElevenLabs account
  DEFAULT_VOICE_ID: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM', // Rachel voice
  
  // Available model IDs
  MODELS: {
    MONOLINGUAL: 'eleven_monolingual_v1',
    MULTILINGUAL: 'eleven_multilingual_v1',
    TURBO: 'eleven_turbo_v2'
  },
  
  // Voice settings
  VOICE_SETTINGS: {
    stability: 0.5,        // 0-1: Higher = more stable
    similarity_boost: 0.5, // 0-1: Higher = more similar to original voice
    style: 0.0,            // 0-1: Higher = more expressive
    use_speaker_boost: true
  }
};

// Popular ElevenLabs voices (you can use any of these IDs)
export const POPULAR_VOICES = {
  RACHEL: '21m00Tcm4TlvDq8ikWAM',    // Female, clear, professional
  DOMI: 'AZnzlk1XvdvUeBnXmlld',      // Female, warm, friendly
  BELLA: 'EXAVITQu4vr4xnSDxMaL',     // Female, soft, gentle
  ANTONI: 'ErXwobaYiN1P8YdB9Qj',     // Male, deep, authoritative
  THOMAS: 'GBv7mTt0atIp3Br8iCZE',    // Male, clear, professional
  JOSH: 'TxGEqnHWrfWFTfGW9XjX',      // Male, warm, friendly
  ARNOLD: 'VR6AewLTigWG4xSOukaG',    // Male, deep, strong
  ADAM: 'pNInz6obpgDQGcFmaJgB',      // Male, clear, neutral
  SAM: 'yoZ06aMxZJJ28mfd3POQ'        // Male, young, energetic
};

// Helper function to get voice name from ID
export const getVoiceName = (voiceId: string): string => {
  const voiceNames: Record<string, string> = {
    [POPULAR_VOICES.RACHEL]: 'Rachel',
    [POPULAR_VOICES.DOMI]: 'Domi',
    [POPULAR_VOICES.BELLA]: 'Bella',
    [POPULAR_VOICES.ANTONI]: 'Antoni',
    [POPULAR_VOICES.THOMAS]: 'Thomas',
    [POPULAR_VOICES.JOSH]: 'Josh',
    [POPULAR_VOICES.ARNOLD]: 'Arnold',
    [POPULAR_VOICES.ADAM]: 'Adam',
    [POPULAR_VOICES.SAM]: 'Sam'
  };
  
  return voiceNames[voiceId] || 'Unknown Voice';
};
