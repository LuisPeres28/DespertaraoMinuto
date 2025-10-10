import React, { useState } from 'react';
import { CreditCard, DollarSign, Loader, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { PaymentService } from '../../services/paymentService';
import { CouponService } from '../../services/couponService';
import { useApp } from '../../context/AppContext';

interface PaymentStepProps {
  amount: number;
  serviceName: string;
  onPaymentSuccess: (paymentId: string) => void;
  onPaymentSkip: () => void;
  requirePayment: boolean;
  clientEmail?: string;
  serviceId?: string;
  stripePaymentLink?: string;
}

export function PaymentStep({
  amount,
  serviceName,
  onPaymentSuccess,
  onPaymentSkip,
  requirePayment,
  clientEmail,
  serviceId,
  stripePaymentLink
}: PaymentStepProps) {
  const { coupons, setCoupons, couponUsage, setCouponUsage, clients, services } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [showPaymentLink, setShowPaymentLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState<string>('');
  const [couponPassword, setCouponPassword] = useState<string>('');
  const [inputCouponPassword, setInputCouponPassword] = useState<string>('');
  const [validatedCoupon, setValidatedCoupon] = useState<any>(null);
  const [couponValidationError, setCouponValidationError] = useState<string>('');
  const [mbwayPhone, setMbwayPhone] = useState<string>('');

  const paymentMethods = PaymentService.getPaymentMethods();

  const generateCouponPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };
  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    setPaymentResult(null);

    if (selectedMethod === 'mbway') {
      // Handle MB WAY payment
      if (!mbwayPhone.trim()) {
        setPaymentResult({ success: false, error: 'Por favor, insira o número de telefone MB WAY' });
        setIsProcessing(false);
        return;
      }

      try {
        const result = await PaymentService.processMBWayPayment(amount, mbwayPhone, 'temp-booking-id');

        if (result.success && result.paymentIntent) {
          setPaymentResult({ success: true });
          window.setTimeout(() => {
            onPaymentSuccess(result.paymentIntent!.id);
          }, 1500);
        } else {
          setPaymentResult({ success: false, error: result.error || 'Erro no pagamento MB WAY' });
        }
      } catch (error) {
        setPaymentResult({ success: false, error: 'Erro ao processar MB WAY. Tente novamente.' });
      } finally {
        setIsProcessing(false);
      }
    } else if (selectedMethod === 'multibanco') {
      // For Multibanco, generate reference and show it
      try {
        const reference = await PaymentService.generateMultibancoReference(amount, 'temp-booking-id');
        setPaymentResult({
          success: false,
          error: `Referência Multibanco gerada:\n\nEntidade: ${reference.entity}\nReferência: ${reference.reference}\nValor: €${amount}\n\nApós o pagamento, o seu agendamento será confirmado automaticamente.`
        });
        setIsProcessing(false);
      } catch (error) {
        setPaymentResult({ success: false, error: 'Erro ao gerar referência Multibanco' });
        setIsProcessing(false);
      }
    } else if (selectedMethod === 'coupon') {
      // For coupon/ticket, validate password and confirm
      if (!inputCouponPassword.trim()) {
        setCouponValidationError('Por favor, insira a password do cupão fornecida pelo terapeuta.');
        setIsProcessing(false);
        return;
      }
      
      try {
        // Validar cupão usando o serviço
        const validation = CouponService.validateCouponPassword(
          inputCouponPassword,
          coupons,
          serviceId,
          clientEmail,
          clients
        );

        if (!validation.isValid) {
          setCouponValidationError(validation.error || 'Cupão inválido');
          setIsProcessing(false);
          return;
        }

        // Cupão válido
        setValidatedCoupon(validation.coupon);
        setCouponPassword(inputCouponPassword);
        setCouponValidationError('');
        
        // Calcular desconto real
        let finalDiscount = 0;
        if (validation.coupon.type === 'fixed_amount') {
          finalDiscount = Math.min(validation.coupon.value, amount);
        } else if (validation.coupon.type === 'percentage') {
          finalDiscount = (amount * validation.coupon.value) / 100;
        } else if (validation.coupon.type === 'free_service') {
          finalDiscount = amount;
        }

        // Marcar cupão como usado
        const client = clients?.find(c => c.email === clientEmail);
        if (client) {
          CouponService.useCoupon(
            validation.coupon.id,
            'temp-booking-id',
            client.id,
            finalDiscount,
            coupons,
            setCoupons,
            couponUsage,
            setCouponUsage
          );
        }

        setPaymentResult({ success: true });
        setTimeout(() => {
          onPaymentSuccess(`coupon_${inputCouponPassword}_discount_${finalDiscount}`);
        }, 1500);
        
      } catch (error) {
        console.error('Erro ao processar cupão:', error);
        setCouponValidationError('Erro ao processar cupão. Tente novamente.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // For other payments, just confirm
      try {
        const result = await PaymentService.processPayment(amount, selectedMethod, 'temp-booking-id');
        
        if (result.success && result.paymentIntent) {
          setPaymentResult({ success: true });
          window.setTimeout(() => {
            onPaymentSuccess(result.paymentIntent!.id);
          }, 1500);
        } else {
          setPaymentResult({ success: false, error: result.error });
        }
      } catch (error) {
        setPaymentResult({ success: false, error: 'Erro inesperado. Tente novamente.' });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handlePaymentConfirmation = () => {
    // Simulate successful payment after external payment
    setPaymentResult({ success: true });
    setTimeout(() => {
      onPaymentSuccess('payment_confirmed');
    }, 1500);
  };

  if (paymentResult?.success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagamento Processado!</h3>
        <p className="text-gray-600">O seu pagamento foi processado com sucesso.</p>
        
        {couponPassword && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-900 mb-2">🎫 Cupão Validado</h4>
            <div className="bg-white border-2 border-dashed border-yellow-300 rounded-lg p-4 mb-3">
              <p className="text-sm text-gray-600 mb-2">Password Utilizada:</p>
              <div className="text-2xl font-mono font-bold text-yellow-800 bg-yellow-100 px-4 py-2 rounded border">
                {couponPassword}
              </div>
            </div>
            <p className="text-sm text-yellow-700">
              ✅ <strong>Cupão validado com sucesso!</strong> O seu agendamento gratuito foi confirmado.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (showPaymentLink) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete o Seu Pagamento</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-blue-800 mb-4">
              Clique no botão abaixo para completar o pagamento de <strong>€{amount}</strong> via {selectedMethod === 'mbway' ? 'MB WAY' : 'Cartão'}.
            </p>
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Pagar €{amount} via {selectedMethod === 'mbway' ? 'MB WAY' : 'Cartão'}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pagamento Obrigatório
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{serviceName}</span>
            <span className="text-2xl font-bold text-gray-900">€{amount}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          O pagamento é obrigatório para confirmar o seu agendamento.
        </p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">
          Escolha o método de pagamento:
        </h4>
        {paymentMethods.map((method) => (
          <div key={method.id}>
            <button
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full p-4 border-2 rounded-xl text-left transition-all min-h-[60px] ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{method.icon}</span>
                <span className="font-medium text-base">{method.name}</span>
              </div>
            </button>

            {/* MB WAY Phone Input */}
            {selectedMethod === 'mbway' && method.id === 'mbway' && (
              <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">📱</span>
                    <span className="font-medium text-blue-900">Pagamento MB WAY</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Insira o seu número de telemóvel associado ao MB WAY. Receberá uma notificação no seu telemóvel para aprovar o pagamento.
                  </p>
                </div>

                <label className="block text-sm font-medium text-green-900 mb-2">
                  📱 Número de Telemóvel
                </label>
                <input
                  type="tel"
                  value={mbwayPhone}
                  onChange={(e) => setMbwayPhone(e.target.value)}
                  placeholder="912345678 ou +351912345678"
                  className="w-full px-4 py-4 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg min-h-[48px]"
                  style={{ touchAction: 'manipulation' }}
                />

                <p className="text-xs text-green-700 mt-2">
                  💡 <strong>Nota:</strong> Certifique-se que tem a app MB WAY instalada e o número está ativo.
                </p>
              </div>
            )}

            {/* Coupon Password Input */}
            {selectedMethod === 'coupon' && method.id === 'coupon' && (
              <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                {/* Coupon Info */}
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">🎫</span>
                    <span className="font-medium text-blue-900">Como usar o seu cupão</span>
                  </div>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• A password foi fornecida pelo seu terapeuta</li>
                    <li>• Formato: XXXX-XXXX (8 caracteres)</li>
                    <li>• Verifique email, WhatsApp ou SMS</li>
                    <li>• Contacte o terapeuta se não recebeu</li>
                  </ul>
                </div>

                <label className="block text-sm font-medium text-yellow-900 mb-2">
                  🎫 Password do Cupão
                </label>
                <input
                  type="text"
                  value={inputCouponPassword}
                  onChange={(e) => setInputCouponPassword(e.target.value.toUpperCase())}
                  placeholder="Digite a password fornecida pelo terapeuta"
                  className="w-full px-4 py-4 border border-yellow-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono text-center text-lg min-h-[48px]"
                  maxLength={9}
                  style={{ touchAction: 'manipulation' }}
                />
                
                {/* Validation Error */}
                {couponValidationError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-800 text-sm">{couponValidationError}</p>
                  </div>
                )}

                {/* Validated Coupon Info */}
                {validatedCoupon && !couponValidationError && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">Cupão Válido!</span>
                    </div>
                    <div className="text-sm text-green-800">
                      <p><strong>Tipo:</strong> {
                        validatedCoupon.type === 'fixed_amount' ? `€${validatedCoupon.value} desconto` :
                        validatedCoupon.type === 'percentage' ? `${validatedCoupon.value}% desconto` :
                        'Serviço gratuito'
                      }</p>
                      <p><strong>Válido até:</strong> {new Date(validatedCoupon.validUntil).toLocaleDateString('pt-PT')}</p>
                      {validatedCoupon.description && (
                        <p><strong>Descrição:</strong> {validatedCoupon.description}</p>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-yellow-700 mt-2">
                  💡 <strong>Dica:</strong> A password foi fornecida pelo seu terapeuta via email, WhatsApp ou telefone.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {(paymentResult?.error || couponValidationError) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <X className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{paymentResult?.error || couponValidationError}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handlePayment}
          disabled={
            !selectedMethod ||
            isProcessing ||
            (selectedMethod === 'coupon' && !inputCouponPassword.trim()) ||
            (selectedMethod === 'mbway' && !mbwayPhone.trim())
          }
          className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-base min-h-[48px]"
          style={{ touchAction: 'manipulation' }}
        >
          {isProcessing ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {selectedMethod === 'coupon' ? 'Validar Cupão' :
               selectedMethod === 'mbway' ? 'Pagar com MB WAY' :
               `Pagar €${amount}`}
            </>
          )}
        </button>
      </div>
    </div>
  );
}