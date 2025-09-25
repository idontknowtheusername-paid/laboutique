import { BaseService } from './base.service';

type FedaPayMode = 'test' | 'live';

export interface CreateFedaTransactionInput {
  amount: number; // in XOF
  currency?: string; // default XOF
  description?: string;
  customer: {
    name?: string;
    email?: string;
    phone_number?: string;
  };
  metadata?: Record<string, any>;
  callback_url: string; // success/cancel return
  webhook_url: string; // server webhook
}

export interface FedaTransactionResponse {
  payment_url: string;
  reference: string;
}

export class FedaPayService extends BaseService {
  private static getApiBase(): string {
    const mode = (process.env.FEDAPAY_MODE as FedaPayMode) || 'test';
    return mode === 'live' ? 'https://api.fedapay.com' : 'https://sandbox-api.fedapay.com';
  }

  private static getApiKey(): string {
    const key = process.env.FEDAPAY_API_KEY;
    if (!key) throw new Error('FEDAPAY_API_KEY is missing');
    return key;
  }

  static async createTransaction(input: CreateFedaTransactionInput): Promise<FedaTransactionResponse> {
    const apiBase = this.getApiBase();
    const apiKey = this.getApiKey();

    const payload: any = {
      transaction: {
        amount: Math.round(input.amount),
        description: input.description || 'Payment',
        currency: 'XOF',
        callback_url: input.callback_url,
        webhook_url: input.webhook_url,
        metadata: input.metadata || {},
      },
      customer: {
        name: input.customer.name,
        email: input.customer.email,
        phone_number: input.customer.phone_number,
      },
    };

    const res = await fetch(`${apiBase}/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`FedaPay createTransaction failed: ${res.status} ${txt}`);
    }
    const json = await res.json();
    // Response shape may vary; align with FedaPay's doc
    const payment_url = json?.transaction?.url || json?.url || json?.payment_url;
    const reference = json?.transaction?.reference || json?.reference || json?.id?.toString();
    if (!payment_url || !reference) {
      throw new Error('FedaPay response missing url/reference');
    }
    return { payment_url, reference };
  }
}

