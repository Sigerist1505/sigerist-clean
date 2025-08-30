// server/email-service.ts
import * as nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  dkim?: {
    domainName: string;
    keySelector: string;
    privateKey: string;
  };
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

  private async initializeFallbackTransporter() {
    console.log('🔄 Attempting to initialize fallback email configuration...');
    
    const fallbackConfigs = [
      {
        host: 'mail.privateemail.com',
        port: 587,
        secure: false,
        description: 'Namecheap Private Email (TLS)'
      },
      {
        host: 'smtp.privateemail.com', 
        port: 587,
        secure: false,
        description: 'Namecheap SMTP Alt (TLS)'
      },
      {
        host: 'mail.privateemail.com',
        port: 465,
        secure: true,
        description: 'Namecheap Private Email (SSL)'
      }
    ];

    for (const config of fallbackConfigs) {
      try {
        console.log(`🔄 Trying: ${config.description}`);
        
        const fallbackTransportConfig: any = {
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: {
            user: process.env.EMAIL_USER!,
            pass: process.env.EMAIL_PASSWORD!,
          },
          connectionTimeout: 30000, // Shorter timeout for fallback attempts
          socketTimeout: 30000,
          greetingTimeout: 15000,
          pool: false,
          requireTLS: !config.secure,
          tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3'
          }
        };

        const testTransporter = nodemailer.createTransporter(fallbackTransportConfig);
        await testTransporter.verify();
        
        console.log(`✅ Fallback configuration successful: ${config.description}`);
        this.transporter = testTransporter;
        return;
      } catch (error) {
        console.log(`❌ Fallback failed: ${config.description} - ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    console.log('❌ All fallback configurations failed, keeping original transporter');
  }

  private initializeTransporter() {
    const emailConfig = this.getEmailConfig();
    
    if (!emailConfig) {
      console.warn('⚠️ Email service not configured - emails will not be sent');
      return;
    }

    try {
      const transportConfig: any = {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.password,
        },
        // Enhanced timeout configurations for unreliable networks
        connectionTimeout: 60000, // 1 minute to establish connection (reduced from 2 minutes)
        socketTimeout: 60000, // 1 minute of socket inactivity
        greetingTimeout: 30000, // 30 seconds to wait for greeting (reduced from 1 minute)
        // Connection pooling disabled for better reliability with timeouts
        pool: false,
        // Additional reliability settings
        requireTLS: !emailConfig.secure, // Use STARTTLS for non-secure connections
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
          // Add TLS ciphers for better compatibility
          ciphers: 'SSLv3'
        },
        // Add logger for debugging connection issues
        logger: false, // Set to true only for debugging
        debug: false // Set to true only for debugging
      };

      // Add DKIM configuration if available
      if (emailConfig.dkim) {
        transportConfig.dkim = {
          domainName: emailConfig.dkim.domainName,
          keySelector: emailConfig.dkim.keySelector,
          privateKey: emailConfig.dkim.privateKey,
        };
        console.log('🔐 DKIM signing enabled for domain:', emailConfig.dkim.domainName);
      }

      this.transporter = nodemailer.createTransport(transportConfig);

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

    const config: EmailConfig = {
      host: process.env.EMAIL_HOST!,
      port: parseInt(process.env.EMAIL_PORT!),
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.EMAIL_USER!,
      password: process.env.EMAIL_PASSWORD!,
    };

    // Add DKIM configuration if all DKIM variables are present
    const dkimVars = ['DKIM_DOMAIN', 'DKIM_SELECTOR', 'DKIM_PRIVATE_KEY'];
    const dkimMissing = dkimVars.filter(varName => !process.env[varName]);
    
    if (dkimMissing.length === 0) {
      config.dkim = {
        domainName: process.env.DKIM_DOMAIN!,
        keySelector: process.env.DKIM_SELECTOR!,
        privateKey: process.env.DKIM_PRIVATE_KEY!,
      };
      console.log('🔐 DKIM configuration loaded for domain:', config.dkim.domainName);
    } else {
      console.log('⚠️ DKIM not configured - missing:', dkimMissing.join(', '));
      console.log('💡 For better email deliverability, configure DKIM signing');
    }

    return config;
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    if (!this.transporter) {
      console.error('❌ Email service not configured - cannot send email');
      console.log('💡 To configure email service, set these environment variables:');
      console.log('   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD');
      console.log('📧 Current configuration status:');
      console.log('   EMAIL_HOST:', process.env.EMAIL_HOST ? '✅ Set' : '❌ Missing');
      console.log('   EMAIL_PORT:', process.env.EMAIL_PORT ? '✅ Set' : '❌ Missing');
      console.log('   EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
      console.log('   EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Missing');
      console.log('   EMAIL_FROM:', process.env.EMAIL_FROM ? '✅ Set' : '❌ Missing (will use default)');
      console.log('🔐 DKIM configuration status:');
      console.log('   DKIM_DOMAIN:', process.env.DKIM_DOMAIN ? '✅ Set' : '⚠️ Missing (optional)');
      console.log('   DKIM_SELECTOR:', process.env.DKIM_SELECTOR ? '✅ Set' : '⚠️ Missing (optional)');
      console.log('   DKIM_PRIVATE_KEY:', process.env.DKIM_PRIVATE_KEY ? '✅ Set' : '⚠️ Missing (optional)');
      return false;
    }

    const maxRetries = 3;
    const baseDelay = 2000; // 2 seconds base delay (reduced for faster retries)

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📧 Attempting to send email to: ${message.to} (attempt ${attempt}/${maxRetries})`);
        console.log(`📧 Subject: ${message.subject}`);
        
        const mailOptions = {
          from: `"SigeristLuxuryBags" <${this.fromEmail}>`,
          to: message.to,
          subject: message.subject,
          html: message.html,
          text: message.text || this.stripHtml(message.html),
        };

        const result = await this.transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', {
          to: message.to,
          subject: message.subject,
          messageId: result.messageId,
          timestamp: new Date().toISOString(),
          attempt: attempt
        });
        return true;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        const isTimeoutError = error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('Connection timeout'));

        console.error(`❌ Failed to send email (attempt ${attempt}/${maxRetries}):`, {
          to: message.to,
          subject: message.subject,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        });
        
        // More detailed error information
        if (error instanceof Error) {
          console.error('📧 Email Error Details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          
          // Common email configuration issues with enhanced timeout guidance
          if (error.message.includes('ECONNREFUSED')) {
            console.error('💡 Connection refused - check EMAIL_HOST and EMAIL_PORT');
          } else if (error.message.includes('authentication')) {
            console.error('💡 Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
          } else if (error.message.includes('Invalid mail command')) {
            console.error('💡 Invalid email format - check EMAIL_FROM and recipient email');
          } else if (isTimeoutError) {
            console.error('💡 Connection timeout - check network connectivity and SMTP server availability');
            
            if (isLastAttempt) {
              console.error('🔧 Recommended solutions for persistent timeouts:');
              console.error('   1. Try alternative SMTP configuration:');
              console.error('      EMAIL_HOST=mail.privateemail.com (instead of smtp.privateemail.com)');
              console.error('      EMAIL_PORT=587');
              console.error('      EMAIL_SECURE=false');
              console.error('   2. Check firewall settings and network connectivity');
              console.error('   3. Contact your email provider to verify SMTP settings');
              console.error('   4. Consider using alternative email service (Gmail SMTP, SendGrid, etc.)');
            }
            console.error('   Current config: host=' + process.env.EMAIL_HOST + ', port=' + process.env.EMAIL_PORT + ', secure=' + process.env.EMAIL_SECURE);
          } else if (error.message.includes('ENOTFOUND')) {
            console.error('💡 DNS lookup failed - check EMAIL_HOST value');
          }
        }
        
        // If this isn't the last attempt and it's a timeout or connection error, wait and retry
        if (!isLastAttempt && (isTimeoutError || error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND'))) {
          const delay = baseDelay * Math.pow(1.5, attempt - 1); // Gentler exponential backoff
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Try fallback configuration on second attempt for timeout errors
          if (attempt === 2 && isTimeoutError) {
            console.log('🔄 Trying fallback configuration on retry...');
            await this.initializeFallbackTransporter();
          }
          continue;
        }
        
        // If it's the last attempt or not a timeout error, return false
        if (isLastAttempt) {
          console.error(`❌ Failed to send email after ${maxRetries} attempts. Email delivery failed.`);
        }
        return false;
      }
    }
    
    return false;
  }

  async sendRegistrationConfirmation(to: string, firstName: string): Promise<boolean> {
    const subject = 'Bienvenido a SigeristLuxuryBags';
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
            <h1>SigeristLuxuryBags</h1>
            <p>Bolsos de Lujo Personalizados</p>
          </div>
          <div class="content">
            <h2>¡Hola ${firstName}!</h2>
            <p><strong>Bienvenido a SigeristLuxuryBags, Te has registrado con éxito</strong></p>
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
            <p>¡Gracias por elegir SigeristLuxuryBags!</p>
          </div>
          <div class="footer">
            <p>© 2024 SigeristLuxuryBags - Medellín, Colombia</p>
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

  async sendPurchaseConfirmation(to: string, firstName: string, order: any, items: any[]): Promise<boolean> {
    const subject = 'Gracias por haber elegido a SigeristLuxuryBags';
    
    // Build items list for email
    let itemsHtml = '';
    let itemsDescription = '';
    
    items.forEach((item) => {
      itemsHtml += `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            <strong>${item.name}</strong><br>
            ${item.personalization ? `Personalización: ${item.personalization}<br>` : ''}
            ${item.addNameEmbroidery ? 'Bordado de nombre incluido<br>' : ''}
            ${item.keychainPersonalization ? `Llavero personalizado: ${item.keychainPersonalization}<br>` : ''}
            Cantidad: ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
            $${(item.price * item.quantity).toLocaleString('es-CO')}
          </td>
        </tr>
      `;
      
      itemsDescription += `• ${item.name} (Cantidad: ${item.quantity})`;
      if (item.personalization) itemsDescription += ` - Personalización: ${item.personalization}`;
      if (item.addNameEmbroidery) itemsDescription += ` - Con bordado de nombre`;
      if (item.keychainPersonalization) itemsDescription += ` - Llavero: ${item.keychainPersonalization}`;
      itemsDescription += '\n';
    });

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
          .order-details { background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          .items-table th { background: #000; color: #ebc005; padding: 10px; text-align: left; }
          .total { font-size: 18px; font-weight: bold; color: #ebc005; text-align: right; padding: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SigeristLuxuryBags</h1>
            <p>Confirmación de Compra</p>
          </div>
          <div class="content">
            <h2>¡Hola ${firstName}!</h2>
            <p><strong>Gracias por haber elegido a SigeristLuxuryBags</strong></p>
            
            <div class="order-details">
              <h3>Detalles de tu Compra</h3>
              <p><strong>Número de Pedido:</strong> #${order.id}</p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
              
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              
              <div class="total">
                Total: $${order.total.toLocaleString('es-CO')}
              </div>
            </div>
            
            <p>Tu pedido ha sido recibido y está siendo procesado. Te notificaremos cuando esté listo para envío.</p>
            <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos por WhatsApp al +57 316 018 3418.</p>
            <p>¡Gracias nuevamente por elegir SigeristLuxuryBags!</p>
          </div>
          <div class="footer">
            <p>© 2024 SigeristLuxuryBags - Medellín, Colombia</p>
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
      console.error('❌ Cannot test connection - transporter not initialized');
      const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      console.error(`❌ Missing variables: ${missingVars.join(', ')}`);
      return false;
    }

    try {
      console.log('🔍 Testing email connection...');
      console.log(`📧 Host: ${process.env.EMAIL_HOST}`);
      console.log(`📧 Port: ${process.env.EMAIL_PORT}`);
      console.log(`📧 User: ${process.env.EMAIL_USER}`);
      console.log(`📧 Secure: ${process.env.EMAIL_SECURE}`);
      
      await this.transporter.verify();
      console.log('✅ Email connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ Email connection test failed:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      
      if (error instanceof Error) {
        // Provide specific troubleshooting advice
        if (error.message.includes('ENOTFOUND')) {
          console.error('💡 DNS lookup failed - check EMAIL_HOST value');
        } else if (error.message.includes('ECONNREFUSED')) {
          console.error('💡 Connection refused - check EMAIL_HOST and EMAIL_PORT');
        } else if (error.message.includes('authentication')) {
          console.error('💡 Authentication failed - check EMAIL_USER and EMAIL_PASSWORD');
        } else if (error.message.includes('timeout') || error.message.includes('Connection timeout')) {
          console.error('💡 Connection timeout - check network connectivity and EMAIL_HOST');
          console.error('   Try using a different EMAIL_HOST or EMAIL_PORT configuration');
          console.error('   Current config: host=' + process.env.EMAIL_HOST + ', port=' + process.env.EMAIL_PORT + ', secure=' + process.env.EMAIL_SECURE);
          
          // If connection test fails due to timeout, try fallback configuration
          console.log('🔄 Attempting fallback configuration...');
          return await this.tryFallbackConfiguration();
        }
      }
      
      return false;
    }
  }

  // Try alternative SMTP configurations for better reliability
  private async tryFallbackConfiguration(): Promise<boolean> {
    const currentHost = process.env.EMAIL_HOST;
    const fallbackConfigs = [
      // Namecheap alternative configuration
      {
        host: 'mail.privateemail.com',
        port: 587,
        secure: false,
        description: 'Namecheap Private Email (TLS)'
      },
      // Alternative Namecheap configuration
      {
        host: 'smtp.privateemail.com',
        port: 587,
        secure: false,
        description: 'Namecheap Private Email Alt (TLS)'
      }
    ];

    for (const config of fallbackConfigs) {
      // Skip if this is already the current configuration
      if (currentHost === config.host) continue;

      console.log(`🔄 Trying fallback: ${config.description}`);
      
      try {
        const fallbackTransportConfig = {
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: {
            user: process.env.EMAIL_USER!,
            pass: process.env.EMAIL_PASSWORD!,
          },
          connectionTimeout: 120000,
          socketTimeout: 120000,
          greetingTimeout: 60000,
          requireTLS: !config.secure,
          tls: {
            rejectUnauthorized: false
          }
        };

        const testTransporter = nodemailer.createTransporter(fallbackTransportConfig);
        await testTransporter.verify();
        
        console.log(`✅ Fallback configuration works: ${config.description}`);
        console.log(`💡 Consider updating your .env file with:`);
        console.log(`   EMAIL_HOST=${config.host}`);
        console.log(`   EMAIL_PORT=${config.port}`);
        console.log(`   EMAIL_SECURE=${config.secure}`);
        
        // Update the current transporter to use the working configuration
        this.transporter = testTransporter;
        return true;
      } catch (error) {
        console.log(`❌ Fallback failed: ${config.description} - ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    console.error('❌ All fallback configurations failed');
    return false;
  }

  // Get email configuration status for diagnostics
  getConfigurationStatus(): { configured: boolean; missingVars: string[]; config: any; dkim: any } {
    const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    const dkimVars = ['DKIM_DOMAIN', 'DKIM_SELECTOR', 'DKIM_PRIVATE_KEY'];
    const dkimMissing = dkimVars.filter(varName => !process.env[varName]);
    const dkimConfigured = dkimMissing.length === 0;
    
    return {
      configured: missingVars.length === 0,
      missingVars,
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        from: process.env.EMAIL_FROM || this.fromEmail,
        secure: process.env.EMAIL_SECURE,
        hasPassword: !!process.env.EMAIL_PASSWORD
      },
      dkim: {
        configured: dkimConfigured,
        missingVars: dkimMissing,
        domain: process.env.DKIM_DOMAIN,
        selector: process.env.DKIM_SELECTOR,
        hasPrivateKey: !!process.env.DKIM_PRIVATE_KEY
      }
    };
  }
}

// Singleton instance
export const emailService = new EmailService();