export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentMethod: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

export class PaymentService {
  // Configuration for real payment processors
  private static STRIPE_PUBLISHABLE_KEY = 'pk_test_...'; // Your Stripe key
  private static EASYPAY_ACCOUNT_ID = 'your-easypay-id'; // Your Easypay account
  
  static async processPayment(
    amount: number,
    paymentMethod: string,
    bookingId: string
  ): Promise<PaymentResult> {
    if (paymentMethod === 'mbway') {
      return this.processMBWayPayment(amount, bookingId);
    }
    
    console.log('💳 Processing payment:', { amount, paymentMethod, bookingId });
    
    // Simulate payment processing
    return new Promise((resolve) => {
      window.setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
          resolve({
            success: true,
            paymentIntent: {
              id: `pi_${Date.now()}`,
              amount,
              currency: 'EUR',
              status: 'completed',
              paymentMethod
            }
          });
        } else {
          resolve({
            success: false,
            error: 'Payment failed. Please try again.'
          });
        }
      }, 2000);
    });
  }

  static async processMBWayPayment(
    amount: number,
    bookingId: string
  ): Promise<PaymentResult> {
    try {
      // Option 1: Using Stripe (supports MB WAY in Portugal)
      const stripeResult = await this.createStripePayment(amount, 'mbway', bookingId);
      if (stripeResult.success) return stripeResult;
      
      // Option 2: Using Easypay (Portuguese payment processor)
      const easypayResult = await this.createEasypayPayment(amount, bookingId);
      return easypayResult;
      
    } catch (error) {
      return {
        success: false,
        error: 'Erro ao processar pagamento MB WAY. Tente novamente.'
      };
    }
  }

  private static async createStripePayment(
    amount: number,
    paymentMethod: string,
    bookingId: string
  ): Promise<PaymentResult> {
    // Stripe integration for MB WAY
    // You need to install: npm install @stripe/stripe-js
    
    const stripe = await import('@stripe/stripe-js').then(m => 
      m.loadStripe(this.STRIPE_PUBLISHABLE_KEY)
    );
    
    if (!stripe) {
      throw new Error('Stripe not loaded');
    }

    // Create payment intent on your backend
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount * 100, // Stripe uses cents
        currency: 'eur',
        payment_method_types: ['multibanco', 'mb_way'],
        metadata: { bookingId }
      })
    });

    const { client_secret } = await response.json();
    
    const result = await stripe.confirmPayment({
      clientSecret: client_secret,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`
      }
    });

    return {
      success: !result.error,
      error: result.error?.message,
      paymentIntent: result.paymentIntent ? {
        id: result.paymentIntent.id,
        amount,
        currency: 'EUR',
        status: result.paymentIntent.status as any,
        paymentMethod: 'mbway'
      } : undefined
    };
  }

  private static async createEasypayPayment(
    amount: number,
    bookingId: string
  ): Promise<PaymentResult> {
    // Easypay integration for MB WAY
    const easypayData = {
      type: 'sale',
      payment: {
        methods: ['mb_way'],
        currency: 'EUR',
        amount: amount
      },
      order: {
        key: bookingId,
        items: [{
          key: 'booking',
          description: 'Consulta Desperto',
          value: amount,
          quantity: 1
        }]
      }
    };

    const response = await fetch('https://api.easypay.pt/2.0/single', {
      method: 'POST',
      headers: {
        'AccountId': this.EASYPAY_ACCOUNT_ID,
        'ApiKey': 'your-easypay-api-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(easypayData)
    });

    const result = await response.json();
    
    if (result.status === 'ok') {
      // Redirect to Easypay payment page
      window.location.href = result.method.url;
      
      return {
        success: true,
        paymentIntent: {
          id: result.id,
          amount,
          currency: 'EUR',
          status: 'pending',
          paymentMethod: 'mbway'
        }
      };
    }

    return {
      success: false,
      error: result.message || 'Erro no pagamento MB WAY'
    };
  }

  static async createPaymentLink(
    amount: number,
    description: string,
    bookingId: string
  ): Promise<string> {
    // For Portugal, you can integrate with:
    // 1. Stripe (supports MB WAY and Portuguese cards)
    // 2. PayPal (widely accepted)
    // 3. Easypay (Portuguese payment processor)
    // 4. Multibanco (Portuguese banking system)
    
    // Example Stripe integration URL (you'll need to set up Stripe)
    const stripeParams = new URLSearchParams({
      'client_reference_id': bookingId,
      'line_items[0][price_data][currency]': 'EUR',
      'line_items[0][price_data][product_data][name]': description,
      'line_items[0][price_data][unit_amount]': (amount * 100).toString(), // Stripe uses cents
      'line_items[0][quantity]': '1',
      'mode': 'payment',
      'success_url': `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${window.location.origin}/payment/cancel`,
      'payment_method_types[]': 'card',
      'locale': 'pt'
    });
    
    // This would be your actual Stripe checkout URL
    // return `https://checkout.stripe.com/pay/${stripeParams.toString()}`;
    
    // For now, return a demo payment page
    return `https://demo-payment.desperto.com/pay?amount=${amount}&description=${encodeURIComponent(description)}&booking=${bookingId}`;
  }

  static async generateMultibancoReference(
    amount: number,
    bookingId: string
  ): Promise<{ entity: string; reference: string; amount: number }> {
    // In a real application, this would integrate with:
    // - Easypay (Portuguese payment processor)
    // - SIBS (Multibanco network)
    // - Your bank's API for generating references
    
    console.log('🏧 Generating Multibanco reference:', { amount, bookingId });
    
    // Simulate reference generation
    return new Promise((resolve) => {
      window.setTimeout(() => {
        // Generate a realistic Multibanco reference
        const entity = '12345'; // Your entity number (provided by payment processor)
        const reference = Math.floor(100000000 + Math.random() * 900000000).toString();
        
        resolve({
          entity,
          reference,
          amount
        });
      }, 1000);
    });
  }

  static getPaymentMethods(): Array<{ id: string; name: string; icon: string }> {
    return [
      { id: 'card', name: 'Cartão de Crédito/Débito', icon: '💳' },
      { id: 'mbway', name: 'MB WAY', icon: '📱' },
      { id: 'paypal', name: 'PayPal', icon: '🅿️' },
      { id: 'multibanco', name: 'Referência Multibanco', icon: '🏧' },
      { id: 'coupon', name: 'Cupão/Ticket', icon: '🎫' }
    ];
  }
}