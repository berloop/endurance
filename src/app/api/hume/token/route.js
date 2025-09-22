

// app/api/hume/token/route.js
import { NextResponse } from 'next/server';
import { fetchAccessToken } from 'hume';

export async function GET() {
  try {
    console.log('Attempting to fetch Hume token...');
    
    if (!process.env.HUME_API_KEY || !process.env.HUME_SECRET_KEY) {
      console.error('Missing Hume API credentials in environment variables');
      return NextResponse.json(
        { error: 'API credentials not configured' },
        { status: 500 }
      );
    }
    
    // Fetch access token using the hume library directly
    const accessToken = await fetchAccessToken({
      apiKey: String(process.env.HUME_API_KEY),
      secretKey: String(process.env.HUME_SECRET_KEY),
    });
    
    if (!accessToken || accessToken === "undefined") {
      console.error('No valid token received from Cosmic.');
      return NextResponse.json(
        { error: 'No valid token received from Cosmic.' },
        { status: 500 }
      );
    }
    
    console.log('Token successfully fetched');
    
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error fetching Hume token:', error);
    return NextResponse.json(
      { error: `Failed to fetch authentication token: ${error.message}` },
      { status: 500 }
    );
  }
}