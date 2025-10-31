import * as brevo from '@getbrevo/brevo';

// Template IDs from Brevo
const TEMPLATES = {
  NEWSLETTER_WELCOME: 3,
  CONTACT_CONFIRMATION: 4,
  ORDER_CONFIRMATION: 5,
  ORDER_PREPARING: 6,
  ORDER_SHIPPED: 7,
  ORDER_DELIVERED: 8
} as const;

// Initialize Brevo API
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY || ''
);

export const BrevoService = {
  // Newsletter emails
  async sendNewsletterWelcome(email: string, name?: string) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.templateId = TEMPLATES.NEWSLETTER_WELCOME;
    sendSmtpEmail.params = {
      email,
      name: name || email.split('@')[0],
      unsubscribeLink: `https://jomionstore.com/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
    };

    return apiInstance.sendTransacEmail(sendSmtpEmail);
  },

  // Contact form emails
  async sendContactConfirmation(email: string, name: string, subject: string) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.templateId = TEMPLATES.CONTACT_CONFIRMATION;
    sendSmtpEmail.params = {
      name,
      subject,
      supportEmail: 'support@jomionstore.com'
    };

    return apiInstance.sendTransacEmail(sendSmtpEmail);
  },

  // Order status emails
  async sendOrderStatusEmail(orderData: {
    email: string;
    name: string;
    orderNumber: string;
    trackingNumber?: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'confirmed' | 'preparing';
    items?: Array<{ name: string; quantity: number }>;
    totalAmount?: number;
    estimatedDelivery?: string;
  }) {
    const templateMapping = {
      'confirmed': TEMPLATES.ORDER_CONFIRMATION,
      'preparing': TEMPLATES.ORDER_PREPARING,
      'processing': TEMPLATES.ORDER_PREPARING, // Alias pour processing
      'shipped': TEMPLATES.ORDER_SHIPPED,
      'delivered': TEMPLATES.ORDER_DELIVERED,
      'pending': TEMPLATES.ORDER_CONFIRMATION, // Utiliser confirmation pour pending
      'cancelled': null // Pas de template pour annulation, utiliser email simple
    };

    const statusMessages = {
      'pending': 'Votre commande est en attente de confirmation',
      'processing': 'Votre commande est en cours de préparation',
      'shipped': 'Votre commande a été expédiée',
      'delivered': 'Votre commande a été livrée',
      'cancelled': 'Votre commande a été annulée',
      'confirmed': 'Votre commande a été confirmée',
      'preparing': 'Votre commande est en cours de préparation'
    };

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: orderData.email }];

    const templateId = templateMapping[orderData.status];

    if (templateId) {
      // Utiliser le template existant
      sendSmtpEmail.templateId = templateId;
      sendSmtpEmail.params = {
        name: orderData.name,
        orderNumber: orderData.orderNumber,
        trackingNumber: orderData.trackingNumber,
        trackingLink: orderData.trackingNumber ?
          `https://jomionstore.com/order-tracking?tracking=${orderData.trackingNumber}` :
          null,
        items: orderData.items,
        totalAmount: orderData.totalAmount?.toLocaleString('fr-BJ', {
          style: 'currency',
          currency: 'XOF',
          minimumFractionDigits: 0
        }),
        estimatedDelivery: orderData.estimatedDelivery,
        orderLink: `https://jomionstore.com/account/orders/${orderData.orderNumber}`
      };

      return apiInstance.sendTransacEmail(sendSmtpEmail);
    } else {
      // For cancelled orders or other statuses without templates, send a simple email
      sendSmtpEmail.subject = `Mise à jour de votre commande ${orderData.orderNumber}`;
      sendSmtpEmail.htmlContent = `
        <p>Bonjour ${orderData.name},</p>
        <p>${statusMessages[orderData.status]}</p>
        <p>Numéro de commande: ${orderData.orderNumber}</p>
        <p>Cordialement,<br>L'équipe JomionStore</p>
      `;

      return apiInstance.sendTransacEmail(sendSmtpEmail);
    }
  }
};