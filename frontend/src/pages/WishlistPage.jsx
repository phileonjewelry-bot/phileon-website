import React, { useEffect, useMemo, useState } from "react";
import { useWishlist } from "../contexts/WishlistContext";
import { Link } from "react-router-dom";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState([]);

  // NOTE: Replace this fetch with your actual products endpoint if different.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products`);
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data?.items || []);
      } catch {
        setProducts([]);
      }
    })();
  }, []);

  const wished = useMemo(() => {
    const map = new Map(products.map((p) => [String(p.id || p._id), p]));
    return ids.map((id) => map.get(String(id))).filter(Boolean);
  }, [ids, products]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <h1 className="tracking-[0.25em] text-sm text-white/80">WISHLIST</h1>

      {wished.length === 0 ? (
        <div className="mt-6 text-white/60 text-sm">
          No saved pieces yet.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wished.map((p) => (
            <Link
              key={String(p.id || p._id)}
              to={`/piece/${p.slug}`}
              className="block border border-white/10 rounded-xl p-3 hover:border-white/25 bg-white/[0.03]"
            >
              <div className="aspect-square rounded-lg bg-white/5 overflow-hidden">
                {p.image || p.thumbnail || p.images?.[0] ? (
                  <img
                    src={p.image || p.thumbnail || p.images?.[0]}
                    alt={p.name || p.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>
              <div className="mt-3 text-sm">{p.name || p.title}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}