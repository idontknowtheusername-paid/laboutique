import { SupportTicket, SupportConversation } from '@/types/support';
import { supabase } from '@/lib/supabase';

export class TicketService {
  async createTicket(
    conversationId: string,
    subject: string,
    description: string,
    userInfo: {
      userId?: string;
      userEmail?: string;
      userName?: string;
    }
  ): Promise<{ success: boolean; ticketId?: string; error?: string }> {
    try {
      const ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'> = {
        conversationId,
        subject,
        description,
        priority: this.determinePriority(description),
        status: 'open',
        userId: userInfo.userId,
        userEmail: userInfo.userEmail,
        userName: userInfo.userName,
      };

      const { data, error } = await (supabase as any)
        .from('support_tickets')
        .insert([{
          ...ticket,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur création ticket:', error);
        return { success: false, error: error.message };
      }

      // Notifier l'admin par email (optionnel)
      await this.notifyAdmin(data.id, ticket);

      return { success: true, ticketId: data.id };
    } catch (error) {
      console.error('Erreur TicketService:', error);
      return { success: false, error: 'Erreur lors de la création du ticket' };
    }
  }

  async getTicketsForAdmin(): Promise<{ success: boolean; tickets?: SupportTicket[]; error?: string }> {
    try {
      const { data, error } = await (supabase as any)
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      const tickets: SupportTicket[] = data.map((ticket: any) => ({
        id: ticket.id,
        conversationId: ticket.conversation_id,
        subject: ticket.subject,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        userId: ticket.user_id,
        userEmail: ticket.user_email,
        userName: ticket.user_name,
        createdAt: new Date(ticket.created_at),
        updatedAt: new Date(ticket.updated_at),
        adminNotes: ticket.admin_notes,
      }));

      return { success: true, tickets };
    } catch (error) {
      console.error('Erreur récupération tickets:', error);
      return { success: false, error: 'Erreur lors de la récupération des tickets' };
    }
  }

  async updateTicketStatus(
    ticketId: string,
    status: SupportTicket['status'],
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await (supabase as any)
        .from('support_tickets')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ticketId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur mise à jour ticket:', error);
      return { success: false, error: 'Erreur lors de la mise à jour du ticket' };
    }
  }

  private determinePriority(description: string): SupportTicket['priority'] {
    const urgentKeywords = ['urgent', 'critique', 'bloqué', 'ne fonctionne pas', 'erreur'];
    const highKeywords = ['problème', 'commande', 'livraison', 'paiement'];
    
    const descLower = description.toLowerCase();
    
    if (urgentKeywords.some(keyword => descLower.includes(keyword))) {
      return 'urgent';
    }
    
    if (highKeywords.some(keyword => descLower.includes(keyword))) {
      return 'high';
    }
    
    return 'medium';
  }

  private async notifyAdmin(ticketId: string, ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'>) {
    // Ici vous pouvez implémenter l'envoi d'email à l'admin
    // Pour l'instant, on log juste l'information
    console.log(`Nouveau ticket créé: ${ticketId}`, {
      subject: ticket.subject,
      priority: ticket.priority,
      userEmail: ticket.userEmail,
    });
  }
}