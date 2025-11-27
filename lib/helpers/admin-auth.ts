import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface AdminAuthResult {
  authorized: boolean;
  userId?: string;
  error?: NextResponse;
}

/**
 * Vérifie si l'utilisateur actuel est un admin
 * À utiliser dans les route handlers pour une double protection
 * (en plus du middleware)
 */
export async function verifyAdminAuth(): Promise<AdminAuthResult> {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Récupérer la session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return {
        authorized: false,
        error: NextResponse.json(
          { success: false, error: 'Non autorisé - Authentification requise' },
          { status: 401 }
        )
      };
    }

    // Vérifier le rôle admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return {
        authorized: false,
        error: NextResponse.json(
          { success: false, error: 'Accès refusé - Droits administrateur requis' },
          { status: 403 }
        )
      };
    }

    return {
      authorized: true,
      userId: session.user.id
    };
  } catch (error) {
    console.error('Erreur vérification admin:', error);
    return {
      authorized: false,
      error: NextResponse.json(
        { success: false, error: 'Erreur serveur lors de la vérification' },
        { status: 500 }
      )
    };
  }
}

/**
 * Helper pour créer une réponse d'erreur 401
 */
export function unauthorizedResponse(message = 'Non autorisé') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

/**
 * Helper pour créer une réponse d'erreur 403
 */
export function forbiddenResponse(message = 'Accès refusé') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  );
}
