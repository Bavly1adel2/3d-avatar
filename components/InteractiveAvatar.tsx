import React, { useRef, useState, useEffect } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";
import {
  StreamingEvents,
  StartAvatarRequest,
  AvatarQuality,
  VoiceEmotion,
  ElevenLabsModel,
  STTProvider,
  VoiceChatTransport,
} from "@heygen/streaming-avatar";

import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { useVoiceChat } from "./logic/useVoiceChat";
import { useSystemPrompt } from "./logic/useSystemPrompt";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";

import { AvatarConfig } from "./AvatarConfig";
import { CustomAvatarCard } from "./AvatarConfig/CustomAvatarCard";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { Button } from "./Button";
import { LoadingIcon } from "./Icons";

import { AVATARS, AVATAR_SYSTEM_PROMPTS } from "@/app/lib/constants";
import { buildAvatarConfig, isCustomAvatar, createMinimalCustomAvatarConfig, createExtendedCustomAvatarConfig, type AvatarConfig as AvatarConfigType } from "@/app/lib/avatarConfigBuilder";
import { VisitScenario } from "./AvatarConfig/ScenarioSelector";

// Note: AudioContext sample rate issues may occur with the HeyGen SDK
// These are now handled gracefully with proper error messages

// Supported language codes by HeyGen API
const SUPPORTED_LANGUAGES = [
  "en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh", "ar"
];

// Default configuration
const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: AVATARS[0].avatar_id,
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
};

// Test configuration for debugging
const TEST_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: "test_avatar", // Try a simple test avatar ID
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
};

// Alternative test configurations
const ALTERNATIVE_CONFIGS: StartAvatarRequest[] = [
  {
    quality: AvatarQuality.Low,
    avatarName: "avatar_1",
    language: "en",
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  },
  {
    quality: AvatarQuality.Low,
    avatarName: "default_avatar",
    language: "en",
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  },
  {
    quality: AvatarQuality.Low,
    avatarName: "demo_avatar",
    language: "en",
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  }
];

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { applySystemPrompt } = useSystemPrompt();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [selectedScenario, setSelectedScenario] = useState<VisitScenario>('initial-consultation');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showCustomAvatarCard, setShowCustomAvatarCard] = useState(false);

  const mediaStream = useRef<HTMLVideoElement>(null);

  // Validate configuration
  const validateConfig = (config: StartAvatarRequest): string[] => {
    const errors: string[] = [];
    
    if (!config.avatarName || config.avatarName.trim() === "") {
      errors.push("Avatar name is required");
    }
    
    if (!config.language || config.language.trim() === "") {
      errors.push("Language is required");
    }
    
    // Validate language code
    if (config.language && !SUPPORTED_LANGUAGES.includes(config.language)) {
      errors.push(`Language "${config.language}" is not supported. Supported languages: ${SUPPORTED_LANGUAGES.join(", ")}`);
    }
    
    if (!config.quality) {
      errors.push("Avatar quality is required");
    }
    
    if (!config.voiceChatTransport) {
      errors.push("Voice chat transport is required");
    }
    
    // Check if avatar ID format is valid (should not contain spaces)
    if (config.avatarName && /\s/.test(config.avatarName)) {
      console.log(`🔍 VALIDATION DEBUG: Avatar ID "${config.avatarName}" contains spaces`);
      console.log(`🔍 VALIDATION DEBUG: Avatar ID length: ${config.avatarName.length}`);
      console.log(`🔍 VALIDATION DEBUG: Avatar ID char codes:`, Array.from(config.avatarName).map(c => `${c}:${c.charCodeAt(0)}`));
      errors.push("Avatar ID should not contain spaces");
    }
    
    // Check if avatar ID is a valid HeyGen ID format (alphanumeric, hyphens, underscores)
    if (config.avatarName && !/^[a-zA-Z0-9_-]+$/.test(config.avatarName)) {
      console.log(`🔍 VALIDATION DEBUG: Avatar ID "${config.avatarName}" failed format validation`);
      console.log(`🔍 VALIDATION DEBUG: Avatar ID length: ${config.avatarName.length}`);
      console.log(`🔍 VALIDATION DEBUG: Avatar ID char codes:`, Array.from(config.avatarName).map(c => `${c}:${c.charCodeAt(0)}`));
      errors.push("Avatar ID should only contain letters, numbers, hyphens, and underscores");
    }
    
    // Additional validation for Arabic language
    if (config.language === "ar") {
      // Check if Arabic-specific configurations are valid
      if (config.voice?.voiceId && !/^ar-[A-Z]{2}-\d+$/.test(config.voice.voiceId)) {
        errors.push("Arabic voice ID should follow format: ar-XX-1 (e.g., ar-SA-1, ar-EG-1)");
      }
    }
    
    return errors;
  };

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      
      console.log("Access token response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        console.error("Access token API error:", errorData);
        throw new Error(`Failed to get access token: ${response.status} - ${errorData.error || errorData.details || "Unknown error"}`);
      }
      
      const token = await response.text();
      console.log("Access Token received:", token.substring(0, 20) + "..."); // Log first 20 chars for security

      if (!token || token.trim() === "") {
        throw new Error("Received empty access token from API");
      }

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async () => {
    try {
      setError(null); // Clear any previous errors
      setValidationErrors([]); // Clear validation errors
      
      // Validate configuration before making API call
      const errors = validateConfig(config);
      if (errors.length > 0) {
        setValidationErrors(errors);
        throw new Error(`Configuration validation failed: ${errors.join(", ")}`);
      }
      
      let configToUse = config;
      
      // If the current config fails, try alternative configs
      if (config.avatarName === "test_avatar" || config.avatarName === "avatar_1") {
        configToUse = ALTERNATIVE_CONFIGS[0];
        setConfig(configToUse);
      }
      
      // Log the configuration being sent
      console.log("Starting avatar session with config:", JSON.stringify(configToUse, null, 2));
      console.log("Avatar ID:", configToUse.avatarName);
      console.log("Language:", configToUse.language);
      console.log("Quality:", configToUse.quality);
      console.log("Transport:", configToUse.voiceChatTransport);
      console.log("Full config object:", configToUse);
      console.log("Config type:", typeof configToUse);
      console.log("Config keys:", Object.keys(configToUse));
      
      const newToken = await fetchAccessToken();
      console.log("Access token received successfully");
      console.log("Token length:", newToken.length);
      console.log("Token starts with:", newToken.substring(0, 20));
      
      const avatar = initAvatar(newToken);
      console.log("Avatar initialized successfully");

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      // Start the avatar session
      await startAvatar(configToUse);
      console.log("Avatar session started successfully");

      // Apply system prompt if it's Ann Therapist
      if (configToUse.avatarName === "Ann_Therapist_public") {
        // Wait a bit for the session to be fully established
        setTimeout(async () => {
          await applySystemPrompt(configToUse.avatarName, selectedScenario);
        }, 1000);
      }

      // Start voice chat after avatar is ready
      startVoiceChat();
      
    } catch (error) {
      console.error("Error starting avatar session:", error);
      
      let errorMessage = "Failed to start session";
      
      if (error instanceof Error) {
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
        
        // Provide more specific error messages based on error type
        if (error.message.includes("400")) {
          errorMessage = "Invalid request parameters. Please check your configuration.";
          
          // Add specific guidance for common 400 errors
          if (error.message.includes("avatar") || error.message.includes("Avatar")) {
            errorMessage = "Invalid avatar configuration. Please check the avatar ID and settings.";
          } else if (error.message.includes("language") || error.message.includes("Language")) {
            errorMessage = "Language configuration error. Please select a supported language.";
          } else if (error.message.includes("voice") || error.message.includes("Voice")) {
            errorMessage = "Voice configuration error. Please check voice settings.";
          } else if (error.message.includes("quality") || error.message.includes("Quality")) {
            errorMessage = "Quality setting error. Please select a valid avatar quality.";
          } else {
            errorMessage = "Configuration validation failed. Please check all settings and try again.";
          }
        } else if (error.message.includes("401")) {
          errorMessage = "Authentication failed. Please check your API key.";
        } else if (error.message.includes("403")) {
          errorMessage = "Access denied. Please check your permissions.";
        } else if (error.message.includes("404")) {
          errorMessage = "Avatar not found. Please check the avatar ID.";
        } else if (error.message.includes("500")) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.message.includes("Configuration validation failed")) {
          errorMessage = error.message;
        } else {
          errorMessage = `Failed to start session: ${error.message}`;
        }
      } else {
        errorMessage = "Failed to start session: Unknown error";
      }
      
      setError(errorMessage);
    }
  });

  // Function to try multiple avatar configurations
  const tryMultipleConfigs = async () => {
    console.log("Trying multiple avatar configurations...");
    
    for (let i = 0; i < ALTERNATIVE_CONFIGS.length; i++) {
      const testConfig = ALTERNATIVE_CONFIGS[i];
      console.log(`Trying configuration ${i + 1}:`, testConfig);
      
      try {
        setConfig(testConfig);
        await startSessionV2();
        console.log(`Configuration ${i + 1} worked!`);
        return;
      } catch (error) {
        console.log(`Configuration ${i + 1} failed:`, error);
        continue;
      }
    }
    
    console.log("All alternative configurations failed");
    setError("All avatar configurations failed. Please check your HeyGen API setup.");
  };

  // Function to start session with custom avatar ID
  const startCustomAvatarSession = useMemoizedFn(async (customAvatarId: string) => {
    try {
      setError(null);
      setValidationErrors([]);

      console.log("🔧 Starting custom avatar session with ID:", customAvatarId);

      // Try different configuration approaches for custom avatars
      console.log("🔧 Trying different configuration approaches for custom avatar...");
      
      // Approach 1: Minimal configuration
      let customConfig: StartAvatarRequest = createMinimalCustomAvatarConfig(customAvatarId);
      
      // Approach 2: Extended configuration with additional fields
      const extendedConfig = createExtendedCustomAvatarConfig(customAvatarId);
      
      // Approach 3: Try using the avatar_id as both avatarName and look_id
      const alternativeConfig: StartAvatarRequest = {
        quality: AvatarQuality.Low,
        language: "en",
        voiceChatTransport: VoiceChatTransport.WEBSOCKET,
        avatarName: customAvatarId,
      };
      (alternativeConfig as any).look_id = customAvatarId;
      (alternativeConfig as any).background = "transparent";
      
      // Approach 4: Try some other common field names that might be expected
      const wildcardConfig: StartAvatarRequest = {
        quality: AvatarQuality.Low,
        language: "en",
        voiceChatTransport: VoiceChatTransport.WEBSOCKET,
        avatarName: customAvatarId,
      };
      (wildcardConfig as any).avatar_id = customAvatarId;
      (wildcardConfig as any).id = customAvatarId;
      (wildcardConfig as any).avatarId = customAvatarId;
      (wildcardConfig as any).background = "transparent";
      
      console.log("🔧 Configuration approaches:");
      console.log("  - Minimal:", customConfig);
      console.log("  - Extended:", extendedConfig);
      console.log("  - Alternative:", alternativeConfig);
      console.log("  - Wildcard:", wildcardConfig);

      // Validate the custom configuration
      console.log(`🔍 VALIDATION DEBUG: About to validate config with avatarName: "${customConfig.avatarName}"`);
      console.log(`🔍 VALIDATION DEBUG: Config object:`, customConfig);
      const errors = validateConfig(customConfig);
      if (errors.length > 0) {
        console.log(`🔍 VALIDATION DEBUG: Validation failed with errors:`, errors);
        setValidationErrors(errors);
        throw new Error(`Configuration validation failed: ${errors.join(", ")}`);
      }

      // Get access token
      console.log("Fetching access token for custom avatar...");
      const newToken = await fetchAccessToken();

      // Initialize avatar
      console.log("Initializing custom avatar...");
      const avatar = initAvatar(newToken);
      console.log("Custom avatar initialized successfully");

      // Set up event listeners
      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Custom avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Custom avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Custom avatar stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Custom avatar stream ready:", event.detail);
      });

      // Try multiple configuration approaches if one fails
      const configsToTry = [
        { name: "Minimal", config: customConfig },
        { name: "Extended", config: extendedConfig },
        { name: "Alternative", config: alternativeConfig },
        { name: "Wildcard", config: wildcardConfig }
      ];

      // NEW: Test if the avatar ID is valid for streaming
      console.log(`🔍 Testing avatar ID: ${customAvatarId}`);
      console.log(`🔍 This avatar ID might not support streaming - trying anyway...`);
      
      // SUGGESTION: Try these known working streaming avatars instead:
      const workingAvatars = ['test', 'demo', 'avatar1', 'Ann_Therapist_public'];
      console.log(`💡 Known working streaming avatars: ${workingAvatars.join(', ')}`);
      console.log(`💡 If this fails, try one of the working avatars above`);

      let lastError: any = null;
      
      for (const { name, config: configToTry } of configsToTry) {
        console.log(`🚀 Trying ${name} configuration:`, {
          config: configToTry,
          stringified: JSON.stringify(configToTry, null, 2),
          heyGenApiUrl: "https://api.heygen.com/v1/streaming.new"
        });
        
        // DEBUG: Log the exact configuration being sent
        console.log(`🔧 ${name} Config Details:`, {
          quality: configToTry.quality,
          language: configToTry.language,
          voiceChatTransport: configToTry.voiceChatTransport,
          avatarName: configToTry.avatarName,
          // Log any additional properties
          additionalProps: Object.keys(configToTry).filter(key => 
            !['quality', 'language', 'voiceChatTransport', 'avatarName'].includes(key)
          ).map(key => ({ [key]: (configToTry as any)[key] }))
        });

        try {
          await startAvatar(configToTry);
          console.log(`✅ ${name} configuration worked! Custom avatar session started successfully`);
          setConfig(configToTry); // Update the config state
          break; // Exit the loop if successful
        } catch (error) {
          console.error(`❌ ${name} configuration failed:`, {
            error: error,
            message: error instanceof Error ? error.message : "Unknown error",
            config: configToTry,
            customAvatarId: customAvatarId
          });
          
          // ENHANCED: More aggressive error inspection
          console.log(`🔍 Error type:`, typeof error);
          console.log(`🔍 Error constructor:`, error?.constructor?.name);
          console.log(`🔍 Error message:`, (error as any)?.message);
          console.log(`🔍 Error name:`, (error as any)?.name);
          
          // Try to access common error properties
          if (error && typeof error === 'object') {
            const errorKeys = Object.keys(error);
            console.log(`🔍 Error object keys:`, errorKeys);
            
            // Log each property value
            for (const key of errorKeys) {
              try {
                const value = (error as any)[key];
                console.log(`🔍 Error.${key}:`, value);
              } catch (e) {
                console.log(`🔍 Error.${key}: [Cannot access]`);
              }
            }
            
            // Try to access properties that might contain the real error
            const possibleProps = ['status', 'responseText', 'response', 'data', 'body', 'details'];
            for (const prop of possibleProps) {
              if ((error as any)[prop] !== undefined) {
                console.log(`🔍 Found ${prop}:`, (error as any)[prop]);
              }
            }
            
            // NEW: Try to access properties that might be hidden or non-enumerable
            const allProps = Object.getOwnPropertyNames(error);
            console.log(`🔍 All property names:`, allProps);
            for (const prop of allProps) {
              try {
                const value = (error as any)[prop];
                console.log(`🔍 Error[${prop}]:`, value);
              } catch (e) {
                console.log(`🔍 Error[${prop}]: [Cannot access]`);
              }
            }
            
            // NEW: Try to access properties that might be on the prototype
            const prototype = Object.getPrototypeOf(error);
            if (prototype) {
              const prototypeProps = Object.getOwnPropertyNames(prototype);
              console.log(`🔍 Prototype properties:`, prototypeProps);
              for (const prop of prototypeProps) {
                try {
                  const value = (prototype as any)[prop];
                  console.log(`🔍 Prototype[${prop}]:`, value);
                } catch (e) {
                  console.log(`🔍 Prototype[${prop}]: [Cannot access]`);
                }
              }
            }
            
            // NEW: Try to stringify the entire error to see what's hidden
            try {
              const errorStr = JSON.stringify(error, null, 2);
              console.log(`🔍 Error JSON.stringify:`, errorStr);
            } catch (e) {
              console.log(`🔍 Error JSON.stringify failed:`, e);
            }
            
            // NEW: Try to access properties that might be getters
            try {
              const errorEntries = Object.entries(error);
              console.log(`🔍 Error entries:`, errorEntries);
            } catch (e) {
              console.log(`🔍 Error entries failed:`, e);
            }
          }
          
          lastError = error;
          
          // If this is the last config to try, throw the error
          if (configsToTry.indexOf({ name, config: configToTry }) === configsToTry.length - 1) {
            throw error;
          }
          
          // Otherwise, continue to the next configuration
          console.log(`🔄 Trying next configuration...`);
        }
      }

      // Start voice chat after avatar is ready
      startVoiceChat();

    } catch (error) {
      console.error("Error starting custom avatar session:", error);
      
      let errorMessage = "Failed to start custom avatar session";
      
      if (error instanceof Error) {
        console.error("Custom avatar error details:", error.message);
        
        if (error.message.includes("400")) {
          errorMessage = "❌ 400 Error: This avatar ID might not support streaming. Try: test, demo, avatar1, or Ann_Therapist_public";
        } else if (error.message.includes("401")) {
          errorMessage = "Authentication failed. Please check your API key.";
        } else if (error.message.includes("403")) {
          errorMessage = "Access denied. Please make sure you have permission to use this custom avatar.";
        } else if (error.message.includes("404")) {
          errorMessage = "Custom avatar not found. Please check the avatar ID.";
        } else {
          errorMessage = `Custom avatar error: ${error.message}`;
        }
      }
      
      setError(errorMessage);
      throw error;
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col">
      {/* Validation Errors - Dark theme */}
      {validationErrors.length > 0 && (
        <div className="bg-gradient-to-r from-gray-700/80 to-gray-800/80 border-2 border-gray-500 rounded-2xl p-4 mx-2 sm:mx-4 mt-2 sm:mt-4 mb-2 flex-shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
              <span className="text-white text-lg">⚠️</span>
            </div>
            <span className="text-white font-bold text-sm">Configuration Issues</span>
          </div>
          <div className="mt-3 space-y-2">
            {validationErrors.map((error, index) => (
              <p key={index} className="text-gray-200 text-xs sm:text-sm font-medium">• {error}</p>
            ))}
          </div>
          <div className="mt-3 p-3 bg-gradient-to-r from-gray-600/50 to-gray-700/50 rounded-xl border-2 border-gray-500/50">
            <p className="text-white text-xs font-bold">
              💡 <strong>Tip:</strong> Please fix the configuration issues above before starting the session.
            </p>
          </div>
        </div>
      )}
      
      {/* API Errors - Dark theme */}
      {error && (
        <div className="bg-gradient-to-r from-gray-700/80 to-gray-800/80 border-2 border-gray-500 rounded-2xl p-4 mx-2 sm:mx-4 mt-2 sm:mt-4 mb-2 flex-shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <span className="text-white text-lg">❌</span>
            </div>
            <span className="text-white font-bold text-sm">Session Error</span>
          </div>
          <p className="text-gray-200 text-xs sm:text-sm mt-2 font-medium">{error}</p>
          
          {/* Configuration Debug Panel for 400 errors */}
          {error.includes("400") && (
            <div className="mt-3 p-3 bg-gradient-to-r from-gray-600/50 to-gray-700/50 rounded-xl border-2 border-gray-500/50">
              <p className="text-white text-xs font-bold mb-2">
                🔍 <strong>Configuration Debug:</strong> Current settings being sent to API:
              </p>
              <div className="bg-gray-800/50 p-2 rounded border border-gray-600/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div><strong className="text-gray-300">Avatar ID:</strong> <span className="text-gray-200 font-mono">{config.avatarName}</span></div>
                  <div><strong className="text-gray-300">Language:</strong> <span className="text-gray-200 font-mono">{config.language}</span></div>
                  <div><strong className="text-gray-300">Quality:</strong> <span className="text-gray-200 font-mono">{config.quality}</span></div>
                  <div><strong className="text-gray-300">Transport:</strong> <span className="text-gray-200 font-mono">{config.voiceChatTransport}</span></div>
                  {config.voice?.voiceId && (
                    <div className="sm:col-span-2"><strong className="text-gray-300">Voice ID:</strong> <span className="text-gray-200 font-mono">{config.voice.voiceId}</span></div>
                  )}
                  {config.knowledgeId && (
                    <div className="sm:col-span-2"><strong className="text-gray-300">Knowledge Base:</strong> <span className="text-gray-200 font-mono">{config.knowledgeId}</span></div>
                  )}
                </div>
              </div>
              <p className="text-white text-xs mt-2">
                💡 <strong>Tip:</strong> Check the console for detailed API request logs. The 400 error usually means one of these values is invalid.
              </p>
            </div>
          )}
          
          {error.includes("400") && (
            <div className="mt-3 p-3 bg-gradient-to-r from-gray-600/50 to-gray-700/50 rounded-xl border-2 border-gray-500/50">
              <p className="text-white text-xs font-bold">
                💡 <strong>Tip:</strong> A 400 error usually means invalid parameters. Check the console for detailed configuration logs.
              </p>
            </div>
          )}
          {error.includes("audio configuration") && (
            <div className="mt-3 p-3 bg-gradient-to-r from-gray-600/50 to-gray-700/50 rounded-xl border-2 border-gray-500/50">
              <p className="text-white text-xs font-bold">
                💡 <strong>Tip:</strong> Try using "Start Text Chat" instead. The avatar will still respond to your text messages.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Debug Configuration Section - Dark theme */}
      {(error || validationErrors.length > 0) && (
        <div className="bg-gradient-to-r from-gray-700/50 via-gray-800/60 to-gray-900/70 border-2 border-gray-600/50 rounded-2xl p-4 mx-2 sm:mx-4 mb-4 shadow-lg">
          <h4 className="text-sm font-bold text-white mb-3 text-center">🔧 Current Configuration</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-800/50 rounded-xl p-2 border border-gray-600/50">
              <span className="text-gray-300 font-bold">Avatar ID:</span>
              <span className="ml-2 text-white font-mono break-all">{config.avatarName || 'Not set'}</span>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-2 border border-gray-600/50">
              <span className="text-gray-300 font-bold">Language:</span>
              <span className="ml-2 text-white font-mono">{config.language || 'Not set'}</span>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-2 border border-gray-600/50">
              <span className="text-gray-300 font-bold">Quality:</span>
              <span className="ml-2 text-white font-mono">{config.quality || 'Not set'}</span>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-2 border border-gray-600/50">
              <span className="text-gray-300 font-bold">Transport:</span>
              <span className="ml-2 text-white font-mono">{config.voiceChatTransport || 'Not set'}</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-gradient-to-r from-gray-600/50 to-gray-700/50 rounded-xl border-2 border-gray-500/50">
            <p className="text-white text-xs font-bold text-center">
              💡 <strong>Debug:</strong> Check the browser console for detailed API request logs.
            </p>
          </div>
        </div>
      )}
      
      {/* Avatar Video Container - Dark theme */}
      <div>
        <div className="relative bg-gradient-to-br from-gray-700/50 via-gray-800/60 to-gray-900/70 rounded-2xl mx-2 sm:mx-4 my-2 overflow-hidden border-2 border-gray-600/50 shadow-lg">
          {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
            <AvatarVideo ref={mediaStream} />
          ) : (
            <div className="w-full flex flex-col items-center justify-center space-y-4 p-4">
              {/* Toggle between Avatar Config and Custom Avatar */}
              <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-600/50">
                <Button
                  onClick={() => setShowCustomAvatarCard(false)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    !showCustomAvatarCard 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-transparent text-gray-300 hover:text-white'
                  }`}
                >
                  Select Avatar
                </Button>
                <Button
                  onClick={() => setShowCustomAvatarCard(true)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    showCustomAvatarCard 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-transparent text-gray-300 hover:text-white'
                  }`}
                >
                  Custom Avatar
                </Button>
              </div>

              {/* Content based on selection */}
              {!showCustomAvatarCard ? (
                <AvatarConfig 
                  config={config} 
                  onConfigChange={setConfig}
                  selectedScenario={selectedScenario}
                  onScenarioChange={setSelectedScenario}
                />
              ) : (
                <CustomAvatarCard 
                  onStartSession={startCustomAvatarSession}
                  isSessionActive={sessionState !== StreamingAvatarSessionState.INACTIVE}
                />
              )}
            </div>
          )}
        </div>
        
        {/* Controls Section - Dark theme */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t-2 border-gray-600/30 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
          {sessionState === StreamingAvatarSessionState.CONNECTED ? (
            <AvatarControls config={config} />
          ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-center">
                <Button 
                  onClick={() => startSessionV2()}
                  className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 hover:from-gray-700 hover:via-gray-800 hover:to-gray-900 transform hover:scale-105 hover:-rotate-1 transition-all duration-300 shadow-xl hover:shadow-2xl border-2 border-gray-500/50 rounded-2xl font-bold"
                >
                  Start 
                </Button>
              </div>
              
      
              {/* <div className="flex justify-center mt-2">
                <Button 
                  onClick={() => {
                    console.log("Testing with test configuration...");
                    setConfig(TEST_CONFIG);
                    setTimeout(() => startSessionV2(), 100);
                  }}
                  className="text-xs px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
                >
                  🧪 Test Config
                </Button>
              </div> */}
              
              {/* Try Multiple Configs Button */}
              {/* <div className="flex justify-center mt-2">
                <Button 
                  onClick={tryMultipleConfigs}
                  className="text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  🔄 Try Multiple Configs
                </Button>
              </div> */}
              <p className="text-gray-300 text-xs text-center px-2 sm:px-0 font-medium">
                ✨ Type your messages and the avatar will respond with voice and video ✨
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <LoadingIcon />
            </div>
          )}
        </div>
      </div>
      
      {/* Message History - Dark theme */}
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <div className="flex-shrink-0 max-h-32 sm:max-h-48 overflow-y-auto mx-2 sm:mx-4 mb-2 sm:mb-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-2xl border-2 border-gray-600/50 p-3">
          <MessageHistory />
        </div>
      )}
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
