import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const EASYPAY_API_URL = "https://api.prod.easypay.pt/2.0";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const accountId = Deno.env.get("EASYPAY_ACCOUNT_ID");
    const apiKey = Deno.env.get("EASYPAY_API_KEY");

    if (!accountId || !apiKey) {
      return new Response(
        JSON.stringify({
          error: "Easypay credentials not configured",
          message: "Contact administrator to configure Easypay"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { action, phoneNumber, amount, bookingId, paymentId } = await req.json();

    if (action === "create") {
      if (!phoneNumber || !amount) {
        return new Response(
          JSON.stringify({ error: "Phone number and amount are required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const cleanPhone = phoneNumber.replace(/\s/g, '').replace('+351', '');

      if (!cleanPhone.match(/^9[1236]\d{7}$/)) {
        return new Response(
          JSON.stringify({
            error: "Invalid Portuguese phone number",
            message: "Use format: 912345678"
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const paymentData = {
        type: "sale",
        payment: {
          methods: ["mb"],
          type: "single",
          currency: "EUR",
          expiration_time: null
        },
        order: {
          key: bookingId || `booking_${Date.now()}`,
          value: amount
        },
        customer: {
          phone: cleanPhone,
          phone_indicative: "+351"
        }
      };

      console.log("Creating MB WAY payment:", paymentData);

      const response = await fetch(`${EASYPAY_API_URL}/single`, {
        method: "POST",
        headers: {
          "AccountId": accountId,
          "ApiKey": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Easypay error:", responseData);
        return new Response(
          JSON.stringify({
            error: "Failed to create MB WAY payment",
            details: responseData
          }),
          {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("MB WAY payment created:", responseData);

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: responseData.id,
          status: responseData.status,
          method: responseData.method,
          phoneNumber: cleanPhone,
          amount: amount,
          message: "Payment request sent to MB WAY app"
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );

    } else if (action === "check") {
      if (!paymentId) {
        return new Response(
          JSON.stringify({ error: "Payment ID is required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const response = await fetch(`${EASYPAY_API_URL}/single/${paymentId}`, {
        method: "GET",
        headers: {
          "AccountId": accountId,
          "ApiKey": apiKey,
          "Content-Type": "application/json",
        },
      });

      const paymentDetails = await response.json();

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            error: "Failed to check payment status",
            details: paymentDetails
          }),
          {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentId: paymentDetails.id,
          status: paymentDetails.status,
          paid: paymentDetails.status === "success" || paymentDetails.status === "paid",
          details: paymentDetails
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );

    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action. Use 'create' or 'check'" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error("Error processing MB WAY payment:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});