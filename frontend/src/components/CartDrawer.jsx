import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../contexts/CartContext";

const money = (n) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "CAD" }).format(Number(n || 0));

export default function CartDrawer({ onCheckout }) {
  const { isOpen, closeCart, items, subtotal, updateQty, removeFromCart, clearCart } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(v) => (!v ? closeCart() : null)}>
      <SheetContent side="right" className="w-[380px] sm:w-[420px] bg-black text-white border-white/10">
        <SheetHeader>
          <SheetTitle className="tracking-[0.25em] text-xs text-white/80">CART</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-white/60 text-sm">
              Your cart is empty.
            </div>
          ) : (
            items.map((it) => (
              <div key={it.product_id + JSON.stringify(it.variant)} className="flex gap-3 border border-white/10 rounded-lg p-3">
                <div className="w-14 h-14 rounded-md bg-white/5 overflow-hidden flex items-center justify-center">
                  {it.image ? (
                    <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white/30 text-xs">PHILEON</div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-white/60 mt-0.5">{money(it.price)}</div>

                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-white/15 bg-transparent"
                      onClick={() => updateQty(it.product_id, Math.max(1, it.qty - 1), it.variant)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <div className="text-sm w-8 text-center">{it.qty}</div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-white/15 bg-transparent"
                      onClick={() => updateQty(it.product_id, it.qty + 1, it.variant)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-8 w-8 text-white/70 hover:text-white"
                      onClick={() => removeFromCart(it.product_id, it.variant)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60 tracking-[0.18em] text-xs">SUBTOTAL</span>
            <span className="font-medium">{money(subtotal)}</span>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-white/15 bg-transparent"
              onClick={clearCart}
              disabled={items.length === 0}
            >
              Clear
            </Button>
            <Button
              className="flex-1 bg-[#CDA553] text-black hover:bg-[#d7b064]"
              onClick={onCheckout}
              disabled={items.length === 0}
            >
              Checkout
            </Button>
          </div>

          <div className="mt-3 text-[11px] text-white/50 leading-relaxed">
            Stripe checkout will open in a new tab or redirect, depending on your integration.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}