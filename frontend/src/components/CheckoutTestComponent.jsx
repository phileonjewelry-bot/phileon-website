import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CheckoutTestComponent = () => {
  const [isTestingCheckout, setIsTestingCheckout] = useState(false);
  const { items, getCheckoutItems } = useCart();
  const { toast } = useToast();

  const testInventoryValidation = async () => {
    if (items.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Add some items to cart first to test checkout validation.',
        variant: 'destructive'
      });
      return;
    }

    setIsTestingCheckout(true);

    try {
      const checkoutItems = getCheckoutItems();
      
      // Make test call to checkout session (this will trigger inventory validation)
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: checkoutItems,
          email: 'test@example.com',
          shippingAddress: {},
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout/cancel`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle inventory validation errors
        if (data.detail?.code === 'OUT_OF_STOCK') {
          const messages = data.detail.messages || [];
          toast({
            title: '❌ Inventory Validation Failed',
            description: `Found ${messages.length} issue(s):\\n${messages.join('\\n')}`,
            variant: 'destructive'
          });
          console.log('Inventory errors:', messages);
        } else {
          throw new Error(data.detail || 'Checkout failed');
        }
      } else {
        // Success - inventory validation passed
        toast({
          title: '✅ Inventory Validation Passed',
          description: 'All items are in stock and available for checkout. Stripe session created successfully.',
        });
        console.log('Checkout session created:', data);
      }

    } catch (error) {
      console.error('Checkout test error:', error);
      toast({
        title: 'Test Error',
        description: error.message || 'Failed to test checkout validation',
        variant: 'destructive'
      });
    } finally {
      setIsTestingCheckout(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-yellow-500" />
          Checkout Inventory Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-gray-300 text-sm">
          <p className="mb-2">Test the inventory validation system:</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-gray-400">
            <li>Add items to cart</li>
            <li>Click test button to validate inventory</li>
            <li>See if items are in stock before checkout</li>
            <li>Check console for detailed error messages</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded p-3 text-sm">
          <div className="flex justify-between text-gray-400 mb-2">
            <span>Items in Cart:</span>
            <span className="text-white font-semibold">{items.length}</span>
          </div>
          {items.length > 0 && (
            <div className="space-y-1">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-gray-300 truncate">{item.name}</span>
                  <span className="text-yellow-500">x{item.qty}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={testInventoryValidation}
          disabled={isTestingCheckout || items.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isTestingCheckout ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Testing Validation...
            </div>
          ) : (
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Test Inventory Validation
            </div>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span>In Stock: Validation passes, checkout proceeds</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span>Out of Stock: Validation fails with error details</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckoutTestComponent;