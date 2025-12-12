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

    const accountId = 'ba41236b-b132-4c82-bd06-ad4f6d33a6d4'
    const apiKey = '65f2bcb-d572-41f5-811e-38f6c5d3ef13'

    if (action === 'create') {
      // Automatically add country code 351 if not present
      const formattedPhone = phoneNumber.replace(/^351/, '').replace(/^\+351/, '')
      const phoneWithCountryCode = '351' + formattedPhone

      const payload = {
        type: "sale",
        method: "mbway",
        value: Number(amount),
        currency: "EUR",
        capture: {
          descriptive: "Desperto"
        },
        mbway: {
          phone: phoneWithCountryCode
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

      // Force real error display - throw the raw response if not ok
      if (!response.ok) {
        throw new Error(responseText)
      }

      const data = JSON.parse(responseText)

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
      console.log("Easypay check response:", responseText)

      // Force real error display - throw the raw response if not ok
      if (!response.ok) {
        throw new Error(responseText)
      }

      const data = JSON.parse(responseText)

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