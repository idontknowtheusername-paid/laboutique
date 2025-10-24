import { NextRequest, NextResponse } from 'next/server';
import { TicketService } from '@/lib/support/ticket-service';

export async function GET(request: NextRequest) {
  try {
    const ticketService = new TicketService();
    const result = await ticketService.getTicketsForAdmin();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur récupération tickets:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { conversationId, subject, description, userInfo } = await request.json();

    if (!conversationId || !subject || !description) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const ticketService = new TicketService();
    const result = await ticketService.createTicket(
      conversationId,
      subject,
      description,
      userInfo
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur création ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du ticket' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { ticketId, status, adminNotes } = await request.json();

    if (!ticketId || !status) {
      return NextResponse.json(
        { success: false, error: 'Ticket ID et statut requis' },
        { status: 400 }
      );
    }

    const ticketService = new TicketService();
    const result = await ticketService.updateTicketStatus(ticketId, status, adminNotes);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur mise à jour ticket:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du ticket' },
      { status: 500 }
    );
  }
}