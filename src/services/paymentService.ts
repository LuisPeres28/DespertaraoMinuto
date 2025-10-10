import { supabase } from '../lib/supabase';
import { loadStripe } from '@stripe/stripe-js';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  phoneNumber?: string;
  clientSecret?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
  reference?: {
    entity: string;
    reference: string;
    amount: number;
  };
  clientSecret?: string;
}

export class PaymentService {
  private static stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

  static async createPaymentIntent(
    amount: number,
    paymentMethodTypes: string[],
    bookingId: string,
    metadata: Record<string, string> = {}
  ): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          amount,
          currency: 'eur',
          payment_method_types: paymentMethodTypes,
          metadata: {
            bookingId,
            ...metadata
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  static async processMBWayPayment(
    amount: number,
    phoneNumber: string,
    bookingId: string
  ): Promise<PaymentResult> {
    console.log('📱 Processing MB WAY payment via Stripe:', { amount, phoneNumber, bookingId });

    try {
      // Validate phone number format
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      if (!cleanPhone.match(/^(\+351)?9[1236]\d{7}$/)) {
        return {
          success: false,
          error: 'Número de telefone inválido. Use formato: 912345678 ou +351912345678'
        };
      }

      // Normalize phone number to E.164 format
      const normalizedPhone = cleanPhone.startsWith('+351') ? cleanPhone : `+351${cleanPhone}`;

      // Create payment intent with MB WAY
      const paymentIntentData = await this.createPaymentIntent(
        amount,
        ['multibanco'],
        bookingId,
        {
          phone: normalizedPhone,
          payment_method: 'mbway'
        }
      );

      if (!paymentIntentData) {
        return {
          success: false,
          error: 'Erro ao criar pagamento. Tente novamente.'
        };
      }

      // Save payment to database as pending
      if (supabase) {
        await supabase.from('payments').insert({
          id: paymentIntentData.paymentIntentId,
          booking_id: bookingId,
          amount: amount,
          method: 'mbway',
          status: 'pending',
          transaction_id: paymentIntentData.paymentIntentId
        });
      }

      console.log(`✅ MB WAY payment intent created`);
      console.log(`📱 Phone: ${normalizedPhone}`);
      console.log(`💰 Amount: €${amount}`);
      console.log(`📋 Payment Intent ID: ${paymentIntentData.paymentIntentId}`);

      return {
        success: true,
        clientSecret: paymentIntentData.clientSecret,
        paymentIntent: {
          id: paymentIntentData.paymentIntentId,
          amount,
          currency: 'eur',
          status: 'pending',
          paymentMethod: 'mbway',
          phoneNumber: normalizedPhone,
          clientSecret: paymentIntentData.clientSecret
        }
      };
    } catch (error) {
      console.error('MB WAY payment error:', error);
      return {
        success: false,
        error: 'Erro ao processar pagamento MB WAY. Tente novamente.'
      };
    }
  }

  static async confirmMBWayPayment(
    clientSecret: string,
    phoneNumber: string
  ): Promise<PaymentResult> {
    try {
      const stripe = await this.stripePromise;
      if (!stripe) {
        return {
          success: false,
          error: 'Erro ao inicializar Stripe'
        };
      }

      // Confirm payment with MB WAY
      const { error, paymentIntent } = await stripe.confirmMultibancoPayment(
        clientSecret,
        {
          payment_method: {
            billing_details: {
              email: 'customer@example.com',
            },
          },
        }
      );

      if (error) {
        console.error('MB WAY confirmation error:', error);
        return {
          success: false,
          error: error.message || 'Erro ao confirmar pagamento MB WAY'
        };
      }

      if (paymentIntent) {
        // Update payment in database
        if (supabase && paymentIntent.status === 'succeeded') {
          await supabase.from('payments').update({
            status: 'paid',
            payment_date: new Date().toISOString()
          }).eq('id', paymentIntent.id);
        }

        return {
          success: paymentIntent.status === 'succeeded',
          paymentIntent: {
            id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status === 'succeeded' ? 'completed' : 'processing',
            paymentMethod: 'mbway',
            phoneNumber
          }
        };
      }

      return {
        success: false,
        error: 'Erro ao processar pagamento'
      };
    } catch (error) {
      console.error('MB WAY confirmation error:', error);
      return {
        success: false,
        error: 'Erro ao confirmar pagamento MB WAY'
      };
    }
  }

  static async generateMultibancoReference(
    amount: number,
    bookingId: string
  ): Promise<{ entity: string; reference: string; amount: number }> {
    console.log('🏧 Generating Multibanco reference:', { amount, bookingId });

    // Generate 9-digit reference
    const reference = Math.floor(100000000 + Math.random() * 900000000).toString();

    // Generate transaction ID
    const transactionId = `MB_${Date.now()}_${reference}`;

    // Save payment to database as pending
    if (supabase) {
      await supabase.from('payments').insert({
        id: transactionId,
        booking_id: bookingId,
        amount: amount,
        method: 'multibanco',
        status: 'pending',
        transaction_id: reference
      });
    }

    return {
      entity: '11249',
      reference: reference,
      amount
    };
  }

  static getPaymentMethods(): Array<{ id: string; name: string; icon: string }> {
    return [
      { id: 'mbway', name: 'MB WAY', icon: '📱' },
      { id: 'multibanco', name: 'Referência Multibanco', icon: '🏧' },
      { id: 'card', name: 'Cartão de Crédito/Débito', icon: '💳' },
      { id: 'coupon', name: 'Cupão/Ticket', icon: '🎫' }
    ];
  }

  static async processPayment(
    amount: number,
    method: string,
    bookingId: string
  ): Promise<PaymentResult> {
    console.log('Processing payment:', { amount, method, bookingId });

    try {
      const transactionId = `${method.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (supabase) {
        await supabase.from('payments').insert({
          id: transactionId,
          booking_id: bookingId,
          amount: amount,
          method: method,
          status: 'pending',
          transaction_id: transactionId
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (supabase) {
        await supabase.from('payments').update({
          status: 'paid',
          payment_date: new Date().toISOString()
        }).eq('id', transactionId);
      }

      return {
        success: true,
        paymentIntent: {
          id: transactionId,
          amount,
          currency: 'eur',
          status: 'completed',
          paymentMethod: method
        }
      };
    } catch (error) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: 'Erro ao processar pagamento. Tente novamente.'
      };
    }
  }
}
