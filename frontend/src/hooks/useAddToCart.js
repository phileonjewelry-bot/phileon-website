import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

/**
 * Custom hook for Add to Cart micro-interaction
 * Provides button state, animation, toast notification, and cart drawer opening
 */
export function useAddToCart() {
  const { addToCart, setIsOpen } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = useCallback(async (product, quantity = 1, variant = null) => {
    // Prevent double-clicking
    if (isAdding) return;
    
    setIsAdding(true);

    // Add to cart
    addToCart(product, quantity, variant);

    // Show toast notification
    const productName = product.name || 'Item';
    toast.success(`✓ ${productName} added to your cart`, {
      duration: 3000,
    });

    // Wait for button animation (~1 second)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reset button state
    setIsAdding(false);

    // Open cart drawer
    setIsOpen(true);
  }, [addToCart, setIsOpen, isAdding]);

  return {
    isAdding,
    handleAddToCart,
    buttonText: isAdding ? '✓ Added' : 'ADD TO CART',
    buttonClass: isAdding 
      ? 'bg-green-600 hover:bg-green-600 scale-[1.02] transition-all duration-300' 
      : 'bg-[#C6A24A] hover:bg-[#B8944A] transition-all duration-300',
  };
}

export default useAddToCart;
