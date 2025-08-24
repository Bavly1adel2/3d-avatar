import { NextRequest, NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || 'https://api.heygen.com';

export async function GET() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }

    console.log("🔍 Fetching avatars from HeyGen...");
    
    // Try multiple HeyGen endpoints
    const endpoints = [
      '/v2/avatars',
      '/v1/avatars', 
      '/v1/avatar.list'
    ];

    let avatars = [];
    let source = 'local';
    let message = '';

    for (const endpoint of endpoints) {
      try {
        console.log(`🚀 Trying endpoint: ${endpoint}`);
        
        const response = await fetch(`${BASE_API_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'x-api-key': HEYGEN_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        console.log(`📊 Response status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Success from ${endpoint}:`, data);
          
          // Parse different response formats
          if (data.data && Array.isArray(data.data)) {
            avatars = data.data;
            source = 'heygen';
            message = `Successfully fetched ${avatars.length} avatars from HeyGen`;
            break;
          } else if (data.avatars && Array.isArray(data.avatars)) {
            avatars = data.avatars;
            source = 'heygen';
            message = `Successfully fetched ${avatars.length} avatars from HeyGen`;
            break;
          } else if (data.list && Array.isArray(data.list)) {
            avatars = data.list;
            source = 'heygen';
            message = `Successfully fetched ${avatars.length} avatars from HeyGen`;
            break;
          }
        } else {
          console.log(`❌ ${endpoint} failed with status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ Error with ${endpoint}:`, error);
      }
    }

    // Fallback to local avatars if HeyGen fails
    if (avatars.length === 0) {
      console.log("🔄 Falling back to local avatars...");
      avatars = [
        {
          id: 'test',
          name: 'Test Avatar',
          description: 'Test streaming avatar',
          type: 'streaming'
        },
        {
          id: 'demo',
          name: 'Demo Avatar', 
          description: 'Demo streaming avatar',
          type: 'streaming'
        },
        {
          id: 'avatar1',
          name: 'Avatar 1',
          description: 'Streaming avatar 1',
          type: 'streaming'
        },
        {
          id: 'Ann_Therapist_public',
          name: 'Ann Therapist',
          description: 'Professional therapist avatar',
          type: 'streaming'
        }
      ];
      source = 'local';
      message = 'Using local avatars (HeyGen API unavailable)';
    }

    return NextResponse.json({
      avatars,
      source,
      message,
      count: avatars.length
    });

  } catch (error) {
    console.error("❌ Error fetching avatars:", error);
    
    return NextResponse.json(
      {
        error: "Failed to fetch avatars",
        details: error instanceof Error ? error.message : "Unknown error",
        avatars: [],
        source: 'error',
        message: 'Error occurred while fetching avatars',
        count: 0
      },
      { status: 500 }
    );
  }
}


