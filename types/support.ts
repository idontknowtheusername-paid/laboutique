export interface SupportMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'admin';
  timestamp: Date;
  conversationId: string;
  isTyping?: boolean;
}

export interface SupportConversation {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  status: 'active' | 'resolved' | 'escalated';
  createdAt: Date;
  updatedAt: Date;
  messages: SupportMessage[];
  ticketId?: string;
}

export interface SupportTicket {
  id: string;
  conversationId: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  userId?: string;
  userEmail?: string;
  userName?: string;
  createdAt: Date;
  updatedAt: Date;
  adminNotes?: string;
}

export interface MistralResponse {
  content: string;
  shouldEscalate: boolean;
  confidence: number;
}

export interface SupportConfig {
  mistralApiKey: string;
  autoEscalateKeywords: string[];
  maxMessagesBeforeEscalation: number;
  adminEmail: string;
}