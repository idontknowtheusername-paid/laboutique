import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const { conversationId, title, subject, userEmail, message, userId, userName } = await request.json();

    // Pour l'instant, on simule la création du ticket
    // TODO: Implémenter la vraie création dans Supabase une fois les tables créées
    const ticketId = `TICKET-${Date.now()}`;

    logger.info('Ticket créé (simulation):', {
      id: ticketId,
      conversationId,
      subject,
      userEmail,
      message: message.substring(0, 100) + '...'
    });

    // Envoyer l'email à l'admin
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/support/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'support@jomionstore.com',
          subject: `🎫 Nouveau ticket #${ticketId} - ${title}`,
          ticketData: {
            title,
            subject,
            userEmail,
            message,
            ticketId: ticketId
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
      ticketId: ticketId,
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