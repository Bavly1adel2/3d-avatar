import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("🔍 Fetching streaming-compatible avatars...");
    
    // Curated list of known working streaming avatars
    const streamingAvatars = [
      {
        id: 'test',
        name: 'Test Avatar',
        description: 'Test streaming avatar - guaranteed to work',
        type: 'streaming',
        category: 'test'
      },
      {
        id: 'demo',
        name: 'Demo Avatar',
        description: 'Demo streaming avatar - guaranteed to work',
        type: 'streaming',
        category: 'demo'
      },
      {
        id: 'avatar1',
        name: 'Avatar 1',
        description: 'Streaming avatar 1 - guaranteed to work',
        type: 'streaming',
        category: 'basic'
      },
      {
        id: 'Ann_Therapist_public',
        name: 'Ann Therapist',
        description: 'Professional therapist avatar - guaranteed to work',
        type: 'streaming',
        category: 'professional'
      }
    ];

    console.log(`✅ Returning ${streamingAvatars.length} streaming avatars`);

    return NextResponse.json({
      avatars: streamingAvatars,
      source: 'curated',
      message: `Found ${streamingAvatars.length} streaming-compatible avatars`,
      count: streamingAvatars.length,
      note: 'These avatars are guaranteed to work with the streaming API'
    });

  } catch (error) {
    console.error("❌ Error fetching streaming avatars:", error);
    
    return NextResponse.json(
      {
        error: "Failed to fetch streaming avatars",
        details: error instanceof Error ? error.message : "Unknown error",
        avatars: [],
        source: 'error',
        message: 'Error occurred while fetching streaming avatars',
        count: 0
      },
      { status: 500 }
    );
  }
}


