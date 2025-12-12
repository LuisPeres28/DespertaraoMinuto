import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Lidar com a segurança do browser (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Receber os dados do site
    const { action, amount, phoneNumber, paymentId } = await req.json()
    
    // 3. Configuração Easypay (Produção)
    const accountId = Deno.env.get('EASYPAY_ACCOUNT_ID') || 'bafe2a58-734e-43ff-9a87-19e28202f01b'
    const apiKey = Deno.env.get('EASYPAY_API_KEY') || '04f21956-25e6-4ca9-b8b9-c1182792b19a'
    const isProduction = true

    if (!accountId || !apiKey) {
      throw new Error('Chaves da Easypay não encontradas no servidor')
    }

    // ─────────────────────────────────────────────
    // AÇÃO: CRIAR PAGAMENTO
    // ─────────────────────────────────────────────
    if (action === 'create') {
      
      const payload = {
        type: "sale",
        method: "mbw",
        value: Number(amount),
        currency: "EUR",
        capture: {
            transaction_key: crypto.randomUUID(),
            descriptive: "Desperto ao Minuto"
        },
        customer: {
            phone: phoneNumber,
            phone_indicative: "+351"
        }
      }

      console.log("A pedir pagamento à Easypay...")

      const response = await fetch('https://api.easypay.pt/2.0/single', {
        method: 'POST',
        headers: {
            'AccountId': accountId,
            'PartnerKey': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Erro ao fazer parse JSON:", responseText)
        return new Response(JSON.stringify({
            success: false,
            error: "Resposta inválida da Easypay: " + responseText.substring(0, 100)
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      if (!response.ok) {
         console.error("Erro Easypay:", JSON.stringify(data))
         return new Response(JSON.stringify({
             success: false,
             error: data.message?.[0] || data.error || "Erro na Easypay"
         }), {
             headers: { ...corsHeaders, 'Content-Type': 'application/json' }
         })
      }

      return new Response(JSON.stringify({ 
        success: true, 
        paymentId: data.id, 
        phoneNumber: phoneNumber 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // ─────────────────────────────────────────────
    // AÇÃO: VERIFICAR ESTADO
    // ─────────────────────────────────────────────
    if (action === 'check') {
        const response = await fetch(`https://api.easypay.pt/2.0/single/${paymentId}`, {
            method: 'GET',
            headers: {
                'AccountId': accountId,
                'PartnerKey': apiKey,
                'Content-Type': 'application/json'
            }
        })

        const responseText = await response.text()
        let data

        try {
          data = JSON.parse(responseText)
        } catch (e) {
          console.error("Erro ao fazer parse JSON no check:", responseText)
          return new Response(JSON.stringify({
              success: false,
              error: "Resposta inválida da Easypay"
          }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({
            success: true,
            paid: data.method?.status === 'processed'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Ação desconhecida' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error("Erro fatal:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})