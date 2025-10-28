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
    status: 'confirmed' | 'preparing' | 'shipped' | 'delivered';
    items?: Array<{ name: string; quantity: number }>;
    totalAmount?: number;
    estimatedDelivery?: string;
  }) {
    const templateMapping = {
      'confirmed': TEMPLATES.ORDER_CONFIRMATION,
      'preparing': TEMPLATES.ORDER_PREPARING,
      'shipped': TEMPLATES.ORDER_SHIPPED,
      'delivered': TEMPLATES.ORDER_DELIVERED
    };

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: orderData.email }];
    sendSmtpEmail.templateId = templateMapping[orderData.status];
    sendSmtpEmail.params = {
      name: orderData.name,
      orderNumber: orderData.orderNumber,
      trackingNumber: orderData.trackingNumber,
      trackingLink: orderData.trackingNumber ? 
        `https://jomionstore.com/order-tracking?tracking=${orderData.trackingNumber}` : 
        null,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      estimatedDelivery: orderData.estimatedDelivery,
      orderLink: `https://jomionstore.com/account/orders/${orderData.orderNumber}`
    };

    return apiInstance.sendTransacEmail(sendSmtpEmail);
  }
}