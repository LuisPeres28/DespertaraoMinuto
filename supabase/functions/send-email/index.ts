import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to_email: string;
  subject: string;
  message: string;
  to_name?: string;
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

    console.log('📧 Sending email via SendGrid...', {
      to: emailData.to_email,
      subject: emailData.subject,
    });

    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    if (!sendgridApiKey) {
      throw new Error("SENDGRID_API_KEY not configured");
    }

    // Prepare HTML email body
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Desperto - Coaching ao Minuto</h1>
            </div>
            <div class="content">
              ${emailData.message.replace(/\n/g, '<br>')}
            </div>
            <div class="footer">
              <p>Este email foi enviado automaticamente. Por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email through SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: emailData.to_email, name: emailData.to_name || '' }],
            subject: emailData.subject || 'Confirmação de Agendamento - Desperto',
          }
        ],
        from: {
          email: 'euestoudesperto@gmail.com',
          name: 'Desperto - Coaching ao Minuto'
        },
        content: [
          {
            type: 'text/html',
            value: htmlBody
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SendGrid error:', errorText);
      throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
    }

    console.log('✅ Email sent successfully via SendGrid!');

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
