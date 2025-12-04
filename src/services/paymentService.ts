import { supabase } from '../lib/supabase';

//
// ────────────────────────────────
// Interfaces
// ────────────────────────────────
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
// ────────────────────────────────
// Payment Service
// ────────────────────────────────
//

export class PaymentService {

  //
  // ────────────────────────────────
  // 1) MB WAY — Easypay Integration
  // ────────────────────────────────
  //

  static async processMBWayPayment(
    amount: number,
    phoneNumber: string,
    bookingId: string
  ): Promise<PaymentResult> {

    try {
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      if (!cleanPhone.match(/^(\+351)?9[1236]\d{7}$/)) {
        return { success: false, error: 'Número de telefone inválido.' };
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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
        return {
          success: false,
          error: result.message || 'Erro ao criar pagamento MB WAY.'
        };
      }

      await supabase.from('payments').insert({
        id: result.paymentId,
        booking_id: bookingId,
        amount: amount,
        method: 'mbway',
        status: 'pending',
        transaction_id: result.paymentId
      });

      return {
        success: true,
        paymentIntent: {
          id: result.paymentId,
          amount,
          currency: 'eur',
          status: 'pending',
          paymentMethod: 'mbway',
          phoneNumber: cleanPhone,
        }
      };

    } catch (error) {
      console.error('MB WAY payment error:', error);
      return { success: false, error: 'Falha ao processar MB WAY.' };
    }
  }



  //
  // ────────────────────────────────
  // 2) MB WAY — Check Payment Status
  // ────────────────────────────────
  //

  static async checkMBWayPaymentStatus(paymentId: string): Promise<PaymentResult> {
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
        return { success: false, error: 'Erro ao verificar pagamento MB WAY.' };
      }

      if (result.paid) {
        await supabase.from('payments')
          .update({
            status: 'paid',
            payment_date: new Date().toISOString()
          })
          .eq('id', paymentId);
      }

      return {
        success: result.paid,
        paymentIntent: {
          id: paymentId,
          amount: result.amount || 0,
          currency: 'eur',
          status: result.paid ? 'completed' : 'pending',
          paymentMethod: 'mbway',
        }
      };

    } catch (error) {
      console.error('Check MB WAY error:', error);
      return { success: false, error: 'Falha ao verificar pagamento.' };
    }
  }



  //
  // ────────────────────────────────
  // 3) MULTIBANCO — Reference Generation
  // ────────────────────────────────
  //

  static async generateMultibancoReference(
    amount: number,
    bookingId: string
  ): Promise<{ entity: string; reference: string; amount: number }> {

    const reference = Math.floor(100000000 + Math.random() * 900000000).toString();
    const transactionId = `MB_${Date.now()}_${reference}`;

    await supabase.from('payments').insert({
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
  // ────────────────────────────────
  // 4) STRIPE — Redirect Link
  // ────────────────────────────────
  //

  static async openStripePayment(stripeLink: string): Promise<PaymentResult> {
    try {
      if (!stripeLink) return { success: false, error: 'Stripe link não encontrado.' };

      window.location.href = stripeLink; // Redirect

      return { success: true };
    } catch (error) {
      console.error('Stripe redirect error:', error);
      return { success: false, error: 'Falha ao abrir Stripe.' };
    }
  }



  //
  // ────────────────────────────────
  // 5) Payment Method Definitions
  // ────────────────────────────────
  //

  static getPaymentMethods() {
    return [
      { id: 'mbway', name: 'MB WAY', icon: '📱' },
      { id: 'multibanco', name: 'Referência Multibanco', icon: '🏧' },
      { id: 'card', name: 'Cartão de Crédito/Débito', icon: '💳' },
      { id: 'coupon', name: 'Cupão', icon: '🎫' }
    ];
  }



  //
  // ────────────────────────────────
  // 6) Fake Payment (DEV MODE)
  // ────────────────────────────────
  //

  static async processPayment(amount: number, method: string, bookingId: string): Promise<PaymentResult> {
    try {
      const transactionId = `${method}_${Date.now()}`;

      await supabase.from('payments').insert({
        id: transactionId,
        booking_id: bookingId,
        amount,
        method,
        status: 'pending',
        transaction_id: transactionId
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      await supabase.from('payments').update({
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
          paymentMethod: method,
        }
      };

    } catch (error) {
      console.error('Fake payment error:', error);
      return { success: false, error: 'Falha no pagamento.' };
    }
  }
}
