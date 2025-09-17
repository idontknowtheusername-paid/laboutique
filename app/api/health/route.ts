import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    // Check Supabase configuration
    const supabaseConfigured = isSupabaseConfigured();
    
    // Test database connection
    let databaseConnected = false;
    let databaseError = null;
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('count')
        .limit(1);
      
      databaseConnected = !error;
      if (error) databaseError = error.message;
    } catch (err) {
      databaseError = err instanceof Error ? err.message : 'Unknown database error';
    }

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        supabase: {
          configured: supabaseConfigured,
          connected: databaseConnected,
          error: databaseError
        }
      },
      environment: {
        node_env: process.env.NODE_ENV || 'development',
        has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    };

    const statusCode = supabaseConfigured && databaseConnected ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}