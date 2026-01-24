import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  PaymentRequestButtonElement
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, CreditCard } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StripeExpressCheckout = ({ 
  cartItems, 
  shippingAddress, 
  email, 
  amount, 
  onPaymentSuccess, 
  onPaymentError,
  isLoading,
  setIsLoading 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [paymentRequest, setPaymentRequest] = useState(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [useCheckoutSession, setUseCheckoutSession] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Phileon Jewelry Order',
        amount: Math.round(amount * 100), // Convert to cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: true,
      shippingOptions: [
        {
          id: 'standard',
          label: 'Standard shipping',
          detail: 'Arrives in 5-7 business days',
          amount: Math.round((amount >= 100 ? 0 : 15) * 100),
        },
        {
          id: 'express',
          label: 'Express shipping',
          detail: 'Arrives in 2-3 business days',
          amount: 2500, // $25.00
        },
      ],
    });

    // Check if Payment Request is available
    pr.canMakePayment().then((result) => {
      if (result) {
        setCanMakePayment(true);
        setPaymentRequest(pr);
      }
    });

    // Handle payment method event
    pr.on('paymentmethod', async (event) => {
      setIsLoading(true);
      
      try {
        // Create payment intent
        const response = await axios.post(`${BACKEND_URL}/api/stripe/create-payment-intent`, {
          items: cartItems,
          shippingAddress: {
            firstName: event.payerName?.split(' ')[0] || '',
            lastName: event.payerName?.split(' ').slice(1).join(' ') || '',
            address: event.shippingAddress?.addressLine?.[0] || shippingAddress?.address || '',
            city: event.shippingAddress?.city || shippingAddress?.city || '',
            state: event.shippingAddress?.region || shippingAddress?.state || '',
            zipCode: event.shippingAddress?.postalCode || shippingAddress?.zipCode || '',
            country: event.shippingAddress?.country || shippingAddress?.country || 'US'
          },
          email: event.payerEmail || email,
          payment_method_types: ['apple_pay', 'google_pay']
        });

        const { client_secret } = response.data;

        // Confirm payment
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          client_secret,
          {
            payment_method: event.paymentMethod.id,
          },
          { handleActions: false }
        );

        if (error) {
          event.complete('fail');
          onPaymentError(error);
          toast({
            title: 'Payment Failed',
            description: error.message,
            variant: 'destructive'
          });
        } else {
          event.complete('success');
          
          // Create order
          const orderResponse = await axios.post(`${BACKEND_URL}/api/stripe/confirm-payment`, {
            payment_intent_id: paymentIntent.id,
            email: event.payerEmail || email,
            items: cartItems,
            shippingAddress: {
              firstName: event.payerName?.split(' ')[0] || '',
              lastName: event.payerName?.split(' ').slice(1).join(' ') || '',
              address: event.shippingAddress?.addressLine?.[0] || '',
              city: event.shippingAddress?.city || '',
              state: event.shippingAddress?.region || '',
              zipCode: event.shippingAddress?.postalCode || '',
              country: event.shippingAddress?.country || 'US'
            }
          });

          toast({
            title: 'Payment Successful!',
            description: 'Your order has been placed successfully.',
          });

          onPaymentSuccess({
            paymentIntent,
            order: orderResponse.data
          });
        }
      } catch (error) {
        event.complete('fail');
        console.error('Payment processing error:', error);
        toast({
          title: 'Payment Error',
          description: 'An error occurred while processing your payment.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      pr.destroy();
    };
  }, [stripe, amount, cartItems, shippingAddress, email]);

  const handleCheckoutSession = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/stripe/create-checkout-session`, {
        items: cartItems,
        email,
        shippingAddress,
        success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/checkout/cancel`
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Checkout session error:', error);
      toast({
        title: 'Checkout Error',
        description: 'Unable to start checkout. Please try again.',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  if (!stripe) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        <span className="ml-2 text-gray-600">Loading payment options...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Express Payment Buttons */}
      {canMakePayment && paymentRequest && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">Pay with one tap:</p>
          </div>
          
          <PaymentRequestButtonElement
            options={{
              paymentRequest,
              style: {
                paymentRequestButton: {
                  type: 'default',
                  theme: 'dark',
                  height: '48px',
                },
              },
            }}
            className="w-full"
          />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
        </div>
      )}

      {/* Alternative: Full Checkout Session */}
      <div className="space-y-4">
        <p className="text-sm text-gray-600 text-center">
          {canMakePayment ? 'Alternative payment options:' : 'Choose your payment method:'}
        </p>
        
        <Button
          onClick={handleCheckoutSession}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 text-lg transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Pay with Card, PayPal, or Digital Wallet
            </div>
          )}
        </Button>
      </div>

      {/* Payment Methods Available */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Accepted Payment Methods</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600">
          <div className="flex items-center">
            <Smartphone className="w-4 h-4 mr-1" />
            Apple Pay
          </div>
          <div className="flex items-center">
            <Smartphone className="w-4 h-4 mr-1" />
            Google Pay
          </div>
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 mr-1" />
            PayPal
          </div>
          <div className="flex items-center">
            <CreditCard className="w-4 h-4 mr-1" />
            All Cards
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeExpressCheckout;