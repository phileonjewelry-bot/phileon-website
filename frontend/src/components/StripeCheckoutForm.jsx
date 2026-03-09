import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Lock } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const StripeCheckoutForm = ({ 
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
  const [clientSecret, setClientSecret] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [useDetailedForm, setUseDetailedForm] = useState(false);

  // Card element options
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
    },
  };

  // Create Payment Intent on component mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await axios.post(`${BACKEND_URL}/api/stripe/create-payment-intent`, {
          items: cartItems,
          shippingAddress,
          email,
          amount: Math.round(amount * 100) // Convert to cents
        });
        
        setClientSecret(response.data.client_secret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        toast({
          title: 'Payment Setup Error',
          description: 'Unable to initialize payment. Please try again.',
          variant: 'destructive'
        });
      }
    };

    if (cartItems.length > 0 && stripe) {
      createPaymentIntent();
    }
  }, [cartItems, shippingAddress, email, amount, stripe]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements || !clientSecret) {
      setIsLoading(false);
      return;
    }

    const cardElement = useDetailedForm 
      ? elements.getElement(CardNumberElement)
      : elements.getElement(CardElement);

    if (!cardElement) {
      setIsLoading(false);
      return;
    }

    // Confirm payment with Stripe
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: cardholderName || `${shippingAddress?.firstName} ${shippingAddress?.lastName}`,
          email: email,
          address: {
            line1: shippingAddress?.address,
            city: shippingAddress?.city,
            state: shippingAddress?.state,
            postal_code: shippingAddress?.zipCode,
            country: shippingAddress?.country === 'USA' ? 'US' : shippingAddress?.country,
          },
        },
      },
    });

    if (error) {
      console.error('Payment failed:', error);
      toast({
        title: 'Payment Failed',
        description: error.message,
        variant: 'destructive'
      });
      onPaymentError(error);
      setIsLoading(false);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      // Confirm payment on backend and create order
      try {
        const orderResponse = await axios.post(`${BACKEND_URL}/api/stripe/confirm-payment`, {
          payment_intent_id: paymentIntent.id,
          email,
          items: cartItems,
          shippingAddress
        });

        toast({
          title: 'Payment Successful!',
          description: 'Your order has been placed successfully.',
        });

        onPaymentSuccess({
          paymentIntent,
          order: orderResponse.data
        });
      } catch (error) {
        console.error('Order creation failed:', error);
        toast({
          title: 'Order Processing Error',
          description: 'Payment succeeded but order creation failed. Please contact support.',
          variant: 'destructive'
        });
      }
    }

    setIsLoading(false);
  };

  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        <span className="ml-2 text-gray-600">Loading payment form...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cardholder Name */}
      <div>
        <Label htmlFor="cardholderName" className="text-sm font-medium text-gray-700">
          Cardholder Name
        </Label>
        <Input
          id="cardholderName"
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="John Doe"
          className="mt-1"
          required
        />
      </div>

      {/* Toggle between simple and detailed card form */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
        <button
          type="button"
          onClick={() => setUseDetailedForm(!useDetailedForm)}
          className="text-xs text-yellow-600 hover:text-yellow-700 underline"
        >
          {useDetailedForm ? 'Use Simple Form' : 'Use Detailed Form'}
        </button>
      </div>

      {/* Card Input Elements */}
      {useDetailedForm ? (
        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Card Number</Label>
            <div className="mt-1 p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500">
              <CardNumberElement options={cardElementOptions} />
            </div>
          </div>
          
          {/* Expiry and CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
              <div className="mt-1 p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500">
                <CardExpiryElement options={cardElementOptions} />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">CVC</Label>
              <div className="mt-1 p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500">
                <CardCvcElement options={cardElementOptions} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <Label className="text-sm font-medium text-gray-700">Card Details</Label>
          <div className="mt-1 p-3 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-yellow-500">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      )}

      {/* Save Card Option */}
      <div className="flex items-center">
        <input
          id="saveCard"
          type="checkbox"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
          className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
        />
        <Label htmlFor="saveCard" className="ml-2 text-sm text-gray-600">
          Save card for future purchases
        </Label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Pay ${amount.toFixed(2)}
          </div>
        )}
      </Button>

      {/* Security Info */}
      <div className="flex items-center justify-center text-sm text-gray-500">
        <Lock className="w-4 h-4 mr-1" />
        Your payment information is encrypted and secure
      </div>
    </form>
  );
};

export default StripeCheckoutForm;