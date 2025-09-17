import { BaseService, ServiceResponse, PaginatedResponse, PaginationParams } from './base.service';

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'product' | 'shipping' | 'refund' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  assigned_to?: string;
  tags?: string[];
  metadata?: any;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  // Relations
  user?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  assigned_agent?: {
    id: string;
    name: string;
    email: string;
  };
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'customer' | 'agent' | 'system';
  message: string;
  attachments?: string[];
  is_internal: boolean;
  created_at: string;
  // Relations
  sender?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SupportAgent {
  id: string;
  user_id: string;
  name: string;
  email: string;
  department: string;
  specialties: string[];
  is_active: boolean;
  max_tickets: number;
  current_tickets: number;
  rating: number;
  total_resolved: number;
  created_at: string;
}

export interface CreateTicketData {
  user_id: string;
  subject: string;
  description: string;
  category: SupportTicket['category'];
  priority?: SupportTicket['priority'];
  tags?: string[];
  attachments?: string[];
}

export interface TicketFilters {
  status?: SupportTicket['status'];
  category?: SupportTicket['category'];
  priority?: SupportTicket['priority'];
  assigned_to?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface SupportStats {
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  average_resolution_time: number; // en heures
  customer_satisfaction: number;
  tickets_by_category: Record<string, number>;
  tickets_by_priority: Record<string, number>;
  agent_performance: Array<{
    agent_id: string;
    name: string;
    resolved_count: number;
    avg_resolution_time: number;
    rating: number;
  }>;
}

export class SupportService extends BaseService {
  /**
   * Créer un nouveau ticket de support
   */
  static async createTicket(data: CreateTicketData): Promise<ServiceResponse<SupportTicket | null>> {
    try {
      const ticketNumber = await this.generateTicketNumber();
      
      const supabaseClient = this.getSupabaseClient() as any;
      const { data: ticket, error } = await supabaseClient
        .from('support_tickets')
        .insert({
          ticket_number: ticketNumber,
          user_id: data.user_id,
          subject: data.subject,
          description: data.description,
          category: data.category,
          priority: data.priority || 'medium',
          status: 'open',
          tags: data.tags || []
        })
        .select(`
          *,
          user:profiles(id, email, first_name, last_name)
        `)
        .single();

      if (error) throw error;

      // Créer le premier message avec la description
      await this.addMessage(ticket.id, data.user_id, 'customer', data.description, data.attachments);

      // Auto-assigner si possible
      await this.autoAssignTicket(ticket.id, data.category);

      return this.createResponse(ticket as SupportTicket);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer un ticket par son ID
   */
  static async getTicketById(ticketId: string): Promise<ServiceResponse<SupportTicket | null>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('support_tickets')
        .select(`
          *,
          user:profiles(id, email, first_name, last_name),
          assigned_agent:profiles(id, first_name, last_name, email),
          messages:support_messages(
            *,
            sender:profiles(id, first_name, last_name, email)
          )
        `)
        .eq('id', ticketId)
        .single();

      if (error) throw error;

      return this.createResponse(data as SupportTicket);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Récupérer les tickets avec filtres et pagination
   */
  static async getTickets(
    filters: TicketFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<SupportTicket>> {
    try {
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      let query = this.getSupabaseClient()
        .from('support_tickets')
        .select(`
          *,
          user:profiles(id, email, first_name, last_name),
          assigned_agent:profiles(id, first_name, last_name, email)
        `, { count: 'exact' });

      // Appliquer les filtres
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%,ticket_number.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const paginationInfo = this.calculatePagination(page, limit, total);

      return this.createPaginatedResponse((data as SupportTicket[]) || [], paginationInfo);
    } catch (error) {
      return this.createPaginatedResponse([], {
        page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false
      }, this.handleError(error));
    }
  }

  /**
   * Ajouter un message à un ticket
   */
  static async addMessage(
    ticketId: string,
    senderId: string,
    senderType: 'customer' | 'agent' | 'system',
    message: string,
    attachments?: string[],
    isInternal: boolean = false
  ): Promise<ServiceResponse<SupportMessage | null>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('support_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: senderId,
          sender_type: senderType,
          message,
          attachments: attachments || [],
          is_internal: isInternal
        })
        .select(`
          *,
          sender:profiles(id, first_name, last_name, email)
        `)
        .single();

      if (error) throw error;

      // Mettre à jour le statut du ticket si nécessaire
      if (senderType === 'customer') {
        await this.updateTicketStatus(ticketId, 'in_progress');
      }

      return this.createResponse(data as SupportMessage);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  /**
   * Assigner un ticket à un agent
   */
  static async assignTicket(
    ticketId: string,
    agentId: string,
    assignedBy: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from('support_tickets')
        .update({
          assigned_to: agentId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      // Ajouter un message système
      await this.addMessage(
        ticketId,
        assignedBy,
        'system',
        `Ticket assigné à l'agent`,
        [],
        true
      );

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Mettre à jour le statut d'un ticket
   */
  static async updateTicketStatus(
    ticketId: string,
    status: SupportTicket['status'],
    updatedBy?: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      } else if (status === 'closed') {
        updateData.closed_at = new Date().toISOString();
      }

      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from('support_tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      // Ajouter un message système si nécessaire
      if (updatedBy && (status === 'resolved' || status === 'closed')) {
        await this.addMessage(
          ticketId,
          updatedBy,
          'system',
          `Ticket ${status === 'resolved' ? 'résolu' : 'fermé'}`,
          [],
          true
        );
      }

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Mettre à jour la priorité d'un ticket
   */
  static async updateTicketPriority(
    ticketId: string,
    priority: SupportTicket['priority'],
    updatedBy: string
  ): Promise<ServiceResponse<boolean>> {
    try {
      const supabaseClient = this.getSupabaseClient() as any;
      const { error } = await supabaseClient
        .from('support_tickets')
        .update({
          priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (error) throw error;

      // Ajouter un message système
      await this.addMessage(
        ticketId,
        updatedBy,
        'system',
        `Priorité changée en ${priority}`,
        [],
        true
      );

      return this.createResponse(true);
    } catch (error) {
      return this.createResponse(false, this.handleError(error));
    }
  }

  /**
   * Récupérer les agents de support
   */
  static async getSupportAgents(): Promise<ServiceResponse<SupportAgent[]>> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('support_agents')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;

      return this.createResponse((data as SupportAgent[]) || []);
    } catch (error) {
      return this.createResponse([], this.handleError(error));
    }
  }

  /**
   * Auto-assigner un ticket
   */
  static async autoAssignTicket(ticketId: string, category: string): Promise<void> {
    try {
      // Trouver l'agent le plus approprié
      const { data: agents } = await this.getSupabaseClient()
        .from('support_agents')
        .select('*')
        .eq('is_active', true)
        .contains('specialties', [category])
        .lt('current_tickets', this.getSupabaseClient().rpc('max_tickets'))
        .order('current_tickets', { ascending: true })
        .limit(1);

      if (agents && agents.length > 0) {
        await this.assignTicket(ticketId, (agents[0] as any).id, 'system');
      }
    } catch (error) {
      console.error('Erreur lors de l\'auto-assignation:', error);
    }
  }

  /**
   * Récupérer les statistiques de support
   */
  static async getSupportStats(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ServiceResponse<SupportStats | null>> {
    try {
      const fromDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = dateTo || new Date().toISOString();

      // Récupérer les tickets dans la période
      const { data: tickets } = await this.getSupabaseClient()
        .from('support_tickets')
        .select('*')
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      const ticketsData = tickets as SupportTicket[] || [];

      // Calculer les statistiques de base
      const totalTickets = ticketsData.length;
      const openTickets = ticketsData.filter(t => ['open', 'in_progress', 'waiting_customer'].includes(t.status)).length;
      const resolvedTickets = ticketsData.filter(t => t.status === 'resolved' || t.status === 'closed').length;

      // Calculer le temps de résolution moyen
      const resolvedWithTime = ticketsData.filter(t => t.resolved_at);
      const avgResolutionTime = resolvedWithTime.length > 0
        ? resolvedWithTime.reduce((sum, ticket) => {
            const created = new Date(ticket.created_at).getTime();
            const resolved = new Date(ticket.resolved_at!).getTime();
            return sum + (resolved - created);
          }, 0) / resolvedWithTime.length / (1000 * 60 * 60) // en heures
        : 0;

      // Tickets par catégorie
      const ticketsByCategory = ticketsData.reduce((acc, ticket) => {
        acc[ticket.category] = (acc[ticket.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Tickets par priorité
      const ticketsByPriority = ticketsData.reduce((acc, ticket) => {
        acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Performance des agents (simplifié)
      const agentPerformance: SupportStats['agent_performance'] = [];

      const stats: SupportStats = {
        total_tickets: totalTickets,
        open_tickets: openTickets,
        resolved_tickets: resolvedTickets,
        average_resolution_time: Math.round(avgResolutionTime),
        customer_satisfaction: 4.2, // TODO: Calculer à partir des évaluations
        tickets_by_category: ticketsByCategory,
        tickets_by_priority: ticketsByPriority,
        agent_performance: agentPerformance
      };

      return this.createResponse(stats);
    } catch (error) {
      return this.createResponse({
        total_tickets: 0,
        open_tickets: 0,
        closed_tickets: 0,
        pending_tickets: 0,
        resolved_tickets: 0,
        average_resolution_time: 0,
        customer_satisfaction: 0,
        response_time: 0,
        escalation_rate: 0,
        tickets_by_category: {},
        tickets_by_priority: {},
        agent_performance: []
      }, this.handleError(error));
    }
  }

  /**
   * Rechercher dans les tickets
   */
  static async searchTickets(
    query: string,
    filters: TicketFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<SupportTicket>> {
    return this.getTickets({ ...filters, search: query }, pagination);
  }

  /**
   * Générer un numéro de ticket unique
   */
  private static async generateTicketNumber(): Promise<string> {
    const prefix = 'SUP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Récupérer les tickets d'un utilisateur
   */
  static async getUserTickets(
    userId: string,
    pagination: PaginationParams = {}
  ): Promise<PaginatedResponse<SupportTicket>> {
    return this.getTickets({ user_id: userId }, pagination);
  }

  /**
   * Fermer automatiquement les tickets résolus anciens
   */
  static async autoCloseResolvedTickets(daysOld: number = 7): Promise<ServiceResponse<number>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const supabaseClient = this.getSupabaseClient() as any;
      const { data, error } = await supabaseClient
        .from('support_tickets')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('status', 'resolved')
        .lt('resolved_at', cutoffDate.toISOString())
        .select('id');

      if (error) throw error;

      return this.createResponse(data?.length || 0);
    } catch (error) {
      return this.createResponse(0, this.handleError(error));
    }
  }
}