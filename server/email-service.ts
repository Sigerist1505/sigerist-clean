// server/email-service.ts
import * as nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'info@sigeristluxurybags.com';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = this.getEmailConfig();
    
    if (!emailConfig) {
      console.warn('⚠️ Email service not configured - emails will not be sent');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password,
        },
      });

      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  private getEmailConfig(): EmailConfig | null {
    const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.warn(`⚠️ Missing email configuration variables: ${missingVars.join(', ')}`);
      return null;
    }

    return {
      host: process.env.EMAIL_HOST!,
      port: parseInt(process.env.EMAIL_PORT!),
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER!,
      password: process.env.EMAIL_PASSWORD!,
    };
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ Email service not configured - cannot send email');
      return false;
    }

    try {
      const mailOptions = {
        from: `"Sigerist Luxury Bags" <${this.fromEmail}>`,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text || this.stripHtml(message.html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', {
        to: message.to,
        subject: message.subject,
        messageId: result.messageId
      });
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendRegistrationConfirmation(to: string, firstName: string): Promise<boolean> {
    const subject = '¡Bienvenido a Sigerist Luxury Bags! 🎉';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #000; color: #ebc005; padding: 20px; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #ebc005; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sigerist Luxury Bags</h1>
            <p>Bolsos de Lujo Personalizados</p>
          </div>
          <div class="content">
            <h2>¡Hola ${firstName}!</h2>
            <p>¡Bienvenido a la familia Sigerist! Tu cuenta ha sido creada exitosamente.</p>
            <p>Ahora puedes disfrutar de:</p>
            <ul>
              <li>✨ Acceso a nuestra colección exclusiva de bolsos de lujo</li>
              <li>🎨 Personalización premium con bordados artesanales</li>
              <li>📦 Seguimiento de tus pedidos</li>
              <li>💌 Ofertas especiales y lanzamientos anticipados</li>
            </ul>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://sigerist.com'}" class="button">Explorar Productos</a>
            </p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp al +57 316 018 3418.</p>
            <p>¡Gracias por elegir Sigerist Luxury Bags!</p>
          </div>
          <div class="footer">
            <p>© 2024 Sigerist Luxury Bags - Medellín, Colombia</p>
            <p>Este correo fue enviado a ${to}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  async sendPasswordResetCode(to: string, firstName: string, resetCode: string): Promise<boolean> {
    const subject = 'Código de recuperación de contraseña - Sigerist Luxury Bags';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #000; color: #ebc005; padding: 20px; }
          .content { padding: 20px; background: #f9f9f9; }
          .code { background: #000; color: #ebc005; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Sigerist Luxury Bags</h1>
            <p>Recuperación de Contraseña</p>
          </div>
          <div class="content">
            <h2>¡Hola ${firstName}!</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código de 6 dígitos para continuar:</p>
            <div class="code">${resetCode}</div>
            <div class="warning">
              <strong>⏰ Importante:</strong> Este código expira en 15 minutos por seguridad.
            </div>
            <p>Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña permanecerá sin cambios.</p>
            <p>Para tu seguridad, nunca compartas este código con nadie.</p>
          </div>
          <div class="footer">
            <p>© 2024 Sigerist Luxury Bags - Medellín, Colombia</p>
            <p>Este correo fue enviado a ${to}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log('✅ Email connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Email connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();