import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Package, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import PaymentMethods from '../components/PaymentMethods';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });
  const [shippingCost, setShippingCost] = useState(15);
  const [currentStep, setCurrentStep] = useState(1); // 1: Contact, 2: Shipping, 3: Payment
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      navigate('/cart');
    }
    setCartItems(cart);
  }, [navigate]);

  useEffect(() => {
    // Mock shipping calculation based on country/state
    if (formData.country && formData.state) {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (subtotal >= 100) {
        setShippingCost(0);
      } else if (formData.country === 'USA') {
        setShippingCost(15);
      } else {
        setShippingCost(35);
      }
    }
  }, [formData.country, formData.state, cartItems]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.email) errors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    }
    
    if (step === 2) {
      if (!formData.firstName) errors.firstName = 'First name is required';
      if (!formData.lastName) errors.lastName = 'Last name is required';
      if (!formData.address) errors.address = 'Address is required';
      if (!formData.city) errors.city = 'City is required';
      if (!formData.state) errors.state = 'State is required';
      if (!formData.zipCode) errors.zipCode = 'ZIP code is required';
      if (!formData.country) errors.country = 'Country is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePaymentSuccess = (paymentData) => {
    toast({
      title: 'Payment Successful!',
      description: 'Thank you for your purchase. Order confirmation sent to your email.',
    });
    localStorage.setItem('cart', '[]');
    navigate('/checkout/success', { 
      state: { 
        orderId: paymentData.order?.order_id,
        paymentIntent: paymentData.paymentIntent
      } 
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast({
      title: 'Payment Failed',
      description: error.message || 'An error occurred while processing your payment.',
      variant: 'destructive'
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-yellow-500/10 p-2 rounded-lg">
                      <MapPin className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Contact Information</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-gray-300 mb-2 block">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-yellow-500/10 p-2 rounded-lg">
                      <Package className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Shipping Address</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-300 mb-2 block">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-300 mb-2 block">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address" className="text-gray-300 mb-2 block">Street Address</Label>
                      <Input
                        id="address"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-gray-300 mb-2 block">City</Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-gray-300 mb-2 block">State/Province</Label>
                      <Input
                        id="state"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode" className="text-gray-300 mb-2 block">ZIP/Postal Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-gray-300 mb-2 block">Country</Label>
                      <select
                        id="country"
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:border-yellow-500"
                      >
                        <option value="USA">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-yellow-500/10 p-2 rounded-lg">
                      <CreditCard className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Payment Information</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardName" className="text-gray-300 mb-2 block">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        required
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardNumber" className="text-gray-300 mb-2 block">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        required
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate" className="text-gray-300 mb-2 block">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          required
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv" className="text-gray-300 mb-2 block">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          required
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">Note: Payment processing is mocked for demo purposes</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900 border-gray-800 sticky top-6">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
                  
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex gap-4">
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium line-clamp-2">{item.name}</p>
                          <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-yellow-500 font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 pt-4 border-t border-gray-800">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span className="text-white">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Shipping</span>
                      <span className={shippingCost === 0 ? 'text-green-500 font-semibold' : 'text-white'}>
                        {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                      </span>
                    </div>
                    {subtotal >= 100 && (
                      <div className="flex items-center gap-2 text-green-500 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Free shipping applied!</span>
                      </div>
                    )}
                    <div className="border-t border-gray-800 pt-3">
                      <div className="flex justify-between text-white text-xl font-bold">
                        <span>Total</span>
                        <span className="text-yellow-500">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-6 text-lg transition-all duration-300 hover:scale-105"
                  >
                    Place Order
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;