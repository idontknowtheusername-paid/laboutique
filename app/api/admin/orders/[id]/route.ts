import { NextRequest, NextResponse } from 'next/server';
import { OrdersService } from '@/lib/services/orders.service';
import { BrevoService } from '@/lib/services/brevo.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await OrdersService.getById(id);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Erreur API GET order:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, notify_customer = true } = body;

    // Récupérer la commande actuelle pour comparaison
    const currentOrder = await OrdersService.getById(id);
    if (!currentOrder.success || !currentOrder.data) {
      return NextResponse.json(
        { success: false, error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    const oldStatus = currentOrder.data.status;

    // Mettre à jour la commande
    const result = await OrdersService.update({
      id,
      status,
      notes
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // Créer un log de changement de statut
    if (status && status !== oldStatus) {
      try {
        await OrdersService.logStatusChange(id, oldStatus, status, 'admin');
      } catch (logError) {
        console.error('Erreur lors du log de changement:', logError);
        // Ne pas faire échouer la requête pour un problème de log
      }
    }

    // Envoyer notification email au client si demandé et si le statut a changé
    if (notify_customer && status && status !== oldStatus && currentOrder.data.user?.email) {
      try {
        await BrevoService.sendOrderStatusEmail({
          email: currentOrder.data.user.email,
          name: `${currentOrder.data.user.first_name || ''} ${currentOrder.data.user.last_name || ''}`.trim(),
          orderNumber: currentOrder.data.order_number || currentOrder.data.id,
          status: status,
          totalAmount: currentOrder.data.total_amount
        });
      } catch (emailError) {
        console.error('Erreur envoi email:', emailError);
        // Ne pas faire échouer la requête pour un problème d'email
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: status !== oldStatus 
        ? `Statut mis à jour de "${oldStatus}" vers "${status}"` 
        : 'Commande mise à jour'
    });
  } catch (error) {
    console.error('Erreur API PUT order:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}