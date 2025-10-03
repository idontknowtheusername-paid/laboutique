// Système de tracking des interactions utilisateur
export interface TrackingEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp: number;
  userId?: string;
  sessionId: string;
  page: string;
  userAgent: string;
}

export interface ProductInteraction {
  productId: string;
  productName: string;
  category: string;
  price: number;
  action: 'view' | 'add_to_cart' | 'add_to_wishlist' | 'click' | 'search';
  timestamp: number;
}

export interface SearchTracking {
  query: string;
  resultsCount: number;
  filters?: string[];
  timestamp: number;
}

export interface PageViewTracking {
  page: string;
  title: string;
  referrer?: string;
  timestamp: number;
  loadTime?: number;
}

class AnalyticsTracker {
  private sessionId: string;
  private events: TrackingEvent[] = [];
  private isEnabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createEvent(
    event: string,
    category: string,
    action: string,
    label?: string,
    value?: number
  ): TrackingEvent {
    return {
      event,
      category,
      action,
      label,
      value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
    };
  }

  // Tracking des interactions produit
  trackProductInteraction(data: ProductInteraction): void {
    if (!this.isEnabled) return;

    const event = this.createEvent(
      'product_interaction',
      'ecommerce',
      data.action,
      `${data.productName} (${data.productId})`,
      data.price
    );

    this.events.push(event);
    this.sendEvent(event);
  }

  // Tracking des recherches
  trackSearch(data: SearchTracking): void {
    if (!this.isEnabled) return;

    const event = this.createEvent(
      'search',
      'user_behavior',
      'search_query',
      data.query,
      data.resultsCount
    );

    this.events.push(event);
    this.sendEvent(event);
  }

  // Tracking des vues de page
  trackPageView(data: PageViewTracking): void {
    if (!this.isEnabled) return;

    const event = this.createEvent(
      'page_view',
      'navigation',
      'page_load',
      data.title,
      data.loadTime
    );

    this.events.push(event);
    this.sendEvent(event);
  }

  // Tracking des clics sur les boutons
  trackButtonClick(buttonName: string, location: string): void {
    if (!this.isEnabled) return;

    const event = this.createEvent(
      'button_click',
      'user_interaction',
      'click',
      `${buttonName} - ${location}`
    );

    this.events.push(event);
    this.sendEvent(event);
  }

  // Tracking des erreurs
  trackError(error: string, context?: string): void {
    if (!this.isEnabled) return;

    const event = this.createEvent(
      'error',
      'system',
      'error_occurred',
      `${error}${context ? ` - ${context}` : ''}`
    );

    this.events.push(event);
    this.sendEvent(event);
  }

  // Tracking des performances
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    if (!this.isEnabled) return;

    const event = this.createEvent(
      'performance',
      'system',
      metric,
      unit,
      value
    );

    this.events.push(event);
    this.sendEvent(event);
  }

  // Envoi des événements (simulation - à remplacer par votre service d'analytics)
  private sendEvent(event: TrackingEvent): void {
    // Simulation d'envoi vers un service d'analytics
    console.log('📊 Analytics Event:', event);
    
    // Ici vous pourriez envoyer vers Google Analytics, Mixpanel, etc.
    // Exemple pour Google Analytics 4:
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', event.action, {
    //     event_category: event.category,
    //     event_label: event.label,
    //     value: event.value
    //   });
    // }
  }

  // Récupération des événements pour debug
  getEvents(): TrackingEvent[] {
    return [...this.events];
  }

  // Export des données pour analyse
  exportData(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      events: this.events,
      timestamp: Date.now()
    }, null, 2);
  }
}

// Instance singleton
export const analytics = new AnalyticsTracker();

// Hooks React pour le tracking
export const useAnalytics = () => {
  return {
    trackProductInteraction: analytics.trackProductInteraction.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackButtonClick: analytics.trackButtonClick.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    getEvents: analytics.getEvents.bind(analytics),
    exportData: analytics.exportData.bind(analytics)
  };
};

export default analytics;