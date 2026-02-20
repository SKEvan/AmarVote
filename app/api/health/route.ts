import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

// GET /api/health - Health check endpoint
export async function GET(request: NextRequest) {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: 'OK',
    database: 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    // Try to connect to database
    await dbConnect();
    healthCheck.database = 'connected';
    healthCheck.status = 'OK';
    
    return NextResponse.json(healthCheck, { status: 200 });
  } catch (error: any) {
    console.error('Health check - Database connection failed:', error.message);
    
    healthCheck.database = 'disconnected';
    healthCheck.status = 'DEGRADED';
    
    // Still return 200 but with degraded status
    // Application can function without database for basic features
    return NextResponse.json({
      ...healthCheck,
      error: 'Database unavailable',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 200 });
  }
}