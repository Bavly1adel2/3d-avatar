import React from 'react';
import { Button } from '../Button';

interface AvatarToggleProps {
  is3DMode: boolean;
  onToggle: () => void;
  className?: string;
}

export const AvatarToggle: React.FC<AvatarToggleProps> = ({ 
  is3DMode, 
  onToggle, 
  className = "" 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="text-sm text-gray-300 font-medium">Avatar Mode:</span>
      
      <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-600/50">
        <Button
          onClick={() => !is3DMode && onToggle()}
          className={`px-4 py-2 text-sm rounded-lg transition-all ${
            !is3DMode 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-transparent text-gray-300 hover:text-white'
          }`}
        >
          🎥 Video Avatar
        </Button>
        <Button
          onClick={() => is3DMode && onToggle()}
          className={`px-4 py-2 text-sm rounded-lg transition-all ${
            is3DMode 
              ? 'bg-green-600 text-white shadow-lg' 
              : 'bg-transparent text-gray-300 hover:text-white'
          }`}
        >
          🎭 3D Model
        </Button>
      </div>
      
      <div className="text-xs text-gray-400 bg-gray-800/30 px-2 py-1 rounded">
        {is3DMode ? '3D Model Active' : 'Video Avatar Active'}
      </div>
    </div>
  );
};
