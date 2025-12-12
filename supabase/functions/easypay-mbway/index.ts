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
      const phone = phoneNumber.replace(/[^0-9]/g, '').slice(-9)

      console.log("Creating MB WAY payment")
      console.log("Amount:", String(amount))
      console.log("Phone:", "351" + phone)

      const body = JSON.stringify({
        type: "sale",
        method: "mbway",
        value: String(amount),
        currency: "EUR",
        mbway: {
          phone: "351" + phone
        },
        capture: {
          descriptive: "Desperto"
        }
      })

      console.log("Request body:", body)

      const response = await fetch('https://api.easypay.pt/2.0/single', {
        method: 'POST',
        headers: {
          "AccountId": "bafe2a58-734e-43ff-9a87-19e28202f01b",
          "ApiKey": "04f21956-25e6-4ca9-b8b9-c1182792b19a",
          "Content-Type": "application/json"
        },
        body: body
      })

      const responseText = await response.text()
      console.log("Easypay response status:", response.status)
      console.log("Easypay response:", responseText)

      if (!response.ok) {
        throw new Error(responseText)
      }

      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        throw new Error("Non-JSON response: " + responseText)
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
      console.log("Easypay check response:", responseText)

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