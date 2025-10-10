import { supabase } from '../lib/supabase';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
  phoneNumber?: string;
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
}

export class PaymentService {
  static async processMBWayPayment(
    amount: number,
    phoneNumber: string,
    bookingId: string
  ): Promise<PaymentResult> {
    console.log('📱 Processing MB WAY payment:', { amount, phoneNumber, bookingId });

    try {
      // Validate phone number format
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      if (!cleanPhone.match(/^(\+351)?9[1236]\d{7}$/)) {
        return {
          success: false,
          error: 'Número de telefone inválido. Use formato: 912345678 ou +351912345678'
        };
      }

      // Generate a transaction ID
      const transactionId = `MBWAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Save payment to database as pending
      if (supabase) {
        await supabase.from('payments').insert({
          id: transactionId,
          booking_id: bookingId,
          amount: amount,
          method: 'mbway',
          status: 'pending',
          transaction_id: transactionId
        });
      }

      console.log(`✅ MB WAY payment request created`);
      console.log(`📱 Phone: ${phoneNumber}`);
      console.log(`💰 Amount: €${amount}`);
      console.log(`📋 Transaction ID: ${transactionId}`);

      // Simulate successful payment
      // In production, integrate with Eupago, Easypay, or SIBS MB WAY API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update payment status to completed
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
          paymentMethod: 'mbway',
          phoneNumber: phoneNumber
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
      { id: 'coupon', name: 'Cupão/Ticket', icon: '🎫' }
    ];
  }
}
