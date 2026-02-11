import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to_email: string;
  to_name: string;
  date: string;
  time: string;
  location: string;
  message?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const emailData: EmailRequest = await req.json();

    console.log('📧 Sending email via EmailJS API...', {
      to: emailData.to_email,
      name: emailData.to_name,
    });

    // EmailJS credentials (hardcoded for reliability)
    const serviceId = "service_eqp55ju";
    const templateId = "template_w3awkf1";
    const publicKey = "yxdL1IoXHXaC3Q-Cw";

    // EmailJS API endpoint
    const emailjsUrl = `https://api.emailjs.com/api/v1.0/email/send`;

    // Prepare the payload for EmailJS
    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        to_email: emailData.to_email,
        to_name: emailData.to_name,
        date: emailData.date,
        time: emailData.time,
        location: emailData.location,
        message: emailData.message || "Nova marcação via Website"
      }
    };

    console.log('📋 Sending to EmailJS with params:', payload.template_params);

    // Send email through EmailJS API
    const response = await fetch(emailjsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📬 EmailJS response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ EmailJS error:', errorText);
      throw new Error(`EmailJS API error: ${response.status} - ${errorText}`);
    }

    const result = await response.text();
    console.log('✅ Email sent successfully:', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        details: { to: emailData.to_email }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Send email function error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'Failed to send email'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
