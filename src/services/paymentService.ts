import { supabase } from '../lib/supabase';

//
// ───────────────────────────────────────────────
// Interfaces
// ───────────────────────────────────────────────
//

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

//
// ───────────────────────────────────────────────
// Payment Service
// ───────────────────────────────────────────────
//

export class PaymentService {

  //
  // 1) MB WAY — Easypay Integration
  // ───────────────────────────────────────────────────────────────
  //
  static async processMBWayPayment(
    amount: number,
    phoneNumber: string,
    bookingId: string
  ): Promise<PaymentResult> {

    console.log('📱 Processing MB WAY payment via Easypay:', {
      amount, phoneNumber, bookingId
    });

    try {
      // Validate phone number
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      if (!cleanPhone.match(/^(\+351)?9[1236]\d{7}$/)) {
        return {
          success: false,
          error: 'Número de telefone inválido. Use: 912345678 ou +351912345678'
        };
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // Call Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/easypay-mbway`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          action: 'create',
          phoneNumber: cleanPhone,
          amount,
          bookingId
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error('Easypay MBWAY error:', result);
        return {
          success: false,
          error: result.message || result.error || 'Erro ao criar pagamento MB WAY'
        };
      }

      // Save initial payment as pending
      await supabase?.from('payments').insert({
        id: result.paymentId,
        booking_id: bookingId,
        amount,
        method: 'mbway',
        status: 'pending',
        transaction_id: result.paymentId
      });

      console.log(`✅ MB WAY criado: ${result.paymentId}`);

      return {
        success: true,
        paymentIntent: {
          id: result.paymentId,
          amount,
          currency: 'eur',
          status: 'pending',
          paymentMethod: 'mbway',
          phoneNumber: cleanPhone
        }
      };

    } catch (error) {
      console.error('MB WAY error:', error);
      return {
        success: false,
        error: 'Erro ao processar pagamento MB WAY.'
      };
    }
  }

  //
  // 2) MB WAY – CHECK PAYMENT STATUS
  // ───────────────────────────────────────────────────────────────
  //
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
          paymentId
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.error || 'Erro ao verificar pagamento'
        };
      }

      if (result.paid) {
        await supabase?.from('payments')
          .update({
            status: 'paid',
            payment_date: new Date().toISOString()
          })
          .eq('id', paymentId);
      }

      return {
        success: result.paid,
        paymentIntent: {
          id: result.paymentId,
          amount: result.amount || 0,
          currency: 'eur',
          status: result.paid ? 'completed' : 'pending',
          paymentMethod: 'mbway'
        }
      };

    } catch (error) {
      console.error('Check MBWAY error:', error);
      return {
        success: false,
        error: 'Erro ao verificar estado do pagamento.'
      };
    }
  }

  //
  // 3) MULTIBANCO — Reference Generator
  // ───────────────────────────────────────────────────────────────
  //
  static async generateMultibancoReference(
    amount: number,
    bookingId: string
  ): Promise<{ entity: string; reference: string; amount: number }> {

    console.log('🏧 Generating Multibanco reference');

    const reference = Math.floor(100000000 + Math.random() * 900000000).toString();
    const transactionId = `MB_${Date.now()}_${reference}`;

    await supabase?.from('payments').insert({
      id: transactionId,
      booking_id: bookingId,
      amount,
      method: 'multibanco',
      status: 'pending',
      transaction_id: reference
    });

    return {
      entity: '11249',
      reference,
      amount
    };
  }

  //
  // 4) STRIPE – Open Checkout Link
  // ───────────────────────────────────────────────────────────────
  //
  static async openStripePayment(stripeLink: string): Promise<PaymentResult> {
    try {
      if (!stripeLink) {
        return { success: false, error: 'Stripe link inválido.' };
      }

      window.location.href = stripeLink;

      return { success: true };

    } catch (error) {
      console.error('Stripe open error:', error);
      return {
        success: false,
        error: 'Erro ao abrir pagamento Stripe.'
      };
    }
  }

  //
  // 5) GENERIC PAYMENT SIMULATOR (Card, Coupon…)
  // ───────────────────────────────────────────────────────────────
  //
  static async processPayment(
    amount: number,
    method: string,
    bookingId: string
  ): Promise<PaymentResult> {

    try {
      const transactionId =
        `${method.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      await supabase?.from('payments').insert({
        id: transactionId,
        booking_id: bookingId,
        amount,
        method,
        status: 'pending',
        transaction_id: transactionId
      });

      await new Promise(res => setTimeout(res, 1200));

      await supabase?.from('payments').update({
        status: 'paid',
        payment_date: new Date().toISOString()
      }).eq('id', transactionId);

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
      console.error('Generic payment error:', error);
      return {
        success: false,
        error: 'Erro ao processar pagamento.'
      };
    }
  }

  //
  // 6) Payment Method List
  // ───────────────────────────────────────────────────────────────
  //
  static getPaymentMethods() {
    return [
      { id: 'mbway', name: 'MB WAY', icon: '📱' },
      { id: 'multibanco', name: 'Referência Multibanco', icon: '🏧' },
      { id: 'card', name: 'Cartão de Crédito/Débito', icon: '💳' },
      { id: 'coupon', name: 'Cupão/Ticket', icon: '🎫' }
    ];
  }
}
