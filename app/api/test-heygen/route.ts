import { NextResponse } from 'next/server';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const BASE_API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || 'https://api.heygen.com';

export async function GET() {
  try {
    if (!HEYGEN_API_KEY) {
      return NextResponse.json(
        {
          error: "API key is missing",
          message: "Please check your .env.local file for HEYGEN_API_KEY"
        },
        { status: 400 }
      );
    }

    console.log("🧪 Testing HeyGen API connectivity...");
    
    const testEndpoints = [
      { path: '/v2/avatars', name: 'Avatar List v2' },
      { path: '/v1/avatars', name: 'Avatar List v1' },
      { path: '/v1/avatar.list', name: 'Avatar List Legacy' },
      { path: '/v1/streaming.create_token', name: 'Streaming Token' }
    ];

    const results = [];

    for (const endpoint of testEndpoints) {
      try {
        console.log(`🔍 Testing ${endpoint.name}: ${endpoint.path}`);
        
        const response = await fetch(`${BASE_API_URL}${endpoint.path}`, {
          method: 'GET',
          headers: {
            'x-api-key': HEYGEN_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        const result: any = {
          endpoint: endpoint.name,
          path: endpoint.path,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        };

        if (response.ok) {
          try {
            const data = await response.json();
            result.data = data;
            result.success = true;
            console.log(`✅ ${endpoint.name} successful:`, data);
          } catch (parseError) {
            result.success = false;
            result.parseError = 'Failed to parse JSON response';
            console.log(`⚠️ ${endpoint.name} response not JSON`);
          }
        } else {
          result.success = false;
          try {
            const errorData = await response.text();
            result.errorData = errorData;
            console.log(`❌ ${endpoint.name} failed: ${response.status} - ${errorData}`);
          } catch (error) {
            result.errorData = 'Could not read error response';
          }
        }

        results.push(result);

      } catch (error) {
        console.log(`❌ Error testing ${endpoint.name}:`, error);
        results.push({
          endpoint: endpoint.name,
          path: endpoint.path,
          status: 'ERROR',
          ok: false,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const workingEndpoints = results.filter(r => r.success);
    const failedEndpoints = results.filter(r => !r.success);

    return NextResponse.json({
      message: `HeyGen API Test Results`,
      summary: {
        total: results.length,
        working: workingEndpoints.length,
        failed: failedEndpoints.length
      },
      results,
      workingEndpoints: workingEndpoints.map(r => r.endpoint),
      failedEndpoints: failedEndpoints.map(r => r.endpoint),
      apiKey: HEYGEN_API_KEY ? `${HEYGEN_API_KEY.substring(0, 10)}...` : 'MISSING',
      baseUrl: BASE_API_URL
    });

  } catch (error) {
    console.error("❌ Error during HeyGen API test:", error);
    
    return NextResponse.json(
      {
        error: "Failed to test HeyGen API",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


