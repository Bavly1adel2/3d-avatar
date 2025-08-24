'use client';

import { useState } from 'react';
import AvatarList from '@/components/AvatarList';
import StreamingAvatarList from '@/components/StreamingAvatarList';

export default function AvatarsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'streaming'>('streaming');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Available Avatars
          </h1>
          <p className="mt-2 text-gray-300">
            Browse avatars from your HeyGen API
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-600">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('streaming')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'streaming'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                }`}
              >
                🎬 Streaming Avatars ({activeTab === 'streaming' ? 'Active' : 'Compatible'})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                }`}
              >
                📋 All Avatars (Browse Only)
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'streaming' && (
          <StreamingAvatarList 
            onSelectAvatar={(avatarId) => {
              console.log('Selected streaming avatar:', avatarId);
              // You can add navigation or callback here
              alert(`Selected streaming avatar: ${avatarId}\n\nGo back to the main page to test this avatar!`);
            }}
          />
        )}
        
        {activeTab === 'all' && <AvatarList />}
      </div>
    </div>
  );
}
