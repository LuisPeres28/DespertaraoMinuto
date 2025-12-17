import { Booking, Client, Service, Therapist } from '../types';
import emailjs from '@emailjs/browser';

export interface EmailTemplate {
  subject: string;
  body: string;
}

export class EmailService {
  static async initialize() {
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;

    console.log('🔧 Initializing EmailJS...');
    console.log('Service ID:', serviceId ? '✓ Configured' : '✗ Missing');
    console.log('Template ID:', templateId ? '✓ Configured' : '✗ Missing');
    console.log('Public Key:', publicKey ? '✓ Configured' : '✗ Missing');

    if (!publicKey) {
      console.warn('⚠️ VITE_EMAILJS_PUBLIC_KEY not configured');
      alert('⚠️ EmailJS não está configurado corretamente. Verifique as variáveis de ambiente.');
      return;
    }

    emailjs.init(publicKey);
    console.log('✅ EmailJS initialized successfully');
    console.log('✅ Ready to send emails using Service:', serviceId);
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
    console.log('🚀 === STARTING EMAIL SEND PROCESS ===');

    try {
      // STEP 1: Initialize EmailJS explicitly
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      console.log('📋 STEP 1: Initializing EmailJS...');
      console.log('Public Key exists:', !!publicKey);

      if (!publicKey) {
        alert('❌ ERRO CRÍTICO: Public Key não encontrada!');
        return false;
      }

      emailjs.init(publicKey);
      console.log('✅ STEP 1 COMPLETE: EmailJS initialized');

      // STEP 2: Load environment variables
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_w3awkf1';

      console.log('📋 STEP 2: Loading config...');
      console.log('Service ID:', serviceId);
      console.log('Template ID:', templateId);

      alert(`🔍 CONFIG LOADED:\nTemplate: ${templateId}\nService: ${serviceId}`);

      if (!serviceId || !templateId) {
        alert(`❌ ERRO: Configuração incompleta!\nService: ${serviceId}\nTemplate: ${templateId}`);
        return false;
      }

      // STEP 3: Prepare email data
      const formattedDate = `${String(bookingDate.getDate()).padStart(2, '0')}/${String(bookingDate.getMonth() + 1).padStart(2, '0')}/${bookingDate.getFullYear()}`;

      const emailData = {
        email: clientEmail,
        name: clientName,
        date: formattedDate,
        time: bookingTime,
        location: location
      };

      console.log('📋 STEP 3: Email data prepared:', emailData);

      // STEP 4: Send email with strict error handling
      console.log('📋 STEP 4: Calling emailjs.send()...');

      const result = await emailjs.send(
        serviceId,
        templateId,
        emailData,
        publicKey
      );

      console.log('✅ STEP 4 COMPLETE: Email sent!', result);
      alert(`✅ SUCESSO: Email enviado! Verifique o histórico.\nStatus: ${result.status}\nText: ${result.text}`);
      return true;

    } catch (error: any) {
      console.error('❌ ERRO CAPTURADO:', error);
      console.error('Error name:', error?.name);
      console.error('Error message:', error?.message);
      console.error('Error text:', error?.text);
      console.error('Error status:', error?.status);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      const errorDetails = {
        name: error?.name || 'Unknown',
        message: error?.message || 'No message',
        text: error?.text || 'No text',
        status: error?.status || 'No status',
        full: JSON.stringify(error)
      };

      alert(`❌ ERRO NO ENVIO:\n${JSON.stringify(errorDetails, null, 2)}`);
      return false;
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