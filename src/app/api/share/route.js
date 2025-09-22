import { NextResponse } from 'next/server';

// Skip validation during build time
export const dynamic = 'force-dynamic';
// Skip static generation for this route
export const fetchCache = 'force-no-store';
// Increase the revalidation time
export const revalidate = 0;

export async function POST(request) {
  try {
    // Import prisma client dynamically to avoid build-time issues
    const { prisma } = await import('@/lib/db');
    
    const { config, shareId } = await request.json();

    // Save configuration to database
    const savedConfig = await prisma.shareConfiguration.create({
      data: {
        shareId,
        config: config
      }
    });

    return NextResponse.json({ 
      success: true, 
      shareId: savedConfig.shareId 
    });
  } catch (error) {
    console.error('Share configuration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Could not save configuration' 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Import prisma client dynamically to avoid build-time issues
    const { prisma } = await import('@/lib/db');
    
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json({ 
        success: false, 
        error: 'No shareId provided' 
      }, { status: 400 });
    }

    const savedConfig = await prisma.shareConfiguration.findUnique({
      where: { shareId }
    });

    if (!savedConfig) {
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      config: savedConfig.config 
    });
  } catch (error) {
    console.error('Retrieve configuration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Could not retrieve configuration' 
    }, { status: 500 });
  }
}