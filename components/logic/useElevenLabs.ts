import { useState, useCallback } from 'react';

interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  modelId?: string;
}

interface TTSResponse {
  audio: ArrayBuffer;
  success: boolean;
  error?: string;
}

export const useElevenLabs = (config: ElevenLabsConfig) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const synthesizeSpeech = useCallback(async (text: string): Promise<TTSResponse> => {
    if (!config.apiKey || !config.voiceId) {
      return {
        audio: new ArrayBuffer(0),
        success: false,
        error: 'Missing API key or voice ID'
      };
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': config.apiKey,
          },
          body: JSON.stringify({
            text: text,
            model_id: config.modelId || 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      
      return {
        audio: audioBuffer,
        success: true
      };
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      return {
        audio: new ArrayBuffer(0),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  const playAudio = useCallback(async (audioBuffer: ArrayBuffer) => {
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Create new audio element
      const audio = new Audio();
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      
      audio.src = url;
      audio.volume = 0.8;
      
      // Set up event handlers
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
        console.error('Audio playback error');
      };

      // Play the audio
      await audio.play();
      setCurrentAudio(audio);
      
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);
    }
  }, [currentAudio]);

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setIsPlaying(false);
    }
  }, [currentAudio]);

  const speak = useCallback(async (text: string) => {
    const result = await synthesizeSpeech(text);
    
    if (result.success) {
      await playAudio(result.audio);
    }
    
    return result;
  }, [synthesizeSpeech, playAudio]);

  return {
    speak,
    synthesizeSpeech,
    playAudio,
    stopAudio,
    isLoading,
    isPlaying,
    currentAudio
  };
};
