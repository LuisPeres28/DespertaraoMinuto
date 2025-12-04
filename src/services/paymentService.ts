import { supabase } from '../lib/supabase';

//
// ─── INTERFACES ─────────────────────────────────────────
//

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

//
// ─── PAYMENT SERVICE ───────────────────────────────────
//

export class PaymentService {

  // ─────────────────────────────────────────────
  // 1. MB WAY – Create Payment
  // ─────────────────────────────────────────────

  static async processMBWayPayment(
    amount: number,
    phoneNumber: string,
    bookingId: string
  ): Promise<PaymentResult> {

    console.log("📱 Creating MB WAY payment…");

    try {
      const cleanPhone = phoneNumber.replace(/\s/g, '');

      if (!cleanPhone.match(/^(\+351)?9[1236]\d{7}$/)) {
        return { success: false, error: "Número de telefone inválido." };
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
        return {
          success: false,
          error: result.error || "Erro ao criar pagamento MB WAY."
        };
      }

      // Save on DB
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
          currency: "eur",
          status: "pending",
          paymentMethod: "mbway",
          phoneNumber: result.phoneNumber
        }
      };

    } catch (err) {
      console.error(err);
      return { success: false, error: "Erro ao processar MB WAY." };
    }
  }

  // ─────────────────────────────────────────────
  // 2. MB WAY — Check Status
  // ─────────────────────────────────────────────

  static async checkMBWayPaymentStatus(paymentId: string): Promise<PaymentResult> {

    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${url}/functions/v1/easypay-mbway`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
          action: "check",
          paymentId
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: "Erro ao verificar pagamento." };
      }

      if (result.paid) {
        await supabase.from("payments")
          .update({ status: "paid", payment_date: new Date().toISOString() })
          .eq("id", paymentId);
      }

      return {
        success: result.paid,
        paymentIntent: {
          id: paymentId,
          amount: 0,
          currency: "eur",
          status: result.paid ? "completed" : "pending",
          paymentMethod: "mbway"
        }
      };

    } catch (err) {
      console.error(err);
      return { success: false, error: "Erro ao verificar pagamento." };
    }
  }

  // ─────────────────────────────────────────────
  // 3. MULTIBANCO — Generate reference
  // ─────────────────────────────────────────────

  static async generateMultibancoReference(
    amount: number,
    bookingId: string
  ) {
    const reference = Math.floor(100000000 + Math.random() * 900000000).toString();
    const transactionId = `MB_${Date.now()}_${reference}`;

    await supabase.from("payments").insert({
      id: transactionId,
      booking_id: bookingId,
      amount,
      method: "multibanco",
      status: "pending",
      transaction_id: reference
    });

    return {
      entity: "11249",
      reference,
      amount
    };
  }

  // ─────────────────────────────────────────────
  // 4. STRIPE — Open link
  // ─────────────────────────────────────────────

  static async openStripePayment(stripeLink: string): Promise<PaymentResult> {

    if (!stripeLink) {
      return { success: false, error: "Link Stripe inválido." };
    }

    window.location.href = stripeLink;

    return { success: true };
  }

  // ─────────────────────────────────────────────
  // 5. Test Payment (fallback)
  // ─────────────────────────────────────────────

  static async processPayment(amount: number, method: string, bookingId: string): Promise<PaymentResult> {

    const transactionId = `${method}_${Date.now()}`;

    await supabase.from("payments").insert({
      id: transactionId,
      booking_id: bookingId,
      amount,
      method,
      status: "pending",
      transaction_id: transactionId
    });

    await new Promise(r => setTimeout(r, 1200));

    await supabase.from("payments").update({
      status: "paid",
      payment_date: new Date().toISOString()
    }).eq("id", transactionId);

    return {
      success: true,
      paymentIntent: {
        id: transactionId,
        amount,
        currency: "eur",
        status: "completed",
        paymentMethod: method
      }
    };
  }
}
