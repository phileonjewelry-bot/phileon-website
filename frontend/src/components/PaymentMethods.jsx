import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from './StripeCheckoutForm';
import StripeExpressCheckout from './StripeExpressCheckout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';

// Initialize Stripe (you'll need to get your publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_');

const PaymentMethods = ({ 
  cartItems, 
  shippingAddress, 
  email, 
  onPaymentSuccess, 
  onPaymentError 
}) => {
  const [selectedMethod, setSelectedMethod] = useState('stripe');
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = subtotal >= 100 ? 0 : (shippingAddress?.country === 'USA' ? 15 : 35);
  const total = subtotal + shippingCost;

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      component: StripeCheckoutForm
    },
    {
      id: 'express',
      name: 'Express Checkout',
      description: 'Apple Pay, Google Pay, PayPal',
      icon: Smartphone,
      component: StripeExpressCheckout
    }
  ];

  return (
    <Elements stripe={stripePromise}>
      <div className="space-y-6">
        {/* Payment Method Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <Card 
                key={method.id}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedMethod === method.id 
                    ? 'border-yellow-500 bg-yellow-500/5 shadow-lg' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedMethod === method.id 
                        ? 'bg-yellow-500/20 text-yellow-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected Payment Component */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-yellow-500" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMethod === 'stripe' && (
              <StripeCheckoutForm
                cartItems={cartItems}
                shippingAddress={shippingAddress}
                email={email}
                amount={total}
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
            
            {selectedMethod === 'express' && (
              <StripeExpressCheckout
                cartItems={cartItems}
                shippingAddress={shippingAddress}
                email={email}
                amount={total}
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Secure Payment</p>
              <p className="text-xs text-gray-500 mt-1">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
};

export default PaymentMethods;