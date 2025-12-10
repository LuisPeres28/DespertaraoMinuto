import { supabase } from '../lib/supabase';

export interface PaymentResult {
  success: boolean;
  paymentIntent?: any;
  error?: string;
}

export class PaymentService {

  // 1. LISTAR MÉTODOS (Sem async para não dar erro de ecrã branco)
  static getPaymentMethods() {
    return [
      { id: 'mbway', label: 'MB Way', icon: 'smartphone' },
      { id: 'multibanco', label: 'Multibanco', icon: 'credit-card' }
    ];
  }

  // 2. MB WAY (Via Servidor Supabase)
  static async processMBWayPayment(amount: number, phoneNumber: string, bookingId: string): Promise<PaymentResult> {
    console.log("📱 A iniciar pagamento MB WAY via Servidor...");

    try {
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      if (!cleanPhone.match(/^(\+351)?9[1236]\d{7}$/)) {
        return { success: false, error: "Número de telemóvel inválido." };
      }

      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${url}/functions/v1/easypay-mbway`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          action: "create",
          phoneNumber: cleanPhone,
          amount,
          bookingId
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || "Erro ao comunicar com a Easypay." };
      }

      await supabase.from("payments").insert({
        id: result.paymentId,
        booking_id: bookingId,
        amount,
        method: "mbway",
        status: "pending",
        transaction_id: result.paymentId
      });

      return {
        success: true,
        paymentIntent: {
          id: result.paymentId,
          amount,
          status: "pending",
          paymentMethod: "mbway"
        }
      };

    } catch (err) {
      console.error(err);
      return { success: false, error: "Erro interno no pagamento MB Way." };
    }
  }

  static async generateMultibancoReference(amount: number, bookingId: string) {
    const reference = Math.floor(100000000 + Math.random() * 900000000).toString();
    const transactionId = `MB_${Date.now()}_${reference}`;
    await supabase.from("payments").insert({
      id: transactionId, booking_id: bookingId, amount, method: "multibanco", status: "pending", transaction_id: reference
    });
    return { entity: "11249", reference, amount };
  }

  static async checkMBWayPaymentStatus(paymentId: string): Promise<PaymentResult> {
     return { success: false };
  }
}