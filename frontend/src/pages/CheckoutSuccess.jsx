import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Package, Mail, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (sessionId) {
          // Handle Stripe Checkout session completion
          const response = await axios.get(`${BACKEND_URL}/api/stripe/session/${sessionId}`);
          if (response.data.success) {
            setOrderDetails({
              orderId: response.data.order_id,
              sessionId: sessionId,
              paymentStatus: 'completed'
            });
          } else {
            setError('Payment was not completed successfully.');
          }
        } else if (orderId) {
          // Handle direct order ID (from payment intent)
          setOrderDetails({
            orderId: orderId,
            paymentStatus: 'completed'
          });
        } else {
          setError('No order information found.');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError('Unable to retrieve order information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 w-full max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Order Error</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <Button
              onClick={() => navigate('/')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
          <p className="text-xl text-gray-300">Thank you for your order</p>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Order Details</h2>
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="text-yellow-500 font-mono">{orderDetails?.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className="text-green-500 font-semibold capitalize">{orderDetails?.paymentStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Date:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  {orderDetails?.sessionId && (
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="text-yellow-500 font-mono text-sm">{orderDetails.sessionId.slice(-8)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-4">What's Next?</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-6 h-6 text-yellow-500 mt-1" />
                    <div>
                      <p className="text-white font-semibold">Order Confirmation</p>
                      <p className="text-gray-400 text-sm">We've sent a confirmation email with your order details.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Package className="w-6 h-6 text-yellow-500 mt-1" />
                    <div>
                      <p className="text-white font-semibold">Order Processing</p>
                      <p className="text-gray-400 text-sm">Your order will be processed within 1-2 business days.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-6 h-6 text-yellow-500 mt-1" />
                    <div>
                      <p className="text-white font-semibold">Shipping Updates</p>
                      <p className="text-gray-400 text-sm">You'll receive tracking information once shipped.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            Continue Shopping
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/products')}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3"
          >
            View Our Collection
          </Button>
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
              <p className="text-gray-400 text-sm mb-4">
                If you have any questions about your order, please don't hesitate to contact us.
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
      </div>
    </div>
  );
};

export default CheckoutSuccess;