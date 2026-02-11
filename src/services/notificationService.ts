import { supabase } from '../lib/supabase';

export interface NotificationResult {
  success: boolean;
  message: string;
  emailSent?: boolean;
  smsSent?: boolean;
}

export class NotificationService {
  private static readonly ADMIN_EMAIL = 'euestoudesperto@gmail.com';

  static async createBookingNotifications(
    bookingId: string,
    clientId: string,
    clientEmail: string,
    clientPhone: string | undefined,
    therapistId: string,
    bookingDate: Date
  ): Promise<NotificationResult> {
    try {
      console.log('📬 Creating booking notifications...', {
        bookingId,
        clientEmail,
        clientPhone,
        bookingDate
      });

      const { error: notificationError } = await supabase.rpc(
        'create_booking_notifications',
        {
          p_booking_id: bookingId,
          p_client_id: clientId,
          p_client_email: clientEmail,
          p_client_phone: clientPhone || null,
          p_therapist_id: therapistId,
          p_admin_email: this.ADMIN_EMAIL
        }
      );

      if (notificationError) {
        console.error('❌ Error creating notifications:', notificationError);
        throw notificationError;
      }

      console.log('✅ Notifications created successfully');

      const { error: reminderError } = await supabase.rpc(
        'schedule_booking_reminders',
        {
          p_booking_id: bookingId,
          p_booking_date: bookingDate.toISOString()
        }
      );

      if (reminderError) {
        console.error('❌ Error scheduling reminders:', reminderError);
        throw reminderError;
      }

      console.log('✅ Reminders scheduled successfully');

      await this.triggerNotificationProcessing();

      return {
        success: true,
        message: 'Notificações criadas e enviadas com sucesso',
        emailSent: true,
        smsSent: !!clientPhone
      };
    } catch (error) {
      console.error('❌ Notification service error:', error);
      return {
        success: false,
        message: 'Erro ao criar notificações',
        emailSent: false,
        smsSent: false
      };
    }
  }

  static async triggerNotificationProcessing(): Promise<void> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const apiUrl = `${supabaseUrl}/functions/v1/process-notifications`;

      console.log('🔄 Triggering notification processing...');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Failed to trigger notification processing:', error);
      } else {
        const result = await response.json();
        console.log('✅ Notification processing triggered:', result);
      }
    } catch (error) {
      console.error('❌ Error triggering notification processing:', error);
    }
  }

  static async sendRescheduleNotification(
    bookingId: string,
    clientId: string,
    clientEmail: string,
    oldDate: Date,
    newDate: Date,
    notes: string
  ): Promise<NotificationResult> {
    try {
      const { error } = await supabase.from('notifications').insert({
        type: 'email',
        recipient_type: 'client',
        recipient_id: clientId,
        recipient_email: clientEmail,
        subject: 'Consulta Reagendada',
        message: `A sua consulta foi reagendada.\n\nData anterior: ${oldDate.toLocaleString('pt-PT')}\nNova data: ${newDate.toLocaleString('pt-PT')}\n\nMotivo: ${notes || 'Não especificado'}`,
        booking_id: bookingId,
        status: 'pending',
        scheduled_for: new Date().toISOString()
      });

      if (error) throw error;

      const adminNotification = await supabase.from('notifications').insert({
        type: 'email',
        recipient_type: 'admin',
        recipient_email: this.ADMIN_EMAIL,
        subject: 'Consulta Reagendada',
        message: `Consulta reagendada.\n\nCliente: ${clientEmail}\nData anterior: ${oldDate.toLocaleString('pt-PT')}\nNova data: ${newDate.toLocaleString('pt-PT')}\n\nMotivo: ${notes || 'Não especificado'}`,
        booking_id: bookingId,
        status: 'pending',
        scheduled_for: new Date().toISOString()
      });

      if (adminNotification.error) {
        console.error('❌ Failed to create admin notification:', adminNotification.error);
      }

      await this.triggerNotificationProcessing();

      return {
        success: true,
        message: 'Notificação de reagendamento enviada',
        emailSent: true
      };
    } catch (error) {
      console.error('❌ Error sending reschedule notification:', error);
      return {
        success: false,
        message: 'Erro ao enviar notificação',
        emailSent: false
      };
    }
  }

  static async sendCancellationNotification(
    bookingId: string,
    clientId: string,
    clientEmail: string,
    bookingDate: Date,
    serviceName: string
  ): Promise<NotificationResult> {
    try {
      const { error } = await supabase.from('notifications').insert({
        type: 'email',
        recipient_type: 'client',
        recipient_id: clientId,
        recipient_email: clientEmail,
        subject: 'Consulta Cancelada',
        message: `A sua consulta foi cancelada.\n\nServiço: ${serviceName}\nData: ${bookingDate.toLocaleString('pt-PT')}\n\nSe tiver alguma dúvida, por favor contacte-nos.`,
        booking_id: bookingId,
        status: 'pending',
        scheduled_for: new Date().toISOString()
      });

      if (error) throw error;

      const adminNotification = await supabase.from('notifications').insert({
        type: 'email',
        recipient_type: 'admin',
        recipient_email: this.ADMIN_EMAIL,
        subject: 'Consulta Cancelada',
        message: `Consulta cancelada.\n\nCliente: ${clientEmail}\nServiço: ${serviceName}\nData: ${bookingDate.toLocaleString('pt-PT')}`,
        booking_id: bookingId,
        status: 'pending',
        scheduled_for: new Date().toISOString()
      });

      if (adminNotification.error) {
        console.error('❌ Failed to create admin notification:', adminNotification.error);
      }

      await supabase
        .from('scheduled_reminders')
        .update({ status: 'cancelled' })
        .eq('booking_id', bookingId)
        .eq('status', 'pending');

      await this.triggerNotificationProcessing();

      return {
        success: true,
        message: 'Notificação de cancelamento enviada',
        emailSent: true
      };
    } catch (error) {
      console.error('❌ Error sending cancellation notification:', error);
      return {
        success: false,
        message: 'Erro ao enviar notificação',
        emailSent: false
      };
    }
  }

  static async getPendingNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return [];
    }
  }

  static async getScheduledReminders(bookingId: string) {
    try {
      const { data, error } = await supabase
        .from('scheduled_reminders')
        .select('*')
        .eq('booking_id', bookingId)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Error fetching scheduled reminders:', error);
      return [];
    }
  }
}
