import React, { useState } from 'react';
import { Clock, User, Mail, Phone, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AvailabilityService, TimeSlot } from '../../services/availabilityService';
import { EmailService } from '../../services/emailService';
import { CalendarService } from '../../services/calendarService';
import { PaymentStep } from '../Booking/PaymentStep';
import { RecurrencePattern } from '../Booking/RecurringBooking';
import { ClientLogin } from '../Auth/ClientLogin';
import { ClientHistory } from './ClientHistory';
import { v4 as uuidv4 } from 'uuid';

interface ClientBookingProps {
  onComplete?: () => void;
  initialClientData?: any;
}

export function ClientBooking({ onComplete, initialClientData }: ClientBookingProps = {}) {
  const { services, businessSettings, therapists, bookings, setBookings, clients, setClients } = useApp();
  const [step, setStep] = useState(1);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [requirePayment, setRequirePayment] = useState(false);
  const [clientInfo, setClientInfo] = useState(() => {
    if (initialClientData) {
      return {
        name: initialClientData.fullName || initialClientData.name || '',
        email: initialClientData.email || '',
        phone: initialClientData.phone || '',
        notes: ''
      };
    }
    return {
      name: '',
      email: '',
      phone: '',
      notes: ''
    };
  });
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null);
  const [generatedCouponPassword, setGeneratedCouponPassword] = useState<string>('');
  const [showLogin, setShowLogin] = useState(false);
  const [authenticatedClient, setAuthenticatedClient] = useState<any>(initialClientData);
  const [showHistory, setShowHistory] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const availableServices = selectedTherapist
    ? services.filter(service => service.therapistId === selectedTherapist)
    : [];

  const selectedServiceDetails = services.find(s => s.id === selectedService);

  React.useEffect(() => {
    if (selectedDate && selectedServiceDetails) {
      const therapist = therapists.find(t => t.id === selectedTherapist);
      const slots = AvailabilityService.generateTimeSlots(
        selectedDate,
        businessSettings,
        bookings,
        selectedTherapist,
        selectedServiceDetails.duration,
        therapists,
        therapist?.availability,
        clientInfo.email,
        clients
      );
      setAvailableSlots(slots);
    }
  }, [selectedDate, selectedServiceDetails, selectedTherapist, businessSettings, bookings, therapists, clientInfo.email, clients]);

  React.useEffect(() => {
    if (selectedServiceDetails) {
      setRequirePayment(true);
    }
  }, [selectedServiceDetails, businessSettings]);

  const generateRecurringBookings = (baseBooking: any): any[] => {
    if (!recurrencePattern) return [baseBooking];
    const bookings = [baseBooking];
    return bookings;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleBooking = async (paymentId?: string) => {
    if (!selectedDate || !selectedTime || !selectedServiceDetails) return;

    let client = clients.find(c => c.email === clientInfo.email);
    if (!client) {
      client = {
        id: uuidv4(),
        name: clientInfo.name,
        email: clientInfo.email,
        phone: clientInfo.phone,
        notes: clientInfo.notes,
        serviceHistory: [],
        paymentHistory: [],
        createdAt: new Date(),
        therapistNotes: []
      };
      setClients(prev => [...prev, client!]);
    }

    const bookingDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const baseBooking = {
      id: uuidv4(),
      clientId: client.id,
      serviceId: selectedService,
      therapistId: selectedTherapist,
      date: bookingDateTime,
      status: 'confirmed' as const,
      notes: clientInfo.notes,
      paymentStatus: paymentId ? 'paid' as const : 'pending' as const,
      reminderSent: false
    };

    const allBookings = generateRecurringBookings(baseBooking);
    setBookings(prev => [...prev, ...allBookings]);

    try {
      const location = 'Google Meet (o link será enviado por email)';
      await EmailService.sendClientConfirmationEmail(
        client.email,
        client.name,
        bookingDateTime,
        selectedTime,
        location
      );
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }

    setStep(6);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    if (paymentId.startsWith('coupon_')) {
      const password = paymentId.replace('coupon_', '');
      setGeneratedCouponPassword(password);
    }
    handleBooking(paymentId);
  };

  const handlePaymentSkip = () => {
    handleBooking();
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  React.useEffect(() => {
    if (initialClientData) {
      setAuthenticatedClient(initialClientData);
      updateClientInfo(initialClientData);
    } else {
      const savedAuth = localStorage.getItem('clientAuth');
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          setAuthenticatedClient(authData);
          updateClientInfo(authData);
        } catch (error) {
          console.error('Error parsing saved auth:', error);
          localStorage.removeItem('clientAuth');
        }
      }
    }
  }, [initialClientData]);

  const updateClientInfo = (clientData: any) => {
    setClientInfo({
      name: clientData.fullName || clientData.name || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      notes: ''
    });
  };

  React.useEffect(() => {
    if (authenticatedClient) {
      updateClientInfo(authenticatedClient);
    }
  }, [authenticatedClient]);

  React.useEffect(() => {
    if (step === 4 && authenticatedClient) {
      updateClientInfo(authenticatedClient);
    }
  }, [step, authenticatedClient]);

  const handleLogin = (clientData: any) => {
    setAuthenticatedClient(clientData);
    localStorage.setItem('clientAuth', JSON.stringify(clientData));
    setShowLogin(false);
  };

  const handleLogout = () => {
    setAuthenticatedClient(null);
    localStorage.removeItem('clientAuth');
    setClientInfo({ name: '', email: '', phone: '', notes: '' });
    setStep(1);
    setSelectedTherapist('');
    setSelectedService('');
    setSelectedDate(null);
    setSelectedTime('');
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/Desperto LOGO.jpg" alt="Desperto" className="h-12 w-12 rounded-full object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Desperto</h1>
                <p className="text-sm text-gray-600">Despertar ao Minuto</p>
              </div>
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#7A6349] transition-colors font-medium"
            >
              ENTRAR
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4, 5, 6].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step === stepNum
                    ? 'bg-[#8B7355] text-white'
                    : step > stepNum
                    ? 'bg-[#8B7355] text-white'
                    : 'bg-white text-gray-400 border-2 border-gray-300'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 6 && (
                  <div className={`w-12 h-0.5 ${
                    step > stepNum ? 'bg-[#8B7355]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <p className="text-sm text-gray-600">
              {step === 1 && 'Escolha o Terapeuta'}
              {step === 2 && 'Escolha o Serviço'}
              {step === 3 && 'Selecione Data e Hora'}
              {step === 4 && 'Informações de Contacto'}
              {step === 5 && 'Pagamento'}
              {step === 6 && 'Agendamento Confirmado'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Escolha o Seu Terapeuta
              </h2>

              <div className="space-y-4 mb-8">
                {therapists.filter(t => t.available).map((therapist) => (
                  <div
                    key={therapist.id}
                    onClick={() => setSelectedTherapist(therapist.id)}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedTherapist === therapist.id
                        ? 'border-[#8B7355] bg-[#F5F1E8]'
                        : 'border-gray-200 hover:border-[#8B7355]'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={therapist.image}
                        alt={therapist.name}
                        className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#8B7355] mb-1">
                          {therapist.name}
                        </h3>
                        <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                          {therapist.bio}
                        </p>
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-2">Especialidades:</p>
                          <div className="flex flex-wrap gap-2">
                            {therapist.specialties?.map((specialty, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-[#F4E5B7] text-[#8B7355] text-xs rounded-full font-medium"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => selectedTherapist && setStep(2)}
                  disabled={!selectedTherapist}
                  className="px-12 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Escolha o Seu Serviço
              </h2>

              <div className="space-y-4 mb-8">
                {availableServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedService === service.id
                        ? 'border-[#8B7355] bg-[#F5F1E8]'
                        : 'border-gray-200 hover:border-[#8B7355]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-[#8B7355]">{service.name}</h3>
                      <div className="text-xl font-bold text-[#8B7355]">€{service.price}</div>
                    </div>
                    <p className="text-gray-700 mb-3 text-sm">{service.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} min</span>
                      </div>
                      <span className="px-3 py-1 bg-[#F4E5B7] text-[#8B7355] rounded-full text-xs font-medium">
                        {service.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-8 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  onClick={() => selectedService && setStep(3)}
                  disabled={!selectedService}
                  className={`px-12 py-2 rounded-lg font-medium ${
                    selectedService
                      ? 'bg-[#8B7355] text-white hover:bg-[#7A6349]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Escolha Data e Hora
              </h2>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-lg font-semibold text-[#8B7355]">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h3>
                  <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-3">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {days.map((date, index) => {
                    const isToday = date && date.toDateString() === new Date().toDateString();
                    const isPast = date && date < new Date();
                    const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString();

                    let isBlocked = false;
                    let doesntWorkThisDay = false;

                    if (date && selectedTherapist) {
                      const therapist = therapists.find(t => t.id === selectedTherapist);
                      if (therapist?.availability) {
                        isBlocked = therapist.availability.blockedDates?.some(blockedDate => {
                          const blocked = new Date(blockedDate);
                          return blocked.toDateString() === date.toDateString();
                        }) || false;
                        const dayOfWeek = date.getDay();
                        doesntWorkThisDay = !therapist.availability.workingDays.includes(dayOfWeek);
                      }
                    }

                    return (
                      <div key={index} className="aspect-square">
                        {date && (
                          <button
                            onClick={() => !isPast && !isBlocked && !doesntWorkThisDay && setSelectedDate(date)}
                            disabled={isPast || isBlocked || doesntWorkThisDay}
                            className={`w-full h-full rounded-lg text-sm font-medium ${
                              isSelected
                                ? 'bg-[#8B7355] text-white'
                                : isToday
                                ? 'bg-[#F4E5B7] text-[#8B7355]'
                                : isPast
                                ? 'text-gray-300 cursor-not-allowed'
                                : isBlocked || doesntWorkThisDay
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            {date.getDate()}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-[#8B7355] mb-3">Horários Disponíveis</h3>
                  {availableSlots.length === 0 ? (
                    <div className="text-center py-6 text-gray-600 text-sm">
                      Sem horários disponíveis para este dia
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`py-2 rounded-lg text-sm font-medium ${
                            selectedTime === slot.time
                              ? 'bg-[#8B7355] text-white'
                              : !slot.available
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-2 border-gray-200 hover:border-[#8B7355]'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="px-8 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  Voltar
                </button>
                <button
                  onClick={() => selectedDate && selectedTime && setStep(4)}
                  disabled={!selectedDate || !selectedTime}
                  className={`px-12 py-2 rounded-lg font-medium ${
                    selectedDate && selectedTime
                      ? 'bg-[#8B7355] text-white hover:bg-[#7A6349]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Informações de Contacto
              </h2>

              <div className="max-w-lg mx-auto space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
                      placeholder="O seu nome"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                  <div className="relative">
                    <Phone className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
                      placeholder="+351 xxx xxx xxx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                  <div className="relative">
                    <MessageSquare className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <textarea
                      value={clientInfo.notes}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B7355] focus:border-transparent resize-none"
                      placeholder="Algo que gostaria de partilhar..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(3)} className="px-8 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  Voltar
                </button>
                <button
                  onClick={() => setStep(5)}
                  disabled={!clientInfo.name || !clientInfo.email || !clientInfo.phone}
                  className={`px-12 py-2 rounded-lg font-medium ${
                    clientInfo.name && clientInfo.email && clientInfo.phone
                      ? 'bg-[#8B7355] text-white hover:bg-[#7A6349]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 5 && selectedServiceDetails && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Pagamento
              </h2>

              <div className="max-w-lg mx-auto mb-8">
                <PaymentStep
                  amount={selectedServiceDetails.price}
                  serviceName={selectedServiceDetails.name}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentSkip={handlePaymentSkip}
                  requirePayment={requirePayment}
                  clientEmail={clientInfo.email}
                  serviceId={selectedService}
                  stripePaymentLink={selectedServiceDetails.stripePaymentLink}
                />
              </div>

              <div className="flex justify-center">
                <button onClick={() => setStep(4)} className="px-8 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                  Voltar
                </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Agendamento Confirmado!
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                O seu agendamento foi registado com sucesso. Receberá um email de confirmação em breve.
              </p>

              <div className="bg-[#F5F1E8] rounded-xl p-6 mb-6 text-left max-w-lg mx-auto">
                <h3 className="font-semibold text-[#8B7355] mb-3">Detalhes do Agendamento:</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Terapeuta:</span> {therapists.find(t => t.id === selectedTherapist)?.name}</p>
                  <p><span className="font-medium">Serviço:</span> {services.find(s => s.id === selectedService)?.name}</p>
                  <p><span className="font-medium">Data:</span> {selectedDate?.toLocaleDateString('pt-PT')}</p>
                  <p><span className="font-medium">Hora:</span> {selectedTime}</p>
                  <p><span className="font-medium">Nome:</span> {clientInfo.name}</p>
                  <p><span className="font-medium">Email:</span> {clientInfo.email}</p>
                </div>
              </div>

              {selectedDate && selectedTime && selectedServiceDetails && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#8B7355] mb-3 text-sm">Adicionar ao Calendário</h3>
                  <div className="flex justify-center gap-2">
                    {(() => {
                      const startDate = new Date(`${selectedDate.toDateString()} ${selectedTime}`);
                      const endDate = new Date(startDate);
                      endDate.setMinutes(endDate.getMinutes() + selectedServiceDetails.duration);
                      const event = {
                        title: `${selectedServiceDetails.name} - Despertar`,
                        start: startDate,
                        end: endDate,
                        description: `Consulta com ${therapists.find(t => t.id === selectedTherapist)?.name}`,
                        location: 'Desperto - Despertar ao Minuto'
                      };

                      return (
                        <>
                          <a href={CalendarService.generateGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#7A6349] text-xs font-medium">Google Calendar</a>
                          <a href={CalendarService.generateOutlookCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#7A6349] text-xs font-medium">Outlook</a>
                          <button onClick={() => CalendarService.downloadICSFile(event)} className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs font-medium">Download .ics</button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  if (onComplete) {
                    onComplete();
                  } else {
                    setStep(1);
                    setSelectedTherapist('');
                    setSelectedService('');
                    setSelectedDate(null);
                    setSelectedTime('');
                    setClientInfo(authenticatedClient ? {
                      name: authenticatedClient.name,
                      email: authenticatedClient.email,
                      phone: authenticatedClient.phone || '',
                      notes: ''
                    } : { name: '', email: '', phone: '', notes: '' });
                    setAvailableSlots([]);
                  }
                }}
                className="px-12 py-2 bg-[#8B7355] text-white rounded-lg font-medium hover:bg-[#7A6349]"
              >
                {onComplete ? 'Voltar ao Painel' : 'Novo Agendamento'}
              </button>
            </div>
          )}
        </div>

        {showLogin && (
          <ClientLogin
            onLogin={handleLogin}
            onClose={() => setShowLogin(false)}
          />
        )}

        {showHistory && authenticatedClient && (
          <ClientHistory
            clientId={authenticatedClient.id}
            onClose={() => setShowHistory(false)}
          />
        )}
      </div>
    </div>
  );
}
