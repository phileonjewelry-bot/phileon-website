import React from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

const CartDrawer = ({ isOpen, onClose }) => {
  const { items, updateQty, removeFromCart, clearCart, getCartTotal } = useCart();

  if (!isOpen) return null;

  const handleCheckout = () => {
    // TODO: Integrate with existing Stripe checkout flow
    console.log('Proceeding to checkout with items:', items);
    // This would call your existing checkout logic
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-phileon-black border-l-2 border-phileon-gold/20 z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-phileon-gold/20">
          <h2 className="text-xl font-light text-phileon-ivory flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-phileon-gold" />
            Shopping Cart
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-phileon-ivory hover:text-phileon-gold hover:bg-phileon-gold/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-phileon-gold/30 mx-auto mb-4" />
              <p className="text-phileon-ivory/70">Your cart is empty</p>
              <p className="text-sm text-phileon-ivory/50 mt-2">
                Add some beautiful pieces to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.product_id}-${item.variant || 'default'}`} className="flex gap-4 p-4 bg-phileon-charcoal/30 rounded-lg border border-phileon-gold/10">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-phileon-charcoal rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-phileon-gold/10 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-phileon-gold/50" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-phileon-ivory font-medium text-sm truncate">
                      {item.name}
                    </h3>
                    <p className="text-phileon-ivory/60 text-xs mt-1">
                      {item.price}
                    </p>
                    {item.variant && (
                      <p className="text-phileon-gold text-xs mt-1">
                        {item.variant}
                      </p>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQty(item.product_id, item.qty - 1)}
                        className="w-8 h-8 p-0 border-phileon-gold/30 text-phileon-gold hover:bg-phileon-gold/20"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-phileon-ivory text-sm w-8 text-center">
                        {item.qty}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQty(item.product_id, item.qty + 1)}
                        className="w-8 h-8 p-0 border-phileon-gold/30 text-phileon-gold hover:bg-phileon-gold/20"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.product_id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 self-start"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-phileon-gold/20 bg-phileon-near-black">
            <div className="flex justify-between items-center mb-4">
              <span className="text-phileon-ivory font-light">Total Items:</span>
              <span className="text-phileon-gold font-medium">{getCartTotal()}</span>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleCheckout}
                className="w-full bg-phileon-gold text-phileon-black hover:bg-phileon-gold/90 font-medium tracking-wider"
              >
                PROCEED TO CHECKOUT
              </Button>
              
              <Button
                onClick={clearCart}
                variant="outline"
                className="w-full border-phileon-gold/30 text-phileon-gold hover:bg-phileon-gold/10"
              >
                Clear Cart
              </Button>
            </div>
            
            <p className="text-xs text-phileon-ivory/50 text-center mt-4">
              Secure checkout • Handcrafted to order
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;