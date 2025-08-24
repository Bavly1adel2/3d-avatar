import React, { forwardRef, useState } from "react";
import { ConnectionQuality } from "@heygen/streaming-avatar";

import { useConnectionQuality } from "../logic/useConnectionQuality";
import { useStreamingAvatarSession } from "../logic/useStreamingAvatarSession";
import { StreamingAvatarSessionState, useStreamingAvatarContext } from "../logic";
import { useTextChat } from "../logic/useTextChat";
import { CloseIcon } from "../Icons";
import { Button } from "../Button";
import { ThreeDAvatar } from "./ThreeDAvatar";
import { ThreeDAvatarCard } from "./ThreeDAvatarCard";
import { AvatarToggle } from "./AvatarToggle";

export const AvatarVideo = forwardRef<HTMLVideoElement>(({}, ref) => {
  const { sessionState, stopAvatar } = useStreamingAvatarSession();
  const { connectionQuality } = useConnectionQuality();
  const { isAvatarTalking } = useStreamingAvatarContext();
  const { sendMessage } = useTextChat();
  const [is3DMode, setIs3DMode] = useState(false);

  const isLoaded = sessionState === StreamingAvatarSessionState.CONNECTED;

  return (
    <>
      {/* Connection Quality Indicator - Responsive positioning and text */}
      {connectionQuality !== ConnectionQuality.UNKNOWN && (
        <div className="absolute top-2 left-2 bg-black/80 text-white rounded-lg px-2 py-1 text-xs z-10">
          <span className="hidden sm:inline">Connection Quality: </span>
          <span className="sm:hidden">Q: </span>
          {connectionQuality}
        </div>
      )}
      
      {/* Close Button - Responsive positioning and sizing */}
      {isLoaded && (
        <Button
          className="absolute top-2 right-2 !p-1 sm:!p-1.5 bg-zinc-700/80 bg-opacity-80 z-10 text-xs sm:text-sm"
          onClick={stopAvatar}
        >
          <CloseIcon />
        </Button>
      )}
      
      {/* Avatar Toggle */}
      <div className="absolute top-16 left-2 z-10">
        <AvatarToggle 
          is3DMode={is3DMode} 
          onToggle={() => setIs3DMode(!is3DMode)} 
        />
      </div>

      {/* Video Element - Always present but hidden in 3D mode to maintain avatar connection */}
      <video
        ref={ref}
        autoPlay
        playsInline
        // Remove muted attribute - let audio continue in 3D mode
        className={`video-container w-full h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] ${
          is3DMode ? 'hidden' : ''
        }`}
        style={{
          // Hide video visually but keep audio active
          ...(is3DMode && { 
            position: 'absolute',
            left: '-9999px',
            top: '-9999px',
            width: '1px',
            height: '1px',
            opacity: 0
          })
        }}
      >
        <track kind="captions" />
      </video>

      {/* 3D Avatar - Overlay on top when in 3D mode */}
      {is3DMode && (
        <div className="absolute inset-0 z-20">
          <ThreeDAvatarCard
            isTalking={isAvatarTalking}
            isConnected={isLoaded}
            title="3D Avatar Mode"
            description="Real-time 3D model synchronized with avatar"
            showControls={false}
            onSendMessage={sendMessage}
            showTextChat={true}
            className="w-full h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]"
          />
        </div>
      )}
      
      {/* Loading State - Responsive text */}
      {!isLoaded && (
        <div className="w-full h-full flex items-center justify-center absolute top-0 left-0">
          <div className="text-zinc-400 text-sm sm:text-base">Loading...</div>
        </div>
      )}
    </>
  );
});
AvatarVideo.displayName = "AvatarVideo";
