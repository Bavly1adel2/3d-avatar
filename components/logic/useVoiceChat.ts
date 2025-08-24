import { useCallback, useState, useEffect } from "react";

import { useStreamingAvatarContext } from "./context";

export const useVoiceChat = () => {
  const {
    avatarRef,
    isMuted,
    setIsMuted,
    isVoiceChatActive,
    setIsVoiceChatActive,
    isVoiceChatLoading,
    setIsVoiceChatLoading,
  } = useStreamingAvatarContext();

  const [microphoneAvailable, setMicrophoneAvailable] = useState<boolean | null>(null);
  const [microphonePermission, setMicrophonePermission] = useState<PermissionState | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Check microphone availability on mount
  useEffect(() => {
    const checkMicrophoneAvailability = async () => {
      try {
        setDebugInfo(prev => [...prev, "Checking microphone availability..."]);
        
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setDebugInfo(prev => [...prev, "getUserMedia not supported"]);
          setMicrophoneAvailable(false);
          return;
        }

        // Check for available audio devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioDevices = devices.filter(device => device.kind === 'audioinput');
        
        setDebugInfo(prev => [...prev, `Found ${audioDevices.length} audio input devices`]);
        
        if (audioDevices.length === 0) {
          setDebugInfo(prev => [...prev, "No audio input devices found"]);
          setMicrophoneAvailable(false);
          return;
        }

        // Check permission status
        if (navigator.permissions) {
          try {
            const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setDebugInfo(prev => [...prev, `Microphone permission: ${permissionStatus.state}`]);
            setMicrophonePermission(permissionStatus.state);
            
            // Listen for permission changes
            permissionStatus.onchange = () => {
              setDebugInfo(prev => [...prev, `Permission changed to: ${permissionStatus.state}`]);
              setMicrophonePermission(permissionStatus.state);
            };
          } catch (error) {
            setDebugInfo(prev => [...prev, `Could not check permission: ${error}`]);
            console.warn("Could not check microphone permission:", error);
          }
        } else {
          setDebugInfo(prev => [...prev, "Permissions API not supported"]);
        }

        setMicrophoneAvailable(true);
        setDebugInfo(prev => [...prev, "Microphone check completed successfully"]);
      } catch (error) {
        setDebugInfo(prev => [...prev, `Error checking microphone: ${error}`]);
        console.warn("Error checking microphone availability:", error);
        setMicrophoneAvailable(false);
      }
    };

    checkMicrophoneAvailability();
  }, []);

  const startVoiceChat = useCallback(
    async (isInputAudioMuted?: boolean) => {
      if (!avatarRef.current) {
        setDebugInfo(prev => [...prev, "No avatar reference available"]);
        throw new Error("Avatar session not started. Please start the session first.");
      }

      setDebugInfo(prev => [...prev, "Starting voice chat..."]);

      // Check microphone availability
      if (microphoneAvailable === false) {
        setDebugInfo(prev => [...prev, "Microphone not available"]);
        throw new Error("No microphone detected. Please connect a microphone and try again.");
      }

      // Check microphone permission
      if (microphonePermission === 'denied') {
        setDebugInfo(prev => [...prev, "Microphone permission denied"]);
        throw new Error("Microphone permission denied. Please enable microphone access in your browser settings.");
      }
      
      try {
        setIsVoiceChatLoading(true);
        setDebugInfo(prev => [...prev, "Testing microphone access..."]);
        
        // Simple microphone test with minimal constraints
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            } 
          });
          setDebugInfo(prev => [...prev, "Microphone access test successful"]);
          testStream.getTracks().forEach(track => track.stop()); // Clean up test stream
        } catch (error) {
          setDebugInfo(prev => [...prev, `Microphone test failed: ${error}`]);
          if (error instanceof Error) {
            if (error.name === 'NotFoundError') {
              throw new Error("No microphone found. Please connect a microphone and try again.");
            } else if (error.name === 'NotAllowedError') {
              throw new Error("Microphone access denied. Please allow microphone access and try again.");
            } else if (error.name === 'NotReadableError') {
              throw new Error("Microphone is in use by another application. Please close other applications using the microphone.");
            } else {
              throw new Error(`Microphone error: ${error.message}`);
            }
          }
          throw error;
        }
        
        setDebugInfo(prev => [...prev, "Waiting for audio system to stabilize..."]);
        // Simple delay without complex audio context management
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setDebugInfo(prev => [...prev, "Starting avatar voice chat..."]);
        
        // Try to start voice chat with the HeyGen SDK
        try {
          await avatarRef.current?.startVoiceChat({
            isInputAudioMuted,
          });
          
          setDebugInfo(prev => [...prev, "Voice chat started successfully"]);
          setIsVoiceChatLoading(false);
          setIsVoiceChatActive(true);
          setIsMuted(!!isInputAudioMuted);
        } catch (avatarError) {
          setDebugInfo(prev => [...prev, `Avatar voice chat failed: ${avatarError}`]);
          
          // Provide specific guidance based on error type
          if (avatarError instanceof Error) {
            const errorMessage = avatarError.message.toLowerCase();
            
            if (errorMessage.includes("sample-rate") || errorMessage.includes("audio context") || errorMessage.includes("configuration")) {
              throw new Error("Audio configuration issue detected. This is a known compatibility issue. Please try: 1) Refresh the page, 2) Use Chrome/Edge browser, 3) Check microphone permissions, 4) Restart your browser.");
            } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
              throw new Error("Connection error. Please check your internet connection and try again.");
            } else if (errorMessage.includes("token") || errorMessage.includes("auth")) {
              throw new Error("Authentication error. Please refresh the page and try again.");
            } else if (errorMessage.includes("session") || errorMessage.includes("avatar")) {
              throw new Error("Session error. Please restart the avatar session and try again.");
            } else {
              throw new Error(`Voice chat error: ${avatarError.message}`);
            }
          }
          
          throw avatarError;
        }
        
      } catch (error) {
        setDebugInfo(prev => [...prev, `Voice chat error: ${error}`]);
        console.error("Error starting voice chat:", error);
        setIsVoiceChatLoading(false);
        throw error;
      }
    },
    [avatarRef, setIsMuted, setIsVoiceChatActive, setIsVoiceChatLoading, microphoneAvailable, microphonePermission],
  );

  const stopVoiceChat = useCallback(() => {
    if (!avatarRef.current) return;
    try {
      setDebugInfo(prev => [...prev, "Stopping voice chat..."]);
      avatarRef.current?.closeVoiceChat();
      setIsVoiceChatActive(false);
      setIsMuted(true);
      setDebugInfo(prev => [...prev, "Voice chat stopped"]);
    } catch (error) {
      setDebugInfo(prev => [...prev, `Error stopping voice chat: ${error}`]);
      console.error("Error stopping voice chat:", error);
    }
  }, [avatarRef, setIsMuted, setIsVoiceChatActive]);

  const muteInputAudio = useCallback(() => {
    if (!avatarRef.current) return;
    try {
      setDebugInfo(prev => [...prev, "Muting input audio..."]);
      avatarRef.current?.muteInputAudio();
      setIsMuted(true);
      setDebugInfo(prev => [...prev, "Input audio muted"]);
    } catch (error) {
      setDebugInfo(prev => [...prev, `Error muting audio: ${error}`]);
      console.error("Error muting input audio:", error);
    }
  }, [avatarRef, setIsMuted]);

  const unmuteInputAudio = useCallback(() => {
    if (!avatarRef.current) return;
    try {
      setDebugInfo(prev => [...prev, "Unmuting input audio..."]);
      avatarRef.current?.unmuteInputAudio();
      setIsMuted(false);
      setDebugInfo(prev => [...prev, "Input audio unmuted"]);
    } catch (error) {
      setDebugInfo(prev => [...prev, `Error unmuting audio: ${error}`]);
      console.error("Error unmuting input audio:", error);
    }
  }, [avatarRef, setIsMuted]);

  return {
    startVoiceChat,
    stopVoiceChat,
    muteInputAudio,
    unmuteInputAudio,
    isMuted,
    isVoiceChatActive,
    isVoiceChatLoading,
    microphoneAvailable,
    microphonePermission,
    debugInfo,
  };
};
