import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { action, amount, phoneNumber, paymentId } = await req.json();

    const accountId = "002948d9-596e-4a75-868b-c2f39801e377";
    const apiKey = "b7ae0f00-0662-4fee-97e3-93fe5227b7af";

    if (action === "create") {
      const phone = phoneNumber.replace(/[^0-9]/g, "").slice(-9);

      console.log("Creating MB WAY payment");
      console.log("Amount:", amount);
      console.log("Phone:", "351" + phone);

      // CRITICAL: No 'url' field in body - only these fields
      const body = JSON.stringify({
        type: "sale",
        method: "mbway",
        value: amount,
        currency: "EUR",
        mbway: {
          phone: "351" + phone
        },
        capture: {
          descriptive: "Desperto"
        }
      });

      console.log("Request body:", body);

      const response = await fetch("https://api.prod.easypay.pt/2.0/single", {
        method: "POST",
        headers: {
          "AccountId": "002948d9-596e-4a75-868b-c2f39801e377",
          "ApiKey": "b7ae0f00-0662-4fee-97e3-93fe5227b7af",
          "Content-Type": "application/json"
        },
        body: body
      });

      const responseText = await response.text();
      console.log("Easypay response status:", response.status);
      console.log("Easypay response:", responseText);

      if (!response.ok) {
        throw new Error(responseText);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Non-JSON response: " + responseText);
      }

      return new Response(JSON.stringify({
        success: true,
        paymentId: data.id,
        phoneNumber: phoneNumber
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === "check") {
      const response = await fetch(`https://api.prod.easypay.pt/2.0/single/${paymentId}`, {
        method: "GET",
        headers: {
          "AccountId": accountId,
          "ApiKey": apiKey,
          "Content-Type": "application/json"
        }
      });

      const responseText = await response.text();
      console.log("Easypay check response:", responseText);

      if (!response.ok) {
        throw new Error(responseText);
      }

      const data = JSON.parse(responseText);

      return new Response(JSON.stringify({
        success: true,
        paid: data.method?.status === "success" || data.status === "paid"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      error: "Unknown action"
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Fatal error:", error.message);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});