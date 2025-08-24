import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import React, { useState } from "react";
import { StartAvatarRequest } from "@heygen/streaming-avatar";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";

import { AudioInput } from "./AudioInput";
import { TextInput } from "./TextInput";

interface AvatarControlsProps {
  config: StartAvatarRequest;
}

const MicrophoneHelpMessage: React.FC<{ status: string }> = ({ status }) => {
  const [showHelp, setShowHelp] = useState(false);

  const getHelpContent = () => {
    switch (status) {
      case "No microphone detected":
        return (
          <div className="space-y-2">
            <p className="text-sm">To use voice chat, you need a microphone:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Connect a USB microphone or headset</li>
              <li>• Use your device's built-in microphone</li>
              <li>• Check that your microphone is not disabled in system settings</li>
            </ul>
          </div>
        );
      case "Microphone access denied":
        return (
          <div className="space-y-2">
            <p className="text-sm">To enable microphone access:</p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Click the microphone icon in your browser's address bar</li>
              <li>• Select "Allow" when prompted</li>
              <li>• Or go to browser settings → Privacy → Site permissions → Microphone</li>
            </ul>
          </div>
        );
      case "Microphone permission needed":
        return (
          <div className="space-y-2">
            <p className="text-sm">Click "Voice Chat" to grant microphone permission when prompted.</p>
          </div>
        );
      default:
        return null;
    }
  };

  const helpContent = getHelpContent();
  if (!helpContent) return null;

  return (
    <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-2 w-full">
      <div className="flex items-start gap-2">
        <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-sm">{status}</span>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-blue-400 hover:text-blue-300 text-xs underline"
            >
              {showHelp ? "Hide help" : "Show help"}
            </button>
          </div>
          {showHelp && (
            <div className="mt-2 text-blue-300">
              {helpContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const AvatarControls: React.FC<AvatarControlsProps> = ({ config }) => {
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    stopVoiceChat,
    microphoneAvailable,
    microphonePermission,
  } = useVoiceChat();
  const { interrupt } = useInterrupt();
  const [error, setError] = useState<string | null>(null);

  const handleVoiceChatToggle = async (value: string) => {
    setError(null); // Clear any previous errors
    
    if (value === "voice" && !isVoiceChatActive && !isVoiceChatLoading) {
      try {
        await startVoiceChat();
      } catch (error) {
        console.error("Failed to start voice chat:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to start voice chat";
        
        // Check if it's an audio configuration error that might need session restart
        if (errorMessage.includes("Audio configuration issue") || errorMessage.includes("compatibility issue")) {
          setError(`${errorMessage} 

🔄 **Recommended Solution:** 
1. Click "Stop Session" to end the current avatar session
2. Click "Start Interactive Session" to create a fresh session
3. Try voice chat again

This will reset the audio context and resolve compatibility issues.`);
        } else {
          setError(errorMessage);
        }
      }
    } else if (
      value === "text" &&
      isVoiceChatActive &&
      !isVoiceChatLoading
    ) {
      stopVoiceChat();
    }
  };

  const getVoiceChatStatus = () => {
    if (microphoneAvailable === false) {
      return "No microphone detected";
    }
    if (microphonePermission === 'denied') {
      return "Microphone access denied";
    }
    if (microphonePermission === 'prompt') {
      return "Microphone permission needed";
    }
    return null;
  };

  const voiceChatStatus = getVoiceChatStatus();
  // Only disable voice chat if no microphone is available or if it's denied
  // Allow clicking when permission is needed (prompt state)
  const isVoiceChatDisabled = (microphoneAvailable === false || microphonePermission === 'denied') || isVoiceChatLoading;

  // Show prominent microphone permission message
  const showMicrophoneMessage = microphonePermission === 'prompt' && !isVoiceChatActive;

  return (
    <div className="flex flex-col gap-3 relative w-full items-center">
      {/* Prominent Microphone Permission Message */}
      {showMicrophoneMessage && (
        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border-2 border-blue-500/50 rounded-xl p-4 w-full max-w-lg text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-blue-300 font-bold text-lg mb-2">🎤 Enable Voice Chat</h3>
              <p className="text-blue-200 text-sm mb-3">
                Click the "Voice Chat" button below to grant microphone permission
              </p>
              <div className="bg-blue-800/30 rounded-lg p-3 border border-blue-400/30">
                <p className="text-blue-100 text-xs">
                  <strong>What happens next:</strong><br/>
                  • Browser will ask for microphone access<br/>
                  • Click "Allow" when prompted<br/>
                  • Voice chat will be enabled automatically
                </p>
              </div>
              <div className="mt-3 p-2 bg-blue-600/30 rounded-lg border border-blue-400/50">
                <p className="text-blue-100 text-xs font-bold">
                  ✨ The "Voice Chat" button below is now clickable!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-2 w-full">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <span className="text-red-400 text-sm whitespace-pre-line">{error}</span>
              
              {/* Additional troubleshooting for audio issues */}
              {error.includes("Audio configuration") && (
                <div className="mt-3 p-2 bg-red-800/30 rounded border border-red-400/30">
                  <h6 className="text-red-300 font-bold text-xs mb-2">🔧 Additional Troubleshooting:</h6>
                  <ul className="text-red-300 text-xs space-y-1">
                    <li>• <strong>Browser:</strong> Use Chrome or Edge (Firefox has known audio issues)</li>
                    <li>• <strong>Permissions:</strong> Check microphone access in browser settings</li>
                    <li>• <strong>Hardware:</strong> Test microphone in other applications</li>
                    <li>• <strong>Extensions:</strong> Disable ad blockers or privacy extensions</li>
                    <li>• <strong>System:</strong> Check Windows audio settings and drivers</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Toggle Group - Responsive sizing and layout */}
      <ToggleGroup
        className={`bg-zinc-700 rounded-lg p-1 w-full sm:w-auto ${isVoiceChatLoading ? "opacity-50" : ""}`}
        disabled={isVoiceChatLoading}
        type="single"
        value={isVoiceChatActive || isVoiceChatLoading ? "voice" : "text"}
        onValueChange={handleVoiceChatToggle}
      >
        <ToggleGroupItem
          className={`data-[state=on]:bg-zinc-800 rounded-lg p-2 text-xs sm:text-sm w-full sm:w-[90px] text-center transition-all duration-200 ${
            isVoiceChatDisabled 
              ? "opacity-50 cursor-not-allowed" 
              : microphonePermission === 'prompt'
              ? "hover:bg-zinc-600 cursor-pointer ring-2 ring-blue-500/50 hover:ring-blue-400/70"
              : "hover:bg-zinc-600 cursor-pointer"
          }`}
          value="voice"
          disabled={isVoiceChatDisabled}
          title={
            microphonePermission === 'prompt' 
              ? "Click to grant microphone permission" 
              : voiceChatStatus || "Voice Chat"
          }
        >
          Voice Chat
        </ToggleGroupItem>
        <ToggleGroupItem
          className="data-[state=on]:bg-zinc-800 rounded-lg p-2 text-xs sm:text-sm w-full sm:w-[90px] text-center"
          value="text"
        >
          Text Chat
        </ToggleGroupItem>
      </ToggleGroup>
      
      {voiceChatStatus && !isVoiceChatActive && (
        <MicrophoneHelpMessage status={voiceChatStatus} />
      )}
      
      {isVoiceChatActive || isVoiceChatLoading ? <AudioInput /> : <TextInput config={config} />}
      
      {/* Interrupt Button - Responsive positioning */}
      <div className="absolute top-[-60px] sm:top-[-70px] right-2 sm:right-3">
        <Button className="!bg-zinc-700 !text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2" onClick={interrupt}>
          Interrupt
        </Button>
      </div>
    </div>
  );
};
