import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface Ticket {
  id: string;
  ticket_number: string;
  user_id: string;
  type: 'bug' | 'feature_request' | 'question' | 'complaint' | 'refund' | 'technical';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  assigned_to?: string;
  labels: string[];
  attachments: string[];
  metadata?: any;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  comment: string;
  is_internal: boolean;
  attachments: string[];
  created_at: string;
}

export interface TicketTemplate {
  id: string;
  name: string;
  type: Ticket['type'];
  title_template: string;
  description_template: string;
  default_priority: Ticket['priority'];
  default_labels: string[];
  is_active: boolean;
}

export class TicketsService extends BaseService {
  /**
   * Créer un ticket
   */
  static async createTicket(data: {
    user_id: string;
    type: Ticket['type'];
    title: string;
    description: string;
    priority?: Ticket['priority'];
    labels?: string[];
    attachments?: string[];
  }): Promise<ServiceResponse<Ticket | null>> {
    try {
      const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const supabaseClient = this.getSupabaseClient() as any;
      const { data: ticket, error } = await supabaseClient
        .from('tickets')
        .insert({
          ticket_number: ticketNumber,
          user_id: data.user_id,
          type: data.type,
          title: data.title,
          description: data.description,
          priority: data.priority || 'medium',
          status: 'open',
          labels: data.labels || [],
          attachments: data.attachments || []
        })
        .select()
        .single();

      if (error) throw error;
      return this.createResponse(ticket as Ticket);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les tickets avec filtres
   */
  static async getTickets(filters: {
    user_id?: string;
    type?: Ticket['type'];
    status?: Ticket['status'];
    priority?: Ticket['priority'];
    assigned_to?: string;
    search?: string;
  } = {}, pagination: PaginationParams = {}): Promise<PaginatedResponse<Ticket>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('tickets')
        .select('*', { count: 'exact' });

      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'search') {
          query = query.eq(key, value);
        }
      });

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const paginationInfo = this.calculatePagination(page, limit, total);

      return this.createPaginatedResponse((data as Ticket[]) || [], paginationInfo);
    } catch (error) {
      return this.createPaginatedResponse([], {
        page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
      }, this.handleError(error));
    }
  }

  /**
   * Ajouter un commentaire
   */
  static async addComment(
    ticketId: string,
    userId: string,
    comment: string,
    isInternal: boolean = false,
    attachments: string[] = []
  ): Promise<ServiceResponse<TicketComment | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          user_id: userId,
          comment,
          is_internal: isInternal,
          attachments
        })
        .select()
        .single();

      if (error) throw error;
      return this.createResponse(data as TicketComment);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Mettre à jour le statut
   */
  static async updateStatus(
    ticketId: string,
    status: Ticket['status']
  ): Promise<ServiceResponse<boolean>> {
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;
      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Assigner un ticket
   */
  static async assignTicket(ticketId: string, assignedTo: string): Promise<ServiceResponse<boolean>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from('tickets')
        .update({
          assigned_to: assignedTo,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;
      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Récupérer les statistiques
   */
  static async getStats(): Promise<ServiceResponse<{
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    by_type: Record<string, number>;
    by_priority: Record<string, number>;
  }>> {
    try {
      const { data: tickets } = await this.getSupabaseClient()
        .from('tickets')
        .select('type, priority, status');

      const ticketsData = tickets as Ticket[] || [];
      
      const stats = {
        total: ticketsData.length,
        open: ticketsData.filter(t => t.status === 'open').length,
        in_progress: ticketsData.filter(t => t.status === 'in_progress').length,
        resolved: ticketsData.filter(t => t.status === 'resolved').length,
        by_type: ticketsData.reduce((acc, t) => {
          acc[t.type] = (acc[t.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        by_priority: ticketsData.reduce((acc, t) => {
          acc[t.priority] = (acc[t.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      return this.createResponse(stats);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}