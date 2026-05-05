import React from "react";

/**
 * ProductLayout Component
 * 
 * Luxury brand product layout with:
 * - Large gallery viewer (60-70% width) on left
 * - Product info panel (30-40% width) on right
 * - Sticky purchase panel on desktop only
 * - Responsive mobile stacking
 * - PHILEON branding (black bg, gold accents)
 */

export default function ProductLayout({
  gallery,
  productInfo,
  purchasePanel,
  stickyOffset = 100,
}) {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left: Gallery Viewer (60-70%) */}
          <div className="w-full lg:w-[65%] flex-shrink-0">
            {gallery}
          </div>

          {/* Right: Product Info + Purchase Panel (30-40%) */}
          <div className="w-full lg:w-[35%] flex-shrink-0">
            <div
              className="lg:sticky space-y-8"
              style={{ top: `${stickyOffset}px` }}
              data-testid="product-info-panel"
            >
              {/* Product Information */}
              {productInfo && (
                <div className="space-y-6">
                  {productInfo}
                </div>
              )}

              {/* Purchase Panel */}
              {purchasePanel && (
                <div className="border-t border-white/10 pt-8">
                  {purchasePanel}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProductInfoSection Component
 * 
 * Reusable section wrapper for product info blocks
 */
export function ProductInfoSection({ title, titleTag, children, className = "" }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {titleTag && (
        <p className="text-[#C6A24A] text-xs tracking-[0.45em] uppercase">
          {titleTag}
        </p>
      )}
      {title && (
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-light tracking-wide">
          {title}
        </h2>
      )}
      <div className="space-y-4 text-white/70 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

/**
 * ProductSpecs Component
 * 
 * Display product specifications in a grid
 */
export function ProductSpecs({ specs = [] }) {
  if (!specs || specs.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
      {specs.map((spec, index) => (
        <div key={index} className="space-y-1">
          <p className="text-white/50 text-xs tracking-[0.35em] uppercase">
            {spec.label}
          </p>
          <p className="text-white text-sm md:text-base font-light">
            {spec.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * ProductPrice Component
 * 
 * Display product pricing with PHILEON luxury styling
 */
export function ProductPrice({
  price,
  currency = 'USD',
  label = "Price",
  highlight = false,
  note = null,
}) {
  return (
    <div
      className={[
        "rounded-xl border p-6 transition-all",
        highlight
          ? "border-[#C6A24A]/70 bg-[#C6A24A]/10"
          : "border-white/10 bg-white/5",
      ].join(" ")}
    >
      <p className="text-white/50 text-xs tracking-[0.35em] uppercase mb-3">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl md:text-4xl font-light text-white">
          ${typeof price === "number" ? price.toLocaleString() : price}
        </p>
        <p className="text-white/50 text-sm">{currency}</p>
      </div>
      {note && (
        <p className="mt-3 text-white/60 text-sm leading-relaxed">{note}</p>
      )}
    </div>
  );
}

/**
 * ProductActions Component
 * 
 * CTA buttons for product actions
 */
export function ProductActions({ primaryAction, secondaryAction }) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {primaryAction && (
        <a
          href={primaryAction.href}
          className="bg-[#C6A24A] text-black px-8 py-4 rounded-md font-semibold tracking-wide text-center hover:bg-[#D4B05E] transition-colors"
          data-testid="product-primary-action"
        >
          {primaryAction.label}
        </a>
      )}
      {secondaryAction && (
        <a
          href={secondaryAction.href}
          className="border border-white/30 text-white px-8 py-4 rounded-md font-semibold tracking-wide text-center hover:bg-white/5 transition-colors"
          data-testid="product-secondary-action"
        >
          {secondaryAction.label}
        </a>
      )}
    </div>
  );
}
