'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';

interface Avatar {
  avatar_id: string;
  name: string;
  avatar_url?: string;
  gender?: string;
  language?: string;
  created_at?: string;
}

interface AvatarListResponse {
  success: boolean;
  avatars: Avatar[];
  total: number;
  source?: string;
  message?: string;
  error?: string;
}

export default function AvatarList() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const fetchAvatars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/get-avatars');
      const data: AvatarListResponse = await response.json();
      
      if (data.success) {
        setAvatars(data.avatars);
        setSource(data.source || 'heygen');
        setMessage(data.message || '');
      } else {
        setError(data.error || 'Failed to fetch avatars');
      }
    } catch (err) {
      setError('Failed to fetch avatars from API');
      console.error('Error fetching avatars:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading avatars...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchAvatars}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && source === 'local_constants' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-600">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Using Local Avatars
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                {message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Available Avatars ({avatars.length})
          {source === 'local_constants' && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              (Local)
            </span>
          )}
        </h2>
        <div className="flex gap-3">
          <Button 
            onClick={fetchAvatars} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 hover:shadow-lg"
          >
            🔄 Refresh Avatars
          </Button>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 hover:shadow-lg"
          >
            ← Back to Avatar
          </a>
        </div>
      </div>

      {avatars.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No avatars found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avatars.map((avatar) => (
            <div
              key={avatar.avatar_id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {avatar.avatar_url && (
                <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  <img
                    src={avatar.avatar_url}
                    alt={avatar.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {avatar.name}
                </h3>
                <p className="text-sm text-gray-600">
                  ID: {avatar.avatar_id}
                </p>
                
                {avatar.gender && (
                  <p className="text-sm text-gray-600">
                    Gender: {avatar.gender}
                  </p>
                )}
                
                {avatar.language && (
                  <p className="text-sm text-gray-600">
                    Language: {avatar.language}
                  </p>
                )}
                
                {avatar.created_at && (
                  <p className="text-sm text-gray-500">
                    Created: {new Date(avatar.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
