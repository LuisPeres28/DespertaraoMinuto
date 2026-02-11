import { Booking, Client, Service, Therapist } from '../types';
import emailjs from '@emailjs/browser';

export interface EmailTemplate {
  subject: string;
  body: string;
}

export class EmailService {
  static async initialize() {
    try {
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      if (publicKey) {
        emailjs.init(publicKey);
      }
    } catch (error) {
      console.error('Error initializing EmailJS:', error);
    }
  }

  static generateConfirmationEmail(
    booking: Booking,
    client: Client,
    service: Service,
    therapist: Therapist,
    couponPassword?: string
  ): EmailTemplate {
    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString('pt-PT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = bookingDate.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const couponSection = couponPassword ? `

🎫 **CUPÃO GRATUITO UTILIZADO:**
Password validada: **${couponPassword}**

✅ O seu cupão foi validado com sucesso! Consulta gratuita confirmada.
Válida para: ${formattedDate} às ${formattedTime}

` : '';
    return {
      subject: `Confirmação de Agendamento - ${service.name}`,
      body: `
Olá ${client.name},

O seu agendamento foi confirmado com sucesso!

📅 **Detalhes do Agendamento:**
- **Serviço:** ${service.name}
- **Terapeuta:** ${therapist.name}
- **Data:** ${formattedDate}
- **Hora:** ${formattedTime}
- **Duração:** ${service.duration} minutos
- **Preço:** €${service.price}

📍 **Localização:** Desperto - Coaching ao Minuto

📞 **Contacto:** Para qualquer questão, pode contactar-nos através deste email.

🔗 **Gerir Agendamento:**
- [Reagendar Consulta](${window.location.origin}/reschedule/${booking.id})
- [Cancelar Consulta](${window.location.origin}/cancel/${booking.id})

**Importante:** Por favor, chegue 5 minutos antes da hora marcada.

Obrigado por escolher a Desperto!

Com os melhores cumprimentos,
Equipa Desperto
euestoudesperto@gmail.com
      `
    };
  }

  static generateReminderEmail(
    booking: Booking,
    client: Client,
    service: Service,
    therapist: Therapist,
    hoursUntil: number
  ): EmailTemplate {
    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString('pt-PT');
    const formattedTime = bookingDate.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return {
      subject: `Lembrete: Consulta em ${hoursUntil} horas - ${service.name}`,
      body: `
Olá ${client.name},

Este é um lembrete da sua consulta marcada para hoje.

📅 **Detalhes:**
- **Serviço:** ${service.name}
- **Terapeuta:** ${therapist.name}
- **Data:** ${formattedDate}
- **Hora:** ${formattedTime}
- **Duração:** ${service.duration} minutos

📍 **Localização:** Desperto - Despertar ao Minuto

🔗 **Precisa de reagendar?**
- [Reagendar Consulta](${window.location.origin}/reschedule/${booking.id})
- [Cancelar Consulta](${window.location.origin}/cancel/${booking.id})

Aguardamos por si!

Equipa Desperto
euestoudesperto@gmail.com
      `
    };
  }

  static async sendClientConfirmationEmail(
    clientEmail: string,
    clientName: string,
    bookingDate: Date,
    bookingTime: string,
    location: string
  ): Promise<boolean> {
    console.log('🚀 === STARTING EMAIL SEND PROCESS (via Edge Function) ===');

    try {
      const dateDay = String(bookingDate.getDate()).padStart(2, '0');
      const dateMonth = String(bookingDate.getMonth() + 1).padStart(2, '0');
      const dateYear = String(bookingDate.getFullYear());
      const formattedDate = `${dateDay}/${dateMonth}/${dateYear}`;

      const emailData = {
        to_email: clientEmail,
        to_name: clientName,
        date: formattedDate,
        time: bookingTime,
        location: location,
        message: "Nova marcação via Website"
      };

      console.log('📋 Sending email via Edge Function:', emailData);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const apiUrl = `${supabaseUrl}/functions/v1/send-email`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Edge Function error:', result);
        throw new Error(result.error || 'Failed to send email');
      }

      console.log('✅ Email sent successfully via Edge Function!', result);
      return true;

    } catch (error: any) {
      console.error('❌ Email error:', error);
      // Don't show aggressive alerts - just log the error
      console.warn('⚠️ Email não foi enviado, mas a reserva foi criada');
      // Return true to allow booking to continue
      return true;
    }
  }

  static async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        console.warn('⚠️ EmailJS environment variables not configured');
        console.log('📧 Email details for manual sending:');
        console.log('From: euestoudesperto@gmail.com');
        console.log('To:', to);
        console.log('Subject:', template.subject);
        console.log('Body:', template.body);
        return true;
      }

      console.log('📧 Sending email to:', to);
      console.log('📧 Using Service ID:', serviceId);
      console.log('📧 Using Template ID:', templateId);

      const result = await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: to,
          from_email: 'euestoudesperto@gmail.com',
          subject: template.subject,
          message: template.body,
          reply_to: 'euestoudesperto@gmail.com'
        },
        publicKey
      );

      console.log('✅ Email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);

      // Fallback: Log the email details for manual sending
      console.log('📧 Email details for manual sending:');
      console.log('From: euestoudesperto@gmail.com');
      console.log('To:', to);
      console.log('Subject:', template.subject);
      console.log('Body:', template.body);

      // For now, return true to continue the booking process
      return true;
    }
  }

  static async sendRescheduleNotification(
    clientName: string,
    clientEmail: string,
    oldDate: Date,
    newDate: Date,
    notes: string,
    serviceName: string
  ): Promise<boolean> {
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_RESCHEDULE_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      const adminEmail = 'euestoudesperto@gmail.com';

      if (!serviceId || !templateId || !publicKey) {
        console.warn('⚠️ EmailJS reschedule template not configured');
        console.log('📧 Reschedule notification details:');
        console.log('To: Admin', adminEmail);
        console.log('Client:', clientName, clientEmail);
        console.log('Old Date:', oldDate);
        console.log('New Date:', newDate);
        console.log('Notes:', notes);
        return true;
      }

      const formattedOldDate = oldDate.toLocaleDateString('pt-PT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const formattedNewDate = newDate.toLocaleDateString('pt-PT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      console.log('📧 Sending reschedule notification to admin');

      const result = await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: adminEmail,
          name: clientName,
          email: clientEmail,
          date: formattedOldDate,
          new_date: formattedNewDate,
          notes: notes || 'Sem motivo especificado',
          service: serviceName,
          reply_to: clientEmail
        },
        publicKey
      );

      console.log('✅ Reschedule notification sent successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ Reschedule notification failed:', error);
      return false;
    }
  }

  static async sendSMS(to: string, message: string): Promise<boolean> {
    // In a real application, this would integrate with an SMS service like:
    // - Twilio
    // - AWS SNS
    // - Vonage (Nexmo)

    console.log('📱 SMS would be sent to:', to);
    console.log('📱 Message:', message);

    // Simulate SMS sending
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.05); // 95% success rate simulation
      }, 500);
    });
  }
}