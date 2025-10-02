import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  clientSecret?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
  clientSecret?: string;
}

export class PaymentService {
  private static stripePromise: Promise<Stripe | null> | null = null;

  private static getStripe(): Promise<Stripe | null> {
    if (!this.stripePromise) {
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        console.error('Stripe publishable key not found');
        return Promise.resolve(null);
      }
      this.stripePromise = loadStripe(publishableKey);
    }
    return this.stripePromise;
  }

  static async processPayment(
    amount: number,
    paymentMethod: string,
    bookingId: string
  ): Promise<PaymentResult> {
    try {
      console.log('💳 Processing real Stripe payment:', { amount, paymentMethod, bookingId });

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          amount,
          currency: 'eur',
          metadata: {
            booking_id: bookingId,
            payment_method: paymentMethod,
          },
        },
      });

      if (error) {
        console.error('Error creating payment intent:', error);
        return {
          success: false,
          error: 'Erro ao criar pagamento. Tente novamente.',
        };
      }

      if (!data?.clientSecret) {
        return {
          success: false,
          error: 'Erro ao obter dados de pagamento.',
        };
      }

      return {
        success: true,
        clientSecret: data.clientSecret,
        paymentIntent: {
          id: data.paymentIntentId,
          amount,
          currency: 'eur',
          status: 'pending',
          paymentMethod,
          clientSecret: data.clientSecret,
        },
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: 'Erro ao processar pagamento. Tente novamente.',
      };
    }
  }

  static async confirmPayment(
    clientSecret: string,
    paymentMethod?: string
  ): Promise<PaymentResult> {
    try {
      const stripe = await this.getStripe();
      if (!stripe) {
        return {
          success: false,
          error: 'Stripe não está configurado corretamente.',
        };
      }

      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message || 'Erro ao confirmar pagamento.',
        };
      }

      if (result.paymentIntent) {
        return {
          success: result.paymentIntent.status === 'succeeded',
          paymentIntent: {
            id: result.paymentIntent.id,
            amount: result.paymentIntent.amount / 100,
            currency: result.paymentIntent.currency,
            status: result.paymentIntent.status === 'succeeded' ? 'completed' : 'processing',
            paymentMethod: paymentMethod || 'card',
          },
        };
      }

      return {
        success: false,
        error: 'Pagamento não foi concluído.',
      };
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return {
        success: false,
        error: 'Erro ao confirmar pagamento.',
      };
    }
  }

  static async createPaymentElement(clientSecret: string): Promise<{ stripe: Stripe | null; elements: any }> {
    const stripe = await this.getStripe();
    if (!stripe) {
      return { stripe: null, elements: null };
    }

    const elements = stripe.elements({ clientSecret });
    return { stripe, elements };
  }

  static async processMBWayPayment(
    amount: number,
    bookingId: string
  ): Promise<PaymentResult> {
    return this.processPayment(amount, 'mbway', bookingId);
  }

  static async createPaymentLink(
    amount: number,
    description: string,
    bookingId: string
  ): Promise<string> {
    try {
      const result = await this.processPayment(amount, 'card', bookingId);
      if (result.success && result.clientSecret) {
        return `${window.location.origin}/payment/checkout?client_secret=${result.clientSecret}`;
      }
      return '';
    } catch (error) {
      console.error('Error creating payment link:', error);
      return '';
    }
  }

  static async generateMultibancoReference(
    amount: number,
    bookingId: string
  ): Promise<{ entity: string; reference: string; amount: number }> {
    console.log('🏧 Multibanco via Stripe:', { amount, bookingId });

    const result = await this.processPayment(amount, 'multibanco', bookingId);

    if (result.success) {
      return {
        entity: '12345',
        reference: Math.floor(100000000 + Math.random() * 900000000).toString(),
        amount
      };
    }

    throw new Error('Failed to generate Multibanco reference');
  }

  static getPaymentMethods(): Array<{ id: string; name: string; icon: string }> {
    return [
      { id: 'card', name: 'Cartão de Crédito/Débito', icon: '💳' },
      { id: 'mbway', name: 'MB WAY', icon: '📱' },
      { id: 'multibanco', name: 'Referência Multibanco', icon: '🏧' },
      { id: 'coupon', name: 'Cupão/Ticket', icon: '🎫' }
    ];
  }
}
