import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;
    const body = await request.json();
    
    const {
      event_type,
      session_id,
      visitor_id,
      page_url,
      page_path,
      page_title,
      page_referrer,
      user_agent,
      device_info,
      geo_info,
      utm_params,
      event_data
    } = body;

    // Validation
    if (!event_type || !visitor_id) {
      return NextResponse.json(
        { success: false, error: 'event_type et visitor_id sont requis' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur connecté (si existe)
    const { data: { user } } = await supabase.auth.getUser();
    const user_id = user?.id || null;

    // Récupérer l'IP depuis les headers
    const headersList = await headers();
    const ip_address = headersList.get('x-forwarded-for') || 
                      headersList.get('x-real-ip') || 
                      'unknown';

    // 1. GÉRER LA SESSION
    let session_record_id = null;
    
    if (session_id) {
      // Vérifier si la session existe
      const { data: existingSession } = await supabase
        .from('analytics_sessions')
        .select('id')
        .eq('session_id', session_id)
        .single();

      if (existingSession && existingSession.id) {
        session_record_id = existingSession.id as number;
        
        // Mettre à jour last_activity_at
        await supabase
          .from('analytics_sessions')
          .update({ 
            last_activity_at: new Date().toISOString(),
            user_id: user_id // Mettre à jour si l'utilisateur se connecte
          } as any)
          .eq('id', session_record_id);
      } else {
        // Créer une nouvelle session
        console.log('Création nouvelle session:', { session_id, visitor_id, device_info });
        
        const { data: newSession, error: sessionError } = await supabase
          .from('analytics_sessions')
          .insert({
            session_id,
            visitor_id,
            user_id,
            user_agent: user_agent || headersList.get('user-agent'),
            browser: device_info?.browser,
            browser_version: device_info?.browser_version,
            os: device_info?.os,
            os_version: device_info?.os_version,
            device_type: device_info?.device_type,
            device_vendor: device_info?.device_vendor,
            device_model: device_info?.device_model,
            ip_address,
            country: geo_info?.country,
            city: geo_info?.city,
            region: geo_info?.region,
            timezone: geo_info?.timezone,
            referrer: page_referrer,
            referrer_domain: page_referrer ? (() => {
              try {
                return new URL(page_referrer).hostname;
              } catch {
                return null;
              }
            })() : null,
            utm_source: utm_params?.utm_source,
            utm_medium: utm_params?.utm_medium,
            utm_campaign: utm_params?.utm_campaign,
            utm_term: utm_params?.utm_term,
            utm_content: utm_params?.utm_content
          } as any)
          .select('id')
          .single();

        if (sessionError) {
          console.error('❌ Erreur création session:', sessionError);
        } else {
          console.log('✅ Session créée avec succès:', newSession?.id);
          session_record_id = newSession?.id as number;
        }
      }
    }

    // 2. GÉRER LES VISITEURS ACTIFS
    if (event_type === 'heartbeat' || event_type === 'page_view') {
      await supabase
        .from('analytics_active_visitors')
        .upsert({
          visitor_id,
          session_id: session_record_id,
          user_id,
          current_page_path: page_path,
          current_page_title: page_title,
          last_heartbeat_at: new Date().toISOString()
        } as any, {
          onConflict: 'visitor_id'
        });
    }

    // 3. ENREGISTRER LA PAGE VUE
    if (event_type === 'page_view' && page_url && page_path) {
      const { error: pageViewError } = await supabase
        .from('analytics_page_views')
        .insert({
          session_id: session_record_id,
          visitor_id,
          user_id,
          page_url,
          page_path,
          page_title,
          page_referrer
        } as any);

      if (pageViewError) {
        console.error('Erreur page view:', pageViewError);
      }

      // Incrémenter le compteur de pages vues dans la session
      if (session_record_id) {
        await supabase.rpc('increment', {
          table_name: 'analytics_sessions',
          row_id: session_record_id,
          column_name: 'page_views_count'
        }).catch(() => {
          // Fallback si la fonction RPC n'existe pas
          supabase
            .from('analytics_sessions')
            .update({ page_views_count: supabase.raw('page_views_count + 1') })
            .eq('id', session_record_id);
        });
      }
    }

    // 4. ENREGISTRER L'ÉVÉNEMENT
    const { error: eventError } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        session_id: session_record_id,
        visitor_id,
        user_id,
        page_url,
        referrer: page_referrer,
        user_agent: user_agent || headersList.get('user-agent'),
        ip_address,
        metadata: event_data || {}
      } as any);

    if (eventError) {
      console.error('Erreur événement:', eventError);
      return NextResponse.json(
        { success: false, error: eventError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      session_id: session_record_id
    });

  } catch (error: any) {
    console.error('Erreur API tracking:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Endpoint GET pour vérifier que l'API fonctionne
export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Analytics tracking API is running',
    endpoints: {
      POST: '/api/analytics/track - Track events, page views, and sessions'
    }
  });
}
