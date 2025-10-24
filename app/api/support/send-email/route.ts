import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, ticketData } = await request.json();

    // Configuration du transporteur email
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL || 'support@jomionstore.com',
        pass: process.env.ADMIN_EMAIL_PASSWORD
      }
    });

    // Contenu de l'email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">🎫 Nouveau ticket de support</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Détails du ticket</h3>
          <p><strong>Client :</strong> ${ticketData.userEmail}</p>
          <p><strong>Titre :</strong> ${ticketData.title}</p>
          <p><strong>Sujet :</strong> ${ticketData.subject}</p>
          <p><strong>Message :</strong></p>
          <div style="background-color: white; padding: 15px; border-left: 4px solid #f97316; margin: 10px 0;">
            ${ticketData.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>💡 Action requise :</strong></p>
          <p style="margin: 5px 0 0 0;">Répondez directement à cet email pour contacter le client.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Support JomionStore - ${new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    `;

    // Envoyer l'email
    const info = await transporter.sendMail({
      from: `"Support JomionStore" <${process.env.ADMIN_EMAIL || 'support@jomionstore.com'}>`,
      to: to,
      subject: subject,
      html: htmlContent
    });

    console.log('Email envoyé:', info.messageId);
    
    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Erreur envoi email:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi de l\'email' },
      { status: 500 }
    );
  }
}