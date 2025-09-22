// app/api/hume/apikey/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!process.env.HUME_API_KEY) {
      console.error('Missing Hume API key in environment variables');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Return the API key from environment variables
    return NextResponse.json({ apiKey: process.env.HUME_API_KEY });
  } catch (error) {
    console.error('Error fetching Hume API key:', error);
    return NextResponse.json(
      { error: `Failed to fetch API key: ${error.message}` },
      { status: 500 }
    );
  }
}