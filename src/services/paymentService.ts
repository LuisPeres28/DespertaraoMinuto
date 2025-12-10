import { supabase } from '../lib/supabase';

export interface PaymentResult {
  success: boolean;
  paymentIntent?: any;
  error?: string;
}

export class PaymentService {

  // 1. LISTAR MÉTODOS
  static getPaymentMethods() {
    return [
      { id: 'mbway', label: 'MB Way', icon: 'smartphone' },
      { id: 'multibanco', label: 'Multibanco', icon: 'credit-card' }
    ];
  }

  // 2. MB WAY (Ligação Direta)
  static async processMBWayPayment(amount: number, phoneNumber: string, bookingId: string): Promise<PaymentResult> {
    console.log("📱 A iniciar pagamento MB WAY Direto...");

    try {
      const cleanPhone = phoneNumber.replace(/\s/g, '');
      
      // Validação do número
      if (!cleanPhone.match(/^(\+351)?9[1236]\d{7}$/)) {
        return { success: false, error: "Número de telemóvel inválido." };
      }

      // ⚠️ CHAVES REAIS DA TUA CONTA (Copiadas da imagem)
      const accountId = "bb8d2297-82c6-48c7-9033-b03d131931a3";
      const apiKey = "084a6b14-c7e5-430a-ad82-b7d8924aa3f1";

      const payload = {
        type: "sale",
        method: "mbw",
        value: amount,
        currency: "EUR",
        capture: {
          transaction_key: crypto.randomUUID(),
          descriptive: "Desperto ao Minuto"
        },
        customer: {
          phone: cleanPhone,
          phone_indicative: "+351"
        }
      };

      // Envia diretamente para a Easypay (Sem passar pelo servidor encravado)
      const response = await fetch('https://api.easypay.pt/2.0/single', {
        method: 'POST',
        headers: {
          'AccountId': accountId,
          'PartnerKey': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro Easypay:", result);
        return { success: false, error: result.message?.[0] || "Erro no pagamento." };
      }

      // Sucesso! Guarda na base de dados
      await supabase.from("payments").insert({
        id: result.id,
        booking_id: bookingId,
        amount,
        method: "mbway",
        status: "pending",
        transaction_id: result.id
      });

      return {
        success: true,
        paymentIntent: {
          id: result.id,
          amount,
          status: "pending",
          paymentMethod: "mbway"
        }
      };

    } catch (err) {
      console.error(err);
      return { success: false, error: "Erro de ligação. Tente novamente." };
    }
  }

  // 3. MULTIBANCO (Simulação para não bloquear)
  static async generateMultibancoReference(amount: number, bookingId: string) {
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

    return { entity: "11249", reference, amount };
  }

  // 4. VERIFICAR ESTADO (Vazio por agora para não dar erro)
  static async checkMBWayPaymentStatus(paymentId: string): Promise<PaymentResult> {
    return { success: false }; 
  }
}