'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';

interface StreamingAvatar {
  avatar_id: string;
  avatar_name: string;
  gender?: string;
  preview_image_url?: string;
  type?: string;
  premium?: boolean;
  source?: string;
}

interface StreamingAvatarListResponse {
  success: boolean;
  avatars: StreamingAvatar[];
  total: number;
  source?: string;
  message?: string;
  error?: string;
}

interface StreamingAvatarListProps {
  onSelectAvatar?: (avatarId: string) => void;
}

export default function StreamingAvatarList({ onSelectAvatar }: StreamingAvatarListProps) {
  const [avatars, setAvatars] = useState<StreamingAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const fetchStreamingAvatars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/get-streaming-avatars');
      const data: StreamingAvatarListResponse = await response.json();
      
      if (data.success) {
        setAvatars(data.avatars);
        setSource(data.source || 'streaming_api');
        setMessage(data.message || '');
      } else {
        setError(data.error || 'Failed to fetch streaming avatars');
      }
    } catch (err) {
      setError('Failed to fetch streaming avatars from API');
      console.error('Error fetching streaming avatars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreamingAvatars();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-white">Loading streaming avatars...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/50 border border-red-600/30 rounded-lg">
        <h3 className="text-lg font-semibold text-red-300 mb-2">Error</h3>
        <p className="text-red-400 mb-4">{error}</p>
        <Button onClick={fetchStreamingAvatars}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && source === 'known_working_streaming_avatars' && (
        <div className="bg-blue-900/50 border border-blue-600/30 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-300">
                Streaming-Compatible Avatars
              </h3>
              <p className="mt-1 text-sm text-blue-400">
                {message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Streaming Avatars ({avatars.length})
          {source === 'known_working_streaming_avatars' && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              (Curated)
            </span>
          )}
        </h2>
        <Button 
          onClick={fetchStreamingAvatars} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 hover:shadow-lg"
        >
          🔄 Refresh
        </Button>
      </div>

      {avatars.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No streaming avatars found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.avatar_id}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-600/30 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all hover:border-blue-500/50"
            >
              {avatar.preview_image_url && (
                <div className="w-full h-48 bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={avatar.preview_image_url}
                    alt={avatar.avatar_name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="text-gray-500 text-sm">No preview</div>';
                    }}
                  />
                </div>
              )}
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">
                  {avatar.avatar_name}
                </h3>
                <p className="text-sm text-gray-400">
                  ID: {avatar.avatar_id}
                </p>
                
                {avatar.gender && (
                  <p className="text-sm text-gray-400">
                    Gender: {avatar.gender}
                  </p>
                )}
                
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    avatar.premium 
                      ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-600/30' 
                      : 'bg-green-900/50 text-green-300 border border-green-600/30'
                  }`}>
                    {avatar.premium ? '💎 Premium' : '🆓 Free'}
                  </span>
                  
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300 border border-blue-600/30">
                    🎬 Streaming
                  </span>
                </div>

                {onSelectAvatar && (
                  <Button
                    onClick={() => onSelectAvatar(avatar.avatar_id)}
                    className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-2 rounded-lg transition-all"
                  >
                    🚀 Start Session
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


