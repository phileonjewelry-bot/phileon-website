import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CartDrawer = () => {
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    getTotalItems, 
    getFormattedTotal,
    getCheckoutItems,
    isOpen, 
    setIsOpen 
  } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsCheckingOut(true);
    
    try {
      // Convert cart items to expected format
      const checkoutItems = getCheckoutItems();
      
      const response = await axios.post(`${BACKEND_URL}/api/stripe/create-checkout-session`, {
        items: checkoutItems,
        email: '', // Will be collected in Stripe Checkout
        shippingAddress: {}, // Will be collected in Stripe Checkout
        success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/checkout/cancel`
      });

      // Redirect to Stripe Checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else if (response.data.url) {
        window.location.href = response.data.url;
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Error',
        description: 'Unable to start checkout. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg bg-black border-gray-800">
        <SheetHeader className="pb-6 border-b border-gray-800">
          <SheetTitle className="flex items-center gap-2 text-white">
            <ShoppingBag className="w-5 h-5 text-yellow-500" />
            Your Cart ({getTotalItems()})
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {items.length === 0 ? 'Your cart is empty' : `${items.length} unique item${items.length !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto py-6 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 mb-2">Your cart is empty</p>
                <p className="text-gray-500 text-sm">Add some beautiful pieces to get started</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.product_id}-${JSON.stringify(item.variant)}`} className="flex gap-4 bg-gray-900 rounded-lg p-4">
                  {/* Item Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                  </div>
                  
                  {/* Item Details */}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-sm line-clamp-2">
                      {item.name}
                    </h3>
                    {item.materials && (
                      <p className="text-gray-400 text-xs mt-1 line-clamp-1">
                        {item.materials.join(' · ')}
                      </p>
                    )}
                    {item.variant && (
                      <p className="text-gray-400 text-xs mt-1">
                        {Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(', ')}
                      </p>
                    )}
                    
                    {/* Price and Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => updateQuantity(item.product_id, item.variant, item.qty - 1)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-800"
                          disabled={item.qty <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-white text-sm font-semibold px-2">{item.qty}</span>
                        <Button
                          onClick={() => updateQuantity(item.product_id, item.variant, item.qty + 1)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500 font-semibold text-sm">
                          ${((item.unit_amount_cents * item.qty) / 100).toFixed(2)}
                        </span>
                        <Button
                          onClick={() => removeFromCart(item.product_id, item.variant)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-800 pt-6 space-y-4">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white text-xl font-bold">${getFormattedTotal()}</span>
              </div>
              
              {/* Shipping Note */}
              <p className="text-gray-500 text-xs">
                Shipping and taxes calculated at checkout
              </p>
              
              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 text-lg transition-all duration-300 hover:scale-[1.02]"
              >
                {isCheckingOut ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Secure Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                )}
              </Button>
              
              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs">Secure SSL encrypted checkout</span>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;