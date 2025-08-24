import { StartAvatarRequest, AvatarQuality, VoiceChatTransport } from "@heygen/streaming-avatar";

export interface AvatarConfig {
  avatar_id: string;
  name: string;
  look_id?: string;
  voice_id?: string;
}

/**
 * Builds avatar configuration for HeyGen API
 * Handles both public and custom avatars with proper field mapping
 */
export function buildAvatarConfig(
  avatar: AvatarConfig,
  baseConfig: Partial<StartAvatarRequest> = {}
): StartAvatarRequest {
  console.log("🔧 Building avatar config for:", avatar);
  
  // For custom avatars, we need to handle them differently
  if (avatar.look_id) {
    console.log("🔧 Custom avatar detected with look_id:", avatar.look_id);
    
    // For custom avatars, try different field combinations
    const customConfig: StartAvatarRequest = {
      quality: AvatarQuality.Low,
      language: "en",
      voiceChatTransport: VoiceChatTransport.WEBSOCKET,
      avatarName: avatar.avatar_id, // Use avatar_id as avatarName
      ...baseConfig,
    };

    // Add additional fields that might be required for custom avatars
    (customConfig as any).background = "transparent";
    (customConfig as any).look_id = avatar.look_id;
    
    console.log("🔧 Custom avatar config:", customConfig);
    return customConfig;
    
  } else {
    console.log("🔧 Public avatar detected, using standard config");
    
    // For public avatars, use standard configuration
    const publicConfig: StartAvatarRequest = {
      quality: AvatarQuality.Low,
      language: "en",
      voiceChatTransport: VoiceChatTransport.WEBSOCKET,
      avatarName: avatar.avatar_id,
      ...baseConfig,
    };

    console.log("🔧 Public avatar config:", publicConfig);
    return publicConfig;
  }
}

/**
 * Determines if an avatar is custom (has look_id)
 */
export function isCustomAvatar(avatar: AvatarConfig): boolean {
  return !!avatar.look_id;
}

/**
 * Creates a minimal configuration for testing custom avatars
 */
export function createMinimalCustomAvatarConfig(avatarId: string): StartAvatarRequest {
  console.log("🔧 Creating minimal config for custom avatar:", avatarId);
  
  return {
    quality: AvatarQuality.Low,
    language: "en",
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
    avatarName: avatarId,
  };
}

/**
 * Creates an extended configuration for custom avatars with additional fields
 */
export function createExtendedCustomAvatarConfig(avatarId: string, lookId?: string): StartAvatarRequest {
  console.log("🔧 Creating extended config for custom avatar:", { avatarId, lookId });
  
  const config: StartAvatarRequest = {
    quality: AvatarQuality.Low,
    language: "en",
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
    avatarName: avatarId,
  };

  // Add additional fields that might be required
  if (lookId) {
    (config as any).look_id = lookId;
  }
  
  (config as any).background = "transparent";
  
  console.log("🔧 Extended custom avatar config:", config);
  return config;
}
