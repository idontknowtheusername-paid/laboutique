import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { conversationId, title, subject, userEmail, message, userId, userName } = await request.json();

    // Créer le ticket dans Supabase
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({
        conversation_id: conversationId,
        subject: subject,
        description: message,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        priority: 'medium',
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création ticket:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création du ticket' },
        { status: 500 }
      );
    }

    // Envoyer l'email à l'admin
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/support/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'support@jomionstore.com',
          subject: `🎫 Nouveau ticket #${ticket.id} - ${title}`,
          ticketData: {
            title,
            subject,
            userEmail,
            message,
            ticketId: ticket.id
          }
        })
      });

      if (!emailResponse.ok) {
        console.error('Erreur envoi email');
      }
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      // On continue même si l'email échoue
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket.id,
      message: 'Ticket créé avec succès'
    });

  } catch (error) {
    console.error('Erreur API create-ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}