import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useCart } from '../contexts/CartContext';
import { usePresentment } from '../context/PresentmentContext';
import PaymentMethodMessaging from '../components/PaymentMethodMessaging';

// /cart renders the SAME authoritative cart as the drawer and checkout
// (CartContext → localStorage "phileon_cart"). Prices are the USD amounts
// locked at Add to Cart (unit_amount_cents) and are never recomputed here.
const Cart = () => {
  const { items, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const presentment = usePresentment();
  const isApprox = presentment.isApproximate;
  const money = (cents) => (isApprox ? `Approx. ${presentment.formatUsdCents(cents)}` : `$${Math.round(cents / 100).toLocaleString('en-US')} USD`);
  const totalCents = items.reduce((sum, item) => sum + item.unit_amount_cents * item.qty, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center" data-testid="cart-empty">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-700 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h2>
          <p className="text-gray-400 mb-8">Add some beautiful jewelry to your cart</p>
          <Link to="/shop">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4" data-testid="cart-shop-now">Shop Now</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const key = `${item.product_id}::${item.variant || ''}`;
              return (
                <Card key={key} className="bg-gray-900 border-gray-800" data-testid={`cart-item-${item.product_id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {item.image && (
                        <Link to={item.slug ? `/products/${item.slug}` : '/shop'} className="flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-32 h-32 object-cover rounded-lg hover:opacity-80 transition-opacity" />
                        </Link>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg mb-2 break-words" data-testid={`cart-item-name-${item.product_id}`}>{item.name}</h3>
                        <p className="text-gray-400 text-sm mb-1 break-words" data-testid={`cart-item-config-${item.product_id}`}>
                          {item.variant || item.materials?.join(' · ') || 'Standard configuration'}
                        </p>
                        <p className="text-gray-500 text-xs mb-3" data-testid={`cart-item-unit-price-${item.product_id}`}>Price locked at {money(item.unit_amount_cents)} each</p>
                        <p className="text-yellow-500 font-bold text-xl" data-testid={`cart-item-price-${item.product_id}`}>{money(item.unit_amount_cents * item.qty)}</p>
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                        <button onClick={() => removeFromCart(item.product_id, item.variant)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Remove item" data-testid={`cart-item-remove-${item.product_id}`}>
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2">
                          <button onClick={() => updateQuantity(item.product_id, item.variant, item.qty - 1)} disabled={item.qty <= 1} className="text-white hover:text-yellow-500 disabled:opacity-40 transition-colors" aria-label="Decrease quantity" data-testid={`cart-item-dec-${item.product_id}`}><Minus className="w-4 h-4" /></button>
                          <span className="text-white font-semibold w-8 text-center" data-testid={`cart-item-qty-${item.product_id}`}>{item.qty}</span>
                          <button onClick={() => updateQuantity(item.product_id, item.variant, item.qty + 1)} className="text-white hover:text-yellow-500 transition-colors" aria-label="Increase quantity" data-testid={`cart-item-inc-${item.product_id}`}><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800 sticky top-6">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-400"><span>Subtotal</span><span className="text-white" data-testid="cart-subtotal">{money(totalCents)}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Shipping</span><span className="text-white/70" data-testid="cart-shipping-note">Calculated by destination</span></div>
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex justify-between text-white text-xl font-bold"><span>Subtotal</span><span className="text-yellow-500" data-testid="cart-total">{money(totalCents)}</span></div>
                    {isApprox && (
                      <p className="text-white/50 text-[11px] mt-2" data-testid="cart-approx-disclaimer">Final local amount confirmed at secure checkout. Canonical: ${Math.round(totalCents / 100).toLocaleString('en-US')} USD.</p>
                    )}
                    <p className="text-white/40 text-xs mt-2">Your full shipping address will be entered securely at checkout.</p>
                    <div className="mt-3" data-testid="cart-financing-messaging"><PaymentMethodMessaging usdDollars={totalCents / 100} /></div>
                  </div>
                </div>
                <Button onClick={() => navigate('/checkout')} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-6 text-lg transition-all duration-300 hover:scale-105" data-testid="cart-proceed-checkout">Proceed to Checkout</Button>
                <Link to="/shop"><Button variant="outline" className="w-full mt-4 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white" data-testid="cart-continue-shopping">Continue Shopping</Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
