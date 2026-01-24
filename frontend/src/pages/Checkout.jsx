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
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="text-gray-400 hover:text-white mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-4xl font-bold text-white">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {step}
              </div>
              <span className={`ml-2 text-sm ${
                currentStep >= step ? 'text-yellow-500' : 'text-gray-400'
              }`}>
                {step === 1 ? 'Contact' : step === 2 ? 'Shipping' : 'Payment'}
              </span>
              {step < 3 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  currentStep > step ? 'bg-yellow-500' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Contact Information */}
            {currentStep === 1 && (
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
                      <Label htmlFor="email" className="text-gray-300 mb-2 block">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`bg-gray-800 border-gray-700 text-white focus:border-yellow-500 ${
                          formErrors.email ? 'border-red-500' : ''
                        }`}
                        placeholder="you@example.com"
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={handleNextStep}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-2"
                    >
                      Continue to Shipping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Shipping Address */}
            {currentStep === 2 && (
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
                      <Label htmlFor="firstName" className="text-gray-300 mb-2 block">First Name *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`bg-gray-800 border-gray-700 text-white focus:border-yellow-500 ${
                          formErrors.firstName ? 'border-red-500' : ''
                        }`}
                      />
                      {formErrors.firstName && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-300 mb-2 block">Last Name *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`bg-gray-800 border-gray-700 text-white focus:border-yellow-500 ${
                          formErrors.lastName ? 'border-red-500' : ''
                        }`}
                      />
                      {formErrors.lastName && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address" className="text-gray-300 mb-2 block">Street Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`bg-gray-800 border-gray-700 text-white focus:border-yellow-500 ${
                          formErrors.address ? 'border-red-500' : ''
                        }`}
                      />
                      {formErrors.address && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-gray-300 mb-2 block">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`bg-gray-800 border-gray-700 text-white focus:border-yellow-500 ${
                          formErrors.city ? 'border-red-500' : ''
                        }`}
                      />
                      {formErrors.city && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-gray-300 mb-2 block">State/Province *</Label>
                      <Input
                        id="state"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`bg-gray-800 border-gray-700 text-white focus:border-yellow-500 ${
                          formErrors.state ? 'border-red-500' : ''
                        }`}
                      />
                      {formErrors.state && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="zipCode" className="text-gray-300 mb-2 block">ZIP/Postal Code *</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        required
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className={`bg-gray-800 border-gray-700 text-white focus:border-yellow-500 ${
                          formErrors.zipCode ? 'border-red-500' : ''
                        }`}
                      />
                      {formErrors.zipCode && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-gray-300 mb-2 block">Country *</Label>
                      <select
                        id="country"
                        name="country"
                        required
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:border-yellow-500 ${
                          formErrors.country ? 'border-red-500' : ''
                        }`}
                      >
                        <option value="USA">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                      {formErrors.country && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <Button
                      onClick={handlePrevStep}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-2"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-2"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500/10 p-2 rounded-lg">
                        <CreditCard className="w-6 h-6 text-yellow-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Payment</h2>
                    </div>
                    <Button
                      onClick={handlePrevStep}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Back
                    </Button>
                  </div>
                  
                  <PaymentMethods
                    cartItems={cartItems}
                    shippingAddress={formData}
                    email={formData.email}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </CardContent>
              </Card>
            )}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;