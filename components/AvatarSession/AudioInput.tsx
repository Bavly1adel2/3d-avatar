import React, { useState } from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { LoadingIcon, MicIcon, MicOffIcon } from "../Icons";
import { useConversationState } from "../logic/useConversationState";

export const AudioInput: React.FC = () => {
  const { muteInputAudio, unmuteInputAudio, isMuted, isVoiceChatLoading, microphonePermission, microphoneAvailable, debugInfo } =
    useVoiceChat();
  const { isUserTalking } = useConversationState();
  const [showDebug, setShowDebug] = useState(false);

  const handleMuteClick = () => {
    if (isMuted) {
      unmuteInputAudio();
    } else {
      muteInputAudio();
    }
  };

  // Show microphone permission message if needed
  if (microphonePermission === 'prompt' || microphonePermission === 'denied') {
    return (
      <div className="flex flex-col items-center gap-3 p-4">
        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 w-full max-w-md">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-yellow-400 font-bold text-sm mb-2">
                {microphonePermission === 'denied' ? 'Microphone Access Denied' : 'Microphone Permission Required'}
              </h4>
              {microphonePermission === 'denied' ? (
                <div className="space-y-2 text-yellow-300 text-xs">
                  <p>Your browser has blocked microphone access. To use voice chat:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Click the microphone icon in your browser's address bar</li>
                    <li>Select "Allow" when prompted</li>
                    <li>Or go to browser settings → Privacy → Site permissions → Microphone</li>
                    <li>Refresh the page after allowing access</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2 text-yellow-300 text-xs">
                  <p>Click "Voice Chat" in the toggle above to grant microphone permission when prompted.</p>
                  <p>You'll see a browser popup asking for microphone access - click "Allow" to continue.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Button
          className="!p-2 sm:!p-3 relative"
          disabled={isVoiceChatLoading}
          onClick={handleMuteClick}
        >
          <div
            className={`absolute left-0 top-0 rounded-lg border-2 border-[#7559FF] w-full h-full ${isUserTalking ? "animate-ping" : ""}`}
          />
          {isVoiceChatLoading ? (
            <LoadingIcon className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
          ) : isMuted ? (
            <MicOffIcon size={18} className="sm:w-5 sm:h-5" />
          ) : (
            <MicIcon size={18} className="sm:w-5 sm:h-5" />
          )}
        </Button>

        {/* Debug Panel */}
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="w-full text-xs text-gray-400 hover:text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-2 border border-gray-600/50 transition-colors"
          >
            {showDebug ? "🔽 Hide Debug Info" : "🔍 Show Debug Info"}
          </button>
          {showDebug && (
            <div className="mt-2 bg-gray-800/50 rounded-lg p-3 border border-gray-600/50">
              <h5 className="text-gray-300 font-bold text-xs mb-2">Debug Information:</h5>
              <div className="space-y-1 text-xs text-gray-400">
                <p><strong>Microphone Available:</strong> {microphoneAvailable ? 'Yes' : 'No'}</p>
                <p><strong>Permission Status:</strong> {microphonePermission || 'Unknown'}</p>
                <p><strong>Voice Chat Loading:</strong> {isVoiceChatLoading ? 'Yes' : 'No'}</p>
                <p><strong>Is Muted:</strong> {isMuted ? 'Yes' : 'No'}</p>
                <p><strong>User Talking:</strong> {isUserTalking ? 'Yes' : 'No'}</p>
              </div>
              {debugInfo.length > 0 && (
                <div className="mt-3">
                  <h6 className="text-gray-300 font-bold text-xs mb-2">Recent Actions:</h6>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {debugInfo.slice(-5).map((info, index) => (
                      <p key={index} className="text-xs text-gray-500 font-mono">
                        {info}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show microphone not available message
  if (microphoneAvailable === false) {
    return (
      <div className="flex flex-col items-center gap-3 p-4">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 w-full max-w-md">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-red-400 font-bold text-sm mb-2">No Microphone Detected</h4>
              <div className="space-y-2 text-red-300 text-xs">
                <p>To use voice chat, you need a microphone:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Connect a USB microphone or headset</li>
                  <li>Use your device's built-in microphone</li>
                  <li>Check that your microphone is not disabled in system settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <Button
          className="!p-2 sm:!p-3 relative"
          disabled={true}
        >
          <MicOffIcon size={18} className="sm:w-5 sm:h-5" />
        </Button>
      </div>
    );
  }

  // Normal microphone controls
  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        className={`!p-2 sm:!p-3 relative`}
        disabled={isVoiceChatLoading}
        onClick={handleMuteClick}
      >
        <div
          className={`absolute left-0 top-0 rounded-lg border-2 border-[#7559FF] w-full h-full ${isUserTalking ? "animate-ping" : ""}`}
        />
        {isVoiceChatLoading ? (
          <LoadingIcon className="animate-spin w-4 h-4 sm:w-5 sm:h-5" />
        ) : isMuted ? (
          <MicOffIcon size={18} className="sm:w-5 sm:h-5" />
        ) : (
          <MicIcon size={18} className="sm:w-5 sm:h-5" />
        )}
      </Button>

      {/* Debug Panel */}
      <div className="w-full max-w-md">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="w-full text-xs text-gray-400 hover:text-gray-300 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-2 border border-gray-600/50 transition-colors"
        >
          {showDebug ? "🔽 Hide Debug Info" : "🔍 Show Debug Info"}
        </button>
        {showDebug && (
          <div className="mt-2 bg-gray-800/50 rounded-lg p-3 border border-gray-600/50">
            <h5 className="text-gray-300 font-bold text-xs mb-2">Debug Information:</h5>
            <div className="space-y-1 text-xs text-gray-400">
              <p><strong>Microphone Available:</strong> {microphoneAvailable ? 'Yes' : 'No'}</p>
              <p><strong>Permission Status:</strong> {microphonePermission || 'Unknown'}</p>
              <p><strong>Voice Chat Loading:</strong> {isVoiceChatLoading ? 'Yes' : 'No'}</p>
              <p><strong>Is Muted:</strong> {isMuted ? 'Yes' : 'No'}</p>
              <p><strong>User Talking:</strong> {isUserTalking ? 'Yes' : 'No'}</p>
            </div>
            {debugInfo.length > 0 && (
              <div className="mt-3">
                <h6 className="text-gray-300 font-bold text-xs mb-2">Recent Actions:</h6>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {debugInfo.slice(-5).map((info, index) => (
                    <p key={index} className="text-xs text-gray-500 font-mono">
                      {info}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
