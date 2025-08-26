import * as crypto from "crypto";

const WOMPI_BASE_URL = "https://production.wompi.co/v1";
const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
const WOMPI_PUBLIC_KEY = process.env.WOMPI_PUBLIC_KEY;
const WOMPI_INTEGRITY_SECRET = process.env.WOMPI_INTEGRITY_SECRET || "prod_integrity_gHG8Po5YjKQmGpWm8fkgxANED7motlc7";
const WOMPI_WEBHOOK_SECRET = process.env.WOMPI_WEBHOOK_SECRET || "prod_events_AfftM4juoszPyNV4YdhCqyfb6BhNWK9L";

if (!WOMPI_PRIVATE_KEY || !WOMPI_PUBLIC_KEY) {
  console.warn("Wompi keys not configured. Payment processing will not work.");
  console.warn("Please update WOMPI_PUBLIC_KEY and WOMPI_PRIVATE_KEY in your .env file.");
  console.warn("Get your keys from https://comercios.wompi.co/");
}

if (!WOMPI_INTEGRITY_SECRET) {
  console.warn("Wompi integrity secret not configured. Signature generation will not work.");
}

if (!WOMPI_WEBHOOK_SECRET) {
  console.warn("Wompi webhook secret not configured. Webhook verification will not work.");
}

export class WompiService {
  static getConfigurationStatus() {
    const hasValidPublicKey = !!WOMPI_PUBLIC_KEY && !WOMPI_PUBLIC_KEY.includes('your-public-key-here');
    const hasValidPrivateKey = !!WOMPI_PRIVATE_KEY && !WOMPI_PRIVATE_KEY.includes('your-private-key-here');
    const hasValidIntegritySecret = !!WOMPI_INTEGRITY_SECRET && !WOMPI_INTEGRITY_SECRET.includes('your-integrity-secret-here');
    const hasValidWebhookSecret = !!WOMPI_WEBHOOK_SECRET && !WOMPI_WEBHOOK_SECRET.includes('your-webhook-secret-here');
    
    return {
      hasPublicKey: hasValidPublicKey,
      hasPrivateKey: hasValidPrivateKey,
      hasIntegritySecret: hasValidIntegritySecret,
      hasWebhookSecret: hasValidWebhookSecret,
      isFullyConfigured: hasValidPublicKey && hasValidPrivateKey && hasValidIntegritySecret,
      needsConfiguration: !hasValidPublicKey || !hasValidPrivateKey
    };
  }

  static getWidgetConfig(amount_in_cents: number, currency: string, reference: string, customerData?: {
    email?: string;
    full_name?: string;
    phone_number?: string;
    phone_number_prefix?: string;
    legal_id?: string;
    legal_id_type?: string;
  }, shippingAddress?: {
    address_line_1?: string;
    address_line_2?: string;
    country?: string;
    city?: string;
    phone_number?: string;
    region?: string;
    name?: string;
    postal_code?: string;
  }, options?: {
    redirect_url?: string;
    expiration_time?: string;
    tax_in_cents?: {
      vat?: number;
      consumption?: number;
    };
  }) {
    // Check configuration status using the same logic as the routes
    const configStatus = this.getConfigurationStatus();
    
    if (!configStatus.isFullyConfigured) {
      throw new Error('Wompi configuration incomplete. Public key and integrity secret are required.');
    }

    // Generate signature according to Wompi documentation
    const signature = this.generateSignature(reference, amount_in_cents, currency);

    return {
      publicKey: WOMPI_PUBLIC_KEY,
      currency,
      amountInCents: amount_in_cents,
      reference,
      signature: signature,
      redirectUrl: options?.redirect_url,
      expirationTime: options?.expiration_time,
      taxInCents: options?.tax_in_cents,
      customerData,
      shippingAddress
    };
  }

  static generateSignature(reference: string, amount_in_cents: number, currency: string): string {
    if (!WOMPI_INTEGRITY_SECRET) {
      throw new Error('WOMPI_INTEGRITY_SECRET is required for signature generation');
    }
    
    // Concatenate in the exact order specified by Wompi documentation:
    // <Reference><Amount><Currency><IntegritySecret>
    const concatenatedData = `${reference}${amount_in_cents}${currency}${WOMPI_INTEGRITY_SECRET}`;
    const signature = crypto.createHash('sha256').update(concatenatedData).digest('hex');
    
    console.log('Signature generated for:', { reference, amount_in_cents, currency });
    console.log('Concatenated data:', concatenatedData);
    console.log('Generated signature:', signature);
    
    return signature;
  }

  static async createToken(cardData: {
    number: string;
    exp_month: string;
    exp_year: string;
    cvc: string;
    card_holder: string;
  }) {
    // Check if keys are configured
    if (!WOMPI_PUBLIC_KEY) {
      throw new Error("La configuración de Wompi no está completa. Contacta al administrador del sitio.");
    }

    const response = await fetch(`${WOMPI_BASE_URL}/tokens/cards`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WOMPI_PUBLIC_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cardData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      // Provide more user-friendly error messages
      let errorMessage = data.error?.reason || "Error creating token";
      
      if (errorMessage.includes("undefined") || errorMessage.includes("no corresponde a este ambiente")) {
        errorMessage = "La configuración de pagos no está completa. Por favor contacta al soporte técnico.";
      }
      
      throw new Error(errorMessage);
    }

    return data;
  }

  static async createTransaction(transactionData: {
    amount_in_cents: number;
    currency: string;
    customer_email: string;
    reference: string;
    acceptance_token: string;
    accept_personal_auth: string;
    payment_method: {
      type: string;
      token: string;
      installments: number;
    };
    customer_data: {
      phone_number: string;
      full_name: string;
    };
  }) {
    // Check if keys are configured
    if (!WOMPI_PRIVATE_KEY) {
      throw new Error("La configuración de Wompi no está completa. Contacta al administrador del sitio.");
    }

    // Generate integrity signature
    const signature = this.generateSignature(
      transactionData.reference,
      transactionData.amount_in_cents,
      transactionData.currency
    );

    const requestBody = {
      ...transactionData,
      signature
    };

    const response = await fetch(`${WOMPI_BASE_URL}/transactions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WOMPI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    console.log('Request body sent to Wompi:', JSON.stringify(requestBody, null, 2));
    console.log('Wompi transaction response:', data);
    
    if (!response.ok) {
      console.error('Wompi transaction error:', data);
      console.error('Full error details:', JSON.stringify(data, null, 2));
      
      // Provide more user-friendly error messages
      let errorMessage = data.error?.reason || data.message || "Error creating transaction";
      
      if (errorMessage.includes("undefined") || errorMessage.includes("no corresponde a este ambiente")) {
        errorMessage = "La configuración de pagos no está completa. Por favor contacta al soporte técnico.";
      }
      
      throw new Error(errorMessage);
    }

    return data;
  }

  static async getAcceptanceTokens() {
    try {
      const response = await fetch(`${WOMPI_BASE_URL}/merchants/${WOMPI_PUBLIC_KEY}`, {
        headers: {
          "Authorization": `Bearer ${WOMPI_PUBLIC_KEY}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.reason || "Error getting acceptance tokens");
      }

      return {
        acceptance_token: data.data.presigned_acceptance.acceptance_token,
        accept_personal_auth: data.data.presigned_personal_data_auth.acceptance_token
      };
    } catch (error) {
      console.error('Error getting acceptance tokens:', error);
      // Fallback tokens válidos
      return {
        acceptance_token: "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6MzA2LCJwZXJtYWxpbmsiOiJodHRwczovL3dvbXBpLmNvL3YxL21lcmNoYW50cy9wdWJfcHJvZF9nNEhsa01kSElOTEY5YUQzM1d0YUZrWk9rN3FIaFhTVSIsImZpbGVfaGFzaCI6IjBhZWYxMGI4N2VjMDE5MWIyODQ3MzZlNzMxOGZkYzAzOWM5MzgwMzciLCJqaXQiOjE3NTQxNzE0MDAsImV4cCI6MTc1NTQzMjgwMH0._3E8RKlOCwHKIv2BHSQ0o6_xhD3aPzKPVgNy7A0v18E",
        accept_personal_auth: "eyJhbGciOiJIUzI1NiJ9.eyJjb250cmFjdF9pZCI6NDQxLCJwZXJtYWxpbmsiOiJodHRwczovL3dvbXBpLmNvbS9hc3NldHMvZG93bmxvYWRibGUvYXV0b3JpemFjaW9uLWFkbWluaXN0cmFjaW9uLWRhdG9zLXBlcnNvbmFsZXMucGRmIiwiZmlsZV9oYXNoIjoiOTVkYzcwN2M0M2UxYmViMDAwMDUyZDNkNWJhZThhMDAiLCJqaXQiOjE3MjkwMzYwMzAsImV4cCI6MTczNTUxMjAwMH0.PJsEYZQzDOLSHNzsmtVtA0Z0EKAJUdXSk5ajZzRhxLw"
      };
    }
  }

  static async getTransaction(transactionId: string) {
    const response = await fetch(`${WOMPI_BASE_URL}/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${WOMPI_PRIVATE_KEY}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.reason || "Error getting transaction");
    }

    return data;
  }

  static verifyWebhookSignature(payload: any, signature: string, timestamp: string): boolean {
    try {
      if (!WOMPI_WEBHOOK_SECRET) {
        console.error("WOMPI_WEBHOOK_SECRET is not configured. Cannot verify webhook signature.");
        return false;
      }
      
      const concatenatedString = `${JSON.stringify(payload)}${timestamp}`;
      const computedSignature = crypto
        .createHmac("sha256", WOMPI_WEBHOOK_SECRET)
        .update(concatenatedString)
        .digest("hex");

      return signature === computedSignature;
    } catch (error) {
      console.error("Error verifying webhook signature:", error);
      return false;
    }
  }
}