import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { usePresentment } from '../context/PresentmentContext';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const presentment = usePresentment();
  const isApprox = presentment.isApproximate;

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  };

  const updateQuantity = (id, change) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast({
      title: 'Item Removed',
      description: 'Item has been removed from your cart.',
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal;   // Shipping is calculated server-side at checkout by destination.

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-700 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
          <p className="text-gray-400 mb-8">Add some beautiful jewelry to your cart</p>
          <Link to="/products">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(item => (
              <Card key={item.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <Link to={`/product/${item.id}`} className="flex-shrink-0">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-32 h-32 object-cover rounded-lg hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="text-white font-semibold text-lg mb-2 hover:text-yellow-500 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-sm mb-4">{item.material}</p>
                      <p className="text-yellow-500 font-bold text-xl" data-testid={`cart-item-price-${item.id}`}>
                        {isApprox ? `Approx. ${presentment.formatDollars(item.price)}` : `$${Math.round(item.price).toLocaleString("en-US")} USD`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-white hover:text-yellow-500 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-white font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-white hover:text-yellow-500 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800 sticky top-6">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white" data-testid="cart-subtotal">
                      {isApprox ? `Approx. ${presentment.formatDollars(subtotal)}` : `$${Math.round(subtotal).toLocaleString("en-US")} USD`}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className="text-white/70" data-testid="cart-shipping-note">
                      Calculated by destination
                    </span>
                  </div>
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex justify-between text-white text-xl font-bold">
                      <span>Subtotal</span>
                      <span className="text-yellow-500" data-testid="cart-total">
                        {isApprox ? `Approx. ${presentment.formatDollars(total)}` : `$${Math.round(total).toLocaleString("en-US")} USD`}
                      </span>
                    </div>
                    {isApprox && (
                      <p className="text-white/50 text-[11px] mt-2" data-testid="cart-approx-disclaimer">
                        Final local amount confirmed at secure checkout. Canonical: ${Math.round(total).toLocaleString("en-US")} USD.
                      </p>
                    )}
                    <p className="text-white/40 text-xs mt-2">
                      Your full shipping address will be entered securely at checkout.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-6 text-lg transition-all duration-300 hover:scale-105"
                >
                  Proceed to Checkout
                </Button>
                <Link to="/products">
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;