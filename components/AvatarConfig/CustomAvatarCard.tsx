import React, { useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";

interface CustomAvatarCardProps {
  onStartSession: (avatarId: string) => void;
  isSessionActive: boolean;
}

export function CustomAvatarCard({ onStartSession, isSessionActive }: CustomAvatarCardProps) {
  const [customAvatarId, setCustomAvatarId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleStartSession = async () => {
    if (!customAvatarId.trim()) {
      alert("Please enter a custom avatar ID");
      return;
    }

    setIsLoading(true);
    try {
      await onStartSession(customAvatarId.trim());
    } catch (error) {
      console.error("Error starting custom avatar session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setCustomAvatarId(value);
  };

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 shadow-xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">Custom Avatar</h3>
          <p className="text-gray-300 text-sm">
            Enter your custom avatar ID to start a personalized session
          </p>
        </div>

        {/* Avatar ID Input */}
        <div className="space-y-2">
          <label htmlFor="avatar-id" className="block text-sm font-medium text-gray-300">
            Avatar ID
          </label>
          <Input
            id="avatar-id"
            type="text"
            placeholder="Enter custom avatar ID (e.g., 6d56dfa867804a3cb1f5d042178172f2)"
            value={customAvatarId}
            onChange={handleInputChange}
            className="w-full"
            disabled={isSessionActive}
          />
        </div>

        {/* Instructions */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-blue-400 mb-1">Instructions:</h4>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Enter your HeyGen Pro avatar ID</li>
            <li>• Make sure you have access to the avatar</li>
            <li>• The ID should be a long alphanumeric string</li>
          </ul>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStartSession}
          disabled={!customAvatarId.trim() || isSessionActive || isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Starting Session...</span>
            </div>
          ) : (
            "Start Custom Avatar Session"
          )}
        </Button>

        {/* Test Public Avatar Button */}
        <Button
          onClick={() => {
            // Test with a known working public avatar
            const testAvatarId = "Ann_Therapist_public";
            console.log("🧪 Testing with public avatar:", testAvatarId);
            onStartSession(testAvatarId);
          }}
          disabled={isSessionActive || isLoading}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 mt-2"
        >
          🧪 Test with Public Avatar (Ann)
        </Button>

        {/* Status */}
        {isSessionActive && (
          <div className="text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Session Active
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
