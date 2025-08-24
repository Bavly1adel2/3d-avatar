const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

export async function POST() {
  try {
    if (!HEYGEN_API_KEY) {
      throw new Error("API key is missing from .env");
    }
    const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

    console.log("Making request to:", `${baseApiUrl}/v1/streaming.create_token`);
    console.log("Using API key:", HEYGEN_API_KEY.substring(0, 10) + "...");

    const res = await fetch(`${baseApiUrl}/v1/streaming.create_token`, {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", res.status);
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const errorText = await res.text();
      console.error("HeyGen API error response:", errorText);
      throw new Error(`HeyGen API returned ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("HeyGen API response data:", data);

    if (!data.data || !data.data.token) {
      throw new Error("Invalid response format from HeyGen API");
    }

    return new Response(data.data.token, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error) {
    console.error("Error retrieving access token:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to retrieve access token",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
