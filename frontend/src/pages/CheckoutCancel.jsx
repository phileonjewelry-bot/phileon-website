import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Home, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Payment Cancelled</h1>
          <p className="text-xl text-gray-300">Your order was not completed</p>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardContent className="p-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">What Happened?</h2>
              <p className="text-gray-300 mb-6">
                Your payment was cancelled or interrupted. Don't worry - no charges were made to your account.
                Your cart items have been saved and you can complete your purchase at any time.
              </p>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">Common Reasons for Cancellation:</h3>
                <ul className="text-gray-400 text-sm space-y-1 text-left max-w-md mx-auto">
                  <li>• Payment window was closed</li>
                  <li>• Internet connection issues</li>
                  <li>• Decided to review order before purchasing</li>
                  <li>• Payment method declined</li>
                  <li>• Browser back button was used</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={() => navigate('/cart')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Cart
          </Button>
          <Button
            onClick={() => navigate('/checkout')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Try Payment Again
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            Continue Shopping
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-12">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Need Assistance?</h3>
              <p className="text-gray-400 text-sm mb-4">
                If you're experiencing payment issues or need help with your order, our customer service team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                <a href="mailto:support@phileon.com" className="text-yellow-500 hover:text-yellow-400">
                  support@phileon.com
                </a>
                <span className="hidden sm:block text-gray-600">|</span>
                <a href="tel:+1234567890" className="text-yellow-500 hover:text-yellow-400">
                  +1 (234) 567-8900
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <div className="mt-8">
          <Card className="bg-green-900/20 border-green-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-300">Your Information is Safe</p>
                  <p className="text-xs text-green-400 mt-1">
                    No payment information was processed or stored. Your cart items remain saved for when you're ready to complete your purchase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancel;