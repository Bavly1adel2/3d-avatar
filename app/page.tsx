"use client";

import InteractiveAvatar from "@/components/InteractiveAvatar";

export default function App() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 p-2 sm:p-4 lg:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gray-600/20 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gray-500/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-28 h-28 bg-gray-700/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-20 w-36 h-36 bg-gray-600/20 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gray-500/10 rounded-full animate-pulse"></div>
      </div>
      
      {/* Responsive container with dark theme */}
      <div className="w-full max-w-full sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black/90 backdrop-blur-sm rounded-3xl sm:rounded-3xl lg:rounded-3xl shadow-2xl border-2 border-gray-600/30 relative z-10">
        {/* Header Section - Dark theme */}
        <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 text-center border-b-2 border-gray-600/30 compact-layout bg-gradient-to-r from-gray-700/50 via-gray-800/60 to-gray-900/70 rounded-t-3xl">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-white animate-pulse">
            Interactive Avatar 
          </h1>
                      <div className="flex justify-center gap-4 mt-3">
              <a
                href="/test-3d"
                className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 rounded-lg bg-blue-900/30 hover:bg-blue-800/50"
              >
                🎭 Test 3D Model
              </a>
              <a
                href="/test-elevenlabs"
                className="text-xs sm:text-sm text-purple-400 hover:text-purple-300 transition-colors px-3 py-1 rounded-lg bg-purple-900/30 hover:bg-purple-800/50"
              >
                🎤 Test ElevenLabs
              </a>
              <a
                href="/avatars"
                className="text-xs sm:text-sm text-green-400 hover:text-green-300 transition-colors px-3 py-1 rounded-lg bg-green-900/30 hover:bg-green-800/50"
              >
                📋 Browse Avatars
              </a>
            </div>
        </div>
        
        {/* Main Content - Avatar Area with dark theme */}
        <div className="p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-800/50 via-gray-900/60 to-black/50">
          <InteractiveAvatar />
        </div>
      </div>
    </div>
  );
}
