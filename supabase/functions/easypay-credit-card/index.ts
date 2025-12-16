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
    const { amount, bookingId } = await req.json();

    const accountId = "002948d9-596e-4a75-868b-c2f39801e377";
    const apiKey = "b7ae0f00-0662-4fee-97e3-93fe5227b7af";

    console.log("Creating Credit Card payment");
    console.log("Amount:", amount);
    console.log("Booking ID:", bookingId);

    // Create a payment with credit card method
    const body = JSON.stringify({
      type: "sale",
      payment: {
        methods: ["cc"],
        type: "single",
        currency: "EUR",
        value: amount
      },
      order: {
        key: `BOOKING-${bookingId}`,
        items: [{
          description: "Consulta Desperto",
          value: amount,
          quantity: 1
        }]
      }
    });

    console.log("Request body:", body);

    const response = await fetch("https://api.prod.easypay.pt/2.0/checkout", {
      method: "POST",
      headers: {
        "AccountId": accountId,
        "ApiKey": apiKey,
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
      checkoutUrl: data.session?.url
    }), {
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