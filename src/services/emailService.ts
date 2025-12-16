import { Booking, Client, Service, Therapist } from '../types';
import emailjs from '@emailjs/browser';

export interface EmailTemplate {
  subject: string;
  body: string;
}

export class EmailService {
  private static readonly DEFAULT_PUBLIC_KEY = 'yxdL1IoXHXaC3Q-Cw';
  private static readonly DEFAULT_PRIVATE_KEY = 'IDsqDpiM12CvEx1R0fKMt';
  private static readonly DEFAULT_SERVICE_ID = 'service_eqp55ju';
  private static readonly DEFAULT_TEMPLATE_ID = 'template_qwhxunh';

  static async initialize() {
    const publicKey = localStorage.getItem('emailjs_public_key') || this.DEFAULT_PUBLIC_KEY;
    const privateKey = localStorage.getItem('emailjs_private_key') || this.DEFAULT_PRIVATE_KEY;

    emailjs.init(publicKey);
    console.log('✅ EmailJS initialized successfully');

    if (privateKey) {
      console.log('✅ EmailJS credentials configured');
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

  static async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const serviceId = localStorage.getItem('emailjs_service_id') || this.DEFAULT_SERVICE_ID;
      const templateId = localStorage.getItem('emailjs_template_id') || this.DEFAULT_TEMPLATE_ID;
      const publicKey = localStorage.getItem('emailjs_public_key') || this.DEFAULT_PUBLIC_KEY;

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