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
      {
        id: 'mbway',
        name: 'MB WAY',
        icon: '📱',
        description: 'Pagamento instantâneo via app MB WAY ou QR Code'
      },
      {
        id: 'bank_transfer',
        name: 'Transferência Bancária',
        icon: '🏦',
        description: 'Transferência bancária direta'
      },
      {
        id: 'coupon',
        name: 'Cupão / Vale',
        icon: '🎫',
        description: 'Use um cupão de desconto ou vale'
      }
    ];
  }

  // 2. MB WAY (Via Servidor Supabase)
  static async processMBWayPayment(amount: number, phoneNumber: string, bookingId: string): Promise<PaymentResult> {
    console.log("📱 A iniciar pagamento MB WAY via Servidor...");

    try {
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      console.log('🔵 Telefone limpo:', cleanPhone);

      if (!cleanPhone.match(/^(\+351)?9[1236]\d{7}$/)) {
        return { success: false, error: "Número de telemóvel inválido. Use formato: 912345678" };
      }

      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!url || !key) {
        console.error('❌ Variáveis de ambiente não configuradas');
        return { success: false, error: "Erro de configuração. Contacte o administrador." };
      }

      console.log('🔵 URL:', url);
      console.log('🔵 Enviando pedido para:', `${url}/functions/v1/easypay-mbway`);

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

      console.log('🔵 Status da resposta:', response.status);

      const responseText = await response.text();
      console.log('🔵 Resposta bruta:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('❌ Erro ao parsear JSON:', e);
        return { success: false, error: `Resposta inválida do servidor: ${responseText}` };
      }

      if (!response.ok) {
        console.error('❌ Resposta não OK:', result);
        return { success: false, error: result.error || `Erro ${response.status}` };
      }

      if (!result.success) {
        console.error('❌ Resultado sem sucesso:', result);
        return { success: false, error: result.error || "Erro ao comunicar com a Easypay." };
      }

      console.log('✅ Pagamento criado:', result.paymentId);

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
          paymentMethod: "mbway",
          qrCodeUrl: result.qrCodeUrl
        }
      };

    } catch (err) {
      console.error('❌ Exceção:', err);
      return {
        success: false,
        error: `Erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
      };
    }
  }

  static async generateBankTransferDetails(amount: number, bookingId: string) {
    const transactionId = `BANK_${Date.now()}`;
    const reference = `REF${Date.now().toString().slice(-9)}`;

    await supabase.from("payments").insert({
      id: transactionId,
      booking_id: bookingId,
      amount,
      method: "bank_transfer",
      status: "pending",
      transaction_id: transactionId
    });

    return {
      iban: "PT50 0193 0000 1050 6185 1975 9",
      bankName: "Banco CTT",
      accountHolder: "Luis Peres",
      amount,
      reference
    };
  }

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

      if (result.success && result.paid) {
        await supabase
          .from("payments")
          .update({ status: "completed" })
          .eq("transaction_id", paymentId);

        return { success: true };
      }

      return { success: false };
    } catch (err) {
      console.error("Error checking payment status:", err);
      return { success: false };
    }
  }
}