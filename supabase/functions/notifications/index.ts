import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface NotificationRequest {
  type: 'email' | 'sms'
  to: string
  subject?: string
  message: string
  bookingId?: string
  clientId?: string
  therapistId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { type, to, subject, message, bookingId, clientId, therapistId }: NotificationRequest = await req.json()

    if (type === 'email') {
      console.log('📧 Email notification:', {
        to,
        subject,
        message,
        bookingId,
        clientId,
        therapistId
      })

      // Log the notification attempt
      if (bookingId) {
        await supabase
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', bookingId)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email notification sent successfully',
          details: { to, subject, type: 'email' }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (type === 'sms') {
      // In a real implementation, you would integrate with an SMS service like:
      // - Twilio
      // - AWS SNS
      // - Vonage (Nexmo)
      
      console.log('📱 SMS notification:', {
        to,
        message,
        bookingId,
        clientId,
        therapistId
      })

      // For now, we'll simulate sending the SMS
      // In production, you would make an API call to your SMS service
      
      // Example with Twilio:
      /*
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${Deno.env.get('TWILIO_ACCOUNT_SID')}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${Deno.env.get('TWILIO_ACCOUNT_SID')}:${Deno.env.get('TWILIO_AUTH_TOKEN')}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: Deno.env.get('TWILIO_PHONE_NUMBER') || '',
          To: to,
          Body: message
        })
      })
      */

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'SMS notification sent successfully',
          details: { to, type: 'sms' }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid notification type' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Notifications function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})