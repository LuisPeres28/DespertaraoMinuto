import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, amount, phoneNumber, paymentId } = await req.json()

    const accountId = 'bafe2a58-734e-43ff-9a87-19e28202f01b'
    const apiKey = '04f21956-25e6-4ca9-b8b9-c1182792b19a'

    if (action === 'create') {
      const payload = {
        type: "sale",
        method: "mbway",
        value: Number(amount),
        currency: "EUR",
        capture: {
          descriptive: "Desperto"
        },
        mbway: {
          phone: phoneNumber
        }
      }

      console.log("Creating MB WAY payment:", JSON.stringify(payload, null, 2))

      const response = await fetch('https://api.easypay.pt/2.0/single', {
        method: 'POST',
        headers: {
          'AccountId': accountId,
          'ApiKey': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const responseText = await response.text()
      console.log("Easypay response:", responseText)

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("JSON parse error:", responseText)
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid response from Easypay"
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }

      if (!response.ok) {
        console.error("Easypay error:", JSON.stringify(data))
        return new Response(JSON.stringify({
          success: false,
          error: data.message || data.error || "Payment failed"
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
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

    if (action === 'check') {
      const response = await fetch(`https://api.easypay.pt/2.0/single/${paymentId}`, {
        method: 'GET',
        headers: {
          'AccountId': accountId,
          'ApiKey': apiKey,
          'Content-Type': 'application/json'
        }
      })

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("JSON parse error on check:", responseText)
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid response from Easypay"
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        })
      }

      if (!response.ok) {
        return new Response(JSON.stringify({
          success: false,
          error: "Failed to check payment status"
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status
        })
      }

      return new Response(JSON.stringify({
        success: true,
        paid: data.method?.status === 'success' || data.status === 'paid'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      error: 'Unknown action'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("Fatal error:", error.message)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})