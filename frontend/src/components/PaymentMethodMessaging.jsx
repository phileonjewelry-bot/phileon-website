import React, { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

/**
 * PHILEON — Stripe Payment Method Messaging Element (Klarna / Affirm).
 *
 * Stripe-managed pre-checkout financing discovery. Messaging appears ONLY
 * when the customer / amount / currency / country is eligible AND the
 * PHILEON Stripe account has the corresponding payment method enabled.
 *
 * We never fabricate "$X per month" text. We never imply approval. Stripe
 * renders and hides the message on its own.
 *
 * Notes:
 *   • Requires `REACT_APP_STRIPE_PUBLISHABLE_KEY` in `frontend/.env`.
 *     If missing, the component renders nothing (no error). This lets us
 *     ship the code and turn on messaging when the owner adds the key.
 *   • Currency here is the CANONICAL catalog currency (USD). The messaging
 *     element accepts a USD amount + country and delegates eligibility to
 *     Stripe. Canadian CAD financing messaging cannot be shown from the
 *     USD canonical amount without a trusted USD→CAD rate — see the
 *     blocker note in /app/memory/PRD.md.
 *   • Uses Stripe.js Elements — no server call, no email, no order effect.
 *
 * Props:
 *   usdDollars       canonical USD dollar amount (integer or float, e.g. 17000)
 *   cadDollars       optional TRUSTED CAD dollar amount from the server-side
 *                    BNPL FX service. When present, messaging renders in CAD
 *                    for CA country. NEVER derived client-side from a rate;
 *                    NEVER trusts a browser-computed FX.
 *   country          ISO 3166-1 alpha-2 country (default "US")
 *   paymentMethods   default ["klarna", "affirm"]
 *   testId           optional data-testid on the wrapper
 */
const PUBLISHABLE_KEY = (process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "").trim();

let _stripePromise = null;
function getStripe() {
  if (!PUBLISHABLE_KEY) return null;
  if (!_stripePromise) _stripePromise = loadStripe(PUBLISHABLE_KEY);
  return _stripePromise;
}

export default function PaymentMethodMessaging({
  usdDollars,
  cadDollars = null,
  country = "US",
  paymentMethods = ["klarna", "affirm"],
  testId = "payment-method-messaging",
}) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Prefer trusted CAD only when both a CAD amount AND CA country are set.
  const useCad = Number.isFinite(Number(cadDollars))
                 && Number(cadDollars) > 0
                 && (country || "").toUpperCase() === "CA";
  const dollars = useCad ? Number(cadDollars) : Number(usdDollars);
  const currency = useCad ? "cad" : "usd";
  const effectiveCountry = useCad ? "CA" : country;

  useEffect(() => {
    if (!PUBLISHABLE_KEY) return;
    if (!containerRef.current) return;
    if (!Number.isFinite(dollars) || dollars <= 0) return;

    let cancelled = false;
    let elements = null;
    let messagingElement = null;

    (async () => {
      try {
        const stripe = await getStripe();
        if (!stripe || cancelled) return;
        elements = stripe.elements({
          mode: "payment",
          amount: Math.round(dollars * 100),
          currency,
          paymentMethodTypes: paymentMethods,
        });
        messagingElement = elements.create("paymentMethodMessaging", {
          amount: Math.round(dollars * 100),
          currency: currency.toUpperCase(),
          paymentMethodTypes: paymentMethods,
          countryCode: effectiveCountry,
        });
        if (cancelled) return;
        messagingElement.mount(containerRef.current);
        setReady(true);
      } catch (e) {
        // Silent — Stripe hides the message when ineligible; do not surface.
      }
    })();

    return () => {
      cancelled = true;
      try { if (messagingElement) messagingElement.destroy(); } catch (_e) { /* ignore */ }
    };
  }, [dollars, currency, effectiveCountry, paymentMethods]);

  // No key or no amount → render nothing (never leaks fabricated copy).
  if (!PUBLISHABLE_KEY) return null;

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      data-ready={ready ? "1" : "0"}
      className="phi-payment-method-messaging"
      style={{ minHeight: ready ? undefined : 0 }}
    />
  );
}
