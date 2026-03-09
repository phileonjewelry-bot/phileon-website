import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Bell, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const RestockNotificationModal = ({ 
  isOpen, 
  onClose, 
  productId, 
  productName,
  productImage 
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${BACKEND_URL}/api/restock`, {
        product_id: productId,
        email,
        name: name.trim() || undefined
      });

      setIsSubmitted(true);
      toast({
        title: 'Success!',
        description: `You'll be notified when ${productName} is back in stock.`,
      });

      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setEmail('');
        setName('');
      }, 3000);
      
    } catch (error) {
      console.error('Restock signup error:', error);
      toast({
        title: 'Error',
        description: 'Failed to join restock list. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          {productImage && (
            <img
              src={productImage}
              alt={productName}
              className="w-20 h-20 object-cover rounded-lg mx-auto mb-4"
            />
          )}
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isSubmitted ? 'You\'re All Set!' : 'Join Restock List'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {isSubmitted 
              ? `We'll email you as soon as ${productName} is back in stock!`
              : `Get notified when ${productName} becomes available again.`
            }
          </p>
        </CardHeader>
        
        <CardContent>
          {isSubmitted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-green-600 font-semibold mb-2">Successfully Added!</p>
              <p className="text-gray-600 text-sm">
                Check your email for confirmation.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name (Optional)
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  disabled={isSubmitting || !email}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Joining...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Bell className="w-4 h-4 mr-2" />
                      Notify Me
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Privacy Notice */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-start space-x-2">
              <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-500">
                We'll only email you when this item is back in stock. 
                No spam, and you can unsubscribe anytime.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestockNotificationModal;