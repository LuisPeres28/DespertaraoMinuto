import { supabase } from '../lib/supabase';

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

  static async processMBWayPayment(
    amount: number,
    phoneNumber: string,
    bookingId: string
  ): Promise<PaymentResult> {
    console.log('📱 Processing MB WAY payment via Easypay:', { amount, phoneNumber, bookingId });

    try {
      // Validate phone number format
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      if (!cleanPhone.match(/^(\+351)?9[1236]\d{7}$/)) {
        return {
          success: false,
          error: 'Número de telefone inválido. Use formato: 912345678 ou +351912345678'
        };
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Call Easypay Edge Function to create MB WAY payment
      const response = await fetch(`${supabaseUrl}/functions/v1/easypay-mbway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          action: 'create',
          phoneNumber: cleanPhone,
          amount: amount,
          bookingId: bookingId
        })
      });
  static async openStripePayment(stripeLink: string) {
  try {
    if (!stripeLink) throw new Error('Stripe link não encontrado.');

    window.location.href = stripeLink;

  } catch (error) {
    console.error('Erro ao abrir pagamento Stripe:', error);
    return {
      success: false,
      error: 'Não foi possível abrir o link de pagamento Stripe.',
    };
  }
}
    

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Easypay error:', result);
        return {
          success: false,
          error: result.message || result.error || 'Erro ao criar pagamento MB WAY'
        };
      }

      // Save payment to database as pending
      if (supabase) {
        await supabase.from('payments').insert({
          id: result.paymentId,
          booking_id: bookingId,
          amount: amount,
          method: 'mbway',
          status: 'pending',
          transaction_id: result.paymentId
        });
      }

      console.log(`✅ MB WAY payment created via Easypay`);
      console.log(`📱 Phone: ${result.phoneNumber}`);
      console.log(`💰 Amount: €${amount}`);
      console.log(`📋 Payment ID: ${result.paymentId}`);
      console.log(`📩 ${result.message}`);

      return {
        success: true,
        paymentIntent: {
          id: result.paymentId,
          amount,
          currency: 'eur',
          status: 'pending',
          paymentMethod: 'mbway',
          phoneNumber: result.phoneNumber
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

  static async checkMBWayPaymentStatus(
    paymentId: string
  ): Promise<PaymentResult> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/easypay-mbway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          action: 'check',
          paymentId: paymentId
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || 'Erro ao verificar pagamento'
        };
      }

      // Update payment in database if paid
      if (result.paid && supabase) {
        await supabase.from('payments').update({
          status: 'paid',
          payment_date: new Date().toISOString()
        }).eq('id', paymentId);
      }

      return {
        success: result.paid,
        paymentIntent: {
          id: result.paymentId,
          amount: 0,
          currency: 'eur',
          status: result.paid ? 'completed' : 'pending',
          paymentMethod: 'mbway'
        }
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        success: false,
        error: 'Erro ao verificar estado do pagamento'
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
