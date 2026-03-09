import React from "react";

export default function InventoryBadges({ product }) {
  const inv = Number(product?.inventory_count ?? 0);
  const threshold = Number(product?.low_stock_threshold ?? 3);
  const isBestseller = Boolean(product?.is_bestseller);

  const soldOut = inv <= 0;
  const lowStock = inv > 0 && inv <= threshold;

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
      {isBestseller && (
        <span className="ph-badge ph-badge-gold">BESTSELLER</span>
      )}
      {soldOut && (
        <span className="ph-badge ph-badge-soldout">SOLD OUT</span>
      )}
      {!soldOut && lowStock && (
        <span className="ph-badge ph-badge-lowstock">LOW STOCK · Only {inv} left</span>
      )}
    </div>
  );
}