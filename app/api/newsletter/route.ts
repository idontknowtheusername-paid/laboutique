// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { BrevoService } from '@/lib/services/brevo.service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validation de l'email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Email invalide' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Vérifier si l'email existe déjà
    const { data: existingSubscriber } = await supabase
      .from('newsletters')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (existingSubscriber) {
      if ((existingSubscriber as any)?.status === 'active') {
        return NextResponse.json(
          { success: false, error: 'Cet email est déjà abonné à notre newsletter' },
          { status: 409 }
        );
      } else {
        // Réactiver l'abonnement
        const { error: updateError } = await supabase
          .from('newsletters')
          .update({ 
            status: 'active',
            subscribed_at: new Date().toISOString()
          } as any)
          .eq('id', (existingSubscriber as any)?.id);

        if (updateError) {
          throw updateError;
        }

        return NextResponse.json({
          success: true,
          message: 'Abonnement réactivé avec succès !'
        });
      }
    }

    // Créer un nouvel abonnement
    const { error: insertError } = await supabase
      .from('newsletters')
      .insert({
        email: email.toLowerCase(),
        status: 'active',
        subscribed_at: new Date().toISOString(),
        source: 'website_footer'
      } as any);

    if (insertError) {
      throw insertError;
    }

    // Envoyer l'email de bienvenue via Brevo
    await BrevoService.sendNewsletterWelcome(email);

    return NextResponse.json({
      success: true,
      message: 'Abonnement à la newsletter réussi ! Merci de votre confiance.'
    });

  } catch (error) {
    console.error('Erreur newsletter:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de l\'abonnement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Email invalide' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Désabonner (soft delete)
    const { error } = await supabase
      .from('newsletters')
      .update({ 
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase())
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Désabonnement effectué avec succès'
    });

  } catch (error) {
    console.error('Erreur désabonnement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du désabonnement' },
      { status: 500 }
    );
  }
}