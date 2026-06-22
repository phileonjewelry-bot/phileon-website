import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, Filter, Eye, EyeOff } from 'lucide-react';
import { publicApi } from '../lib/api';
import { useWishlist } from '@/contexts/WishlistContext';
import StockBadge from '@/components/StockBadge';
import { Button } from '@/components/ui/button';
import { products } from '@/data/products';
import { LiveFromPrice } from '@/components/LiveFromPrice';
import BapeShopCard from '@/components/shop/BapeShopCard';
import '../styles/shop-drop.css';

// Helper to format price from products.js basePrice
const formatPrice = (basePrice, currency = 'USD') => {
  return `From $${basePrice.toLocaleString()}${currency !== 'USD' ? ` ${currency}` : ''}`;
};

// SHOP COLLECTION ASSIGNMENT
// Maps each product slug to one of: 'sacred' | 'signature' | 'editorial' | 'collective'
// Used by the top-of-page chip filter and the grouped section layout.
// Pieces tagged audience='collective' (multi-audience cross-cut) primarily live in COLLECTIVE.
const SHOP_COLLECTION_MAP = {
  // SIGNATURE — gentlemen's flagship pieces
  'the-don-gorgon': 'signature',
  'the-carapace': 'signature',

  // SACRED — scripture/faith driven
  'galatians-614': 'sacred',
  'corinthians-15-14': 'sacred',
  // SIGNATURE — flagship craft / heirloom / single-audience couture
  'la-marva': 'signature',
  'annie-rose': 'signature',
  'lady-bamburgh': 'signature',
  'cypher': 'signature',
  'morso': 'signature',
  'labete': 'signature',
  'tola-ii': 'signature',
  'prise-de-couronne': 'signature',

  // EDITORIAL — sculptural / object-driven / fashion-forward
  'rosaria': 'editorial',
  'desir-corset': 'editorial',
  'apex': 'editorial',
  'homage': 'editorial',
  'trace': 'editorial',
  'monika-couture': 'editorial',
  'alejandra-heels': 'editorial',
  'fondo-curvo': 'editorial',
  'bound': 'editorial',
  'forme-cuff': 'editorial',
  'ptp-cuff': 'editorial',
  'rhythm-mesh-ring': 'editorial',
  'le-cocktail-de-jessica': 'editorial',
  'nervatura': 'editorial',
  'midweek': 'editorial',
  'la-madonna': 'editorial',
  'la-scarpa-della-regina': 'editorial',
  'lisa': 'signature',
  'lady-jay': 'editorial',

  // COLLECTIVE — multi-audience pieces (his + hers + collective)
  'coogi-i': 'collective',
  'blessed': 'collective',
  'the-bamburgh': 'collective',
  'bamburgh': 'collective',
  'drape': 'collective',
  'bape': 'collective',
  'the-true-vine': 'collective',
  'porta-aurea': 'collective',
  'coogi-dna-tag': 'collective',
  'battenti-della-villa': 'collective',
  'gent': 'collective',
  'stackrats': 'collective',
  'wynette-palette': 'collective',
  'veyron-noir': 'collective',
  'rose-of-sharon': 'collective',
  'boss-knot': 'collective',
};

const SHOP_COLLECTIONS = [
  { key: 'sacred',     label: 'Sacred Collection' },
  { key: 'signature',  label: 'Signature' },
  { key: 'editorial',  label: 'Editorial' },
  { key: 'collective', label: 'Collective' },
];

// Core collection products - Always shown first
// Each product has category (rings, earrings, pendants, bracelets) and audience (ladies, gentlemens-club, collective)
const CORE_PRODUCTS = [
  {
    id: 'rose-of-sharon',
    name: 'ROSE OF SHARON',
    slug: 'rose-of-sharon',
    materialLine: 'Floral Cross Pendant · 10K & 14K Rose Gold',
    imageUrl: '/rose-of-sharon/hero.png',
    href: '/products/rose-of-sharon',
    price_range: 'From $2,800 USD',
    inventory_count: 1,
    is_core: true,
    is_new_arrival: true,
    is_featured: true,
    category: 'pendants',
    audience: 'ladies',
  },
  {
    id: 'boss-knot',
    name: 'BOSS KNOT',
    slug: 'boss-knot',
    materialLine: 'Executive Pendant · 18" Chain Included',
    imageUrl: '/boss-knot/hero.jpg',
    href: '/products/boss-knot',
    price_range: 'From $3,200 USD',
    inventory_count: 1,
    is_core: true,
    is_new_arrival: true,
    is_featured: true,
    category: 'pendants',
    audience: 'gentlemens-club',
  },
  {
    id: 'uncle-jo',
    name: 'UNCLE JO',
    slug: 'uncle-jo',
    materialLine: 'Signature Mesh Collection',
    imageUrl: '/uncle-jo/hero.jpg',
    href: '/products/uncle-jo',
    price_range: 'From $1,100 USD',
    inventory_count: 1,
    is_core: true,
    is_new_arrival: true,
    is_featured: true,
    category: 'rings',
    audience: 'gentlemens-club',
  },
  {
    id: 'veyron-noir',
    name: 'VEYRON NOIR',
    slug: 'veyron-noir',
    materialLine: 'Tribute Series · 4 Metal Tiers',
    imageUrl: '/veyron-noir/hero.png',
    href: '/products/veyron-noir',
    price_range: 'From $1,450 USD',
    inventory_count: 1,
    is_core: true,
    category: 'rings',
    audience: 'gentlemens-club',
  },
  {
    id: 'wynette-palette',
    name: "WYNETTE'S PALETTE",
    slug: 'wynette-palette',
    materialLine: 'Collector Cocktail Ring',
    imageUrl: '/wynette/shop-card.png',
    href: '/products/wynette-palette',
    price_range: 'From $2,000 USD',
    inventory_count: 1,
    is_core: true,
    category: 'rings',
    audience: 'ladies',
  },
  {
    id: 'la-marva',
    name: 'La Marva',
    slug: 'la-marva',
    materialLine: 'Signature Ring · Dynamic Pricing',
    imageUrl: 'https://customer-assets.emergentagent.com/job_phileon-website/artifacts/m7k7yxis_1000138213.jpg',
    href: '/products/la-marva',
    price_range: formatPrice(products.laMarva.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: 'ladies',
  },
  {
    id: 'annie-rose',
    name: 'Annie Rose',
    slug: 'annie-rose',
    materialLine: 'Lab & Natural Diamonds · 10K-18K Gold',
    imageUrl: 'https://customer-assets.emergentagent.com/job_phileon-website/artifacts/vg64rc4i_1000139387.jpg',
    href: '/products/annie-rose',
    price_range: formatPrice(products.annieRose.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: 'ladies',
  },
  {
    id: 'monika-couture',
    name: 'Monika Couture Earrings',
    slug: 'monika-couture',
    materialLine: 'Statement Earrings · Silver & Gold Options',
    imageUrl: 'https://customer-assets.emergentagent.com/job_phileon-website/artifacts/xkfi3q1b_1000139956.jpg',
    href: '/products/monika-couture',
    price_range: formatPrice(products.monikaCouture.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: 'ladies',
  },
  {
    id: 'alejandra-heels',
    name: 'Alejandra Heels Earrings',
    slug: 'alejandra-heels',
    materialLine: 'Statement Earrings · Silver & Solid Gold',
    imageUrl: 'https://customer-assets.emergentagent.com/job_luxury-rings-heels/artifacts/0y3jefc5_1000140400.jpg',
    href: '/products/alejandra-heels',
    price_range: formatPrice(products.alejandraHeels.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: 'ladies',
  },
  {
    id: 'ptp-cuff',
    name: 'PTP Cuff',
    slug: 'ptp-cuff',
    materialLine: 'Cuff Bracelet · Vermeil to 14K Gold',
    imageUrl: 'https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/n1f04383_1000140851.jpg',
    href: '/products/ptp-cuff',
    price_range: formatPrice(products.ptpCuff.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'bracelets',
    audience: 'gentlemens-club',
  },
  {
    id: 'rosaria',
    name: 'Rosaria Earrings',
    slug: 'rosaria',
    materialLine: products.rosaria.shopMaterialLine,
    imageUrl: 'https://customer-assets.emergentagent.com/job_7b5a73db-350e-4cc1-ae7d-84976cd8fcfe/artifacts/d15gu165_VideoCapture_20260312-012448.jpg',
    href: '/products/rosaria',
    price_range: formatPrice(products.rosaria.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: 'ladies',
  },
  {
    id: 'desir-corset',
    name: 'Désir Corset Pendant',
    slug: 'desir-corset',
    materialLine: products.desirCorset.shopMaterialLine,
    imageUrl: 'https://customer-assets.emergentagent.com/job_10f60fcd-389e-4787-8e2a-17abd2536e3c/artifacts/sxr71rsz_1000141578.jpg',
    href: '/products/desir-corset',
    price_range: formatPrice(products.desirCorset.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'pendants',
    audience: 'ladies',
  },
  {
    id: 'forme-cuff',
    name: 'Forme Cuff',
    slug: 'forme-cuff',
    materialLine: 'Cuff Bracelet · 10K Gold & Plated Silver',
    imageUrl: 'https://customer-assets.emergentagent.com/job_cce20d39-4135-43eb-82e5-c299fc05cf79/artifacts/k7kbqg47_1000142846.png',
    href: '/products/forme-cuff',
    price_range: formatPrice(products.formeCuff.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'bracelets',
    audience: 'ladies',
  },
  {
    id: 'rhythm-mesh-ring',
    name: 'Rhythm Mesh™ Ring',
    slug: 'rhythm-mesh-ring',
    materialLine: products.rhythmMeshRing.shopMaterialLine,
    imageUrl: 'https://customer-assets.emergentagent.com/job_b18523eb-3184-4ba4-8ef3-cdebf4fafd5f/artifacts/nl2vulxg_1000143088.jpg',
    href: '/products/rhythm-mesh-ring',
    price_range: formatPrice(products.rhythmMeshRing.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: 'unisex',
    // Audience-specific card images
    audienceImages: {
      ladies: 'https://customer-assets.emergentagent.com/job_b18523eb-3184-4ba4-8ef3-cdebf4fafd5f/artifacts/skzja828_1000143123.png',
      gentlemensClub: 'https://customer-assets.emergentagent.com/job_b18523eb-3184-4ba4-8ef3-cdebf4fafd5f/artifacts/dptf24st_1000143315.png',
    },
  },
  {
    id: 'tola-ii',
    name: 'TOLA II',
    slug: 'tola-ii',
    materialLine: products.tolaII.shopMaterialLine,
    imageUrl: 'https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/rst0mhem_1000143383.png',
    href: '/products/tola-ii',
    price_range: formatPrice(products.tolaII.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: 'gentlemens-club',
  },
  {
    id: 'galatians-614',
    name: 'GALATIANS 6:14',
    slug: 'galatians-614',
    materialLine: products.galatians614.shopMaterialLine,
    imageUrl: 'https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/tf1ne9cg_1000143695.jpg',
    href: '/products/galatians-614',
    price_range: formatPrice(products.galatians614.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'pendants',
    audience: 'gentlemens-club',
  },
  {
    id: 'trace',
    name: 'TRACE',
    slug: 'trace',
    materialLine: products.trace.shopMaterialLine,
    imageUrl: 'https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/7tyc41kp_1000143768.png',
    href: '/products/trace',
    price_range: formatPrice(products.trace.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: 'ladies',
  },
  {
    id: 'bound',
    name: 'BOUND',
    slug: 'bound',
    materialLine: products.bound.shopMaterialLine,
    imageUrl: 'https://customer-assets.emergentagent.com/job_a9b887c5-7209-4e2a-b5af-4d14326b755d/artifacts/dxi7r360_1000143892.png',
    href: '/products/bound',
    price_range: formatPrice(products.bound.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'bracelets',
    audience: 'ladies',
  },
  {
    id: 'apex',
    name: 'APEX',
    slug: 'apex',
    materialLine: products.apex.shopMaterialLine,
    imageUrl: products.apex.imageUrl,
    href: '/products/apex',
    price_range: formatPrice(products.apex.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: 'ladies',
  },
  {
    id: 'homage',
    name: 'HOMAGE',
    slug: 'homage',
    materialLine: 'Fan Earrings · Silver to 18K Gold',
    imageUrl: products.homage.imageUrl,
    href: '/products/homage',
    price_range: products.homage.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: 'ladies',
  },
  {
    id: 'cypher',
    name: 'CYPHER',
    slug: 'cypher',
    materialLine: 'Drama on your finger.',
    imageUrl: products.cypher.gallery[2].src, // Clean white front-facing shot
    hoverImage: products.cypher.gallery[1].src, // Black angle
    href: '/products/cypher',
    price_range: products.cypher.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: 'gentlemens-club',
    featured: true,
  },
  {
    id: 'morso',
    name: 'IL MORSO DEL RE',
    slug: 'morso',
    materialLine: 'The Bite of the King.',
    imageUrl: products.morso.gallery[2].src, // Front black
    hoverImage: products.morso.gallery[1].src, // Angled warm
    href: '/products/morso',
    price_range: products.morso.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: 'gentlemens-club',
    featured: true,
  },
  {
    id: 'labete',
    name: 'TRIBUTE: LA BÊTE',
    slug: 'labete',
    materialLine: 'Born in the showroom.',
    imageUrl: products.labete.imageUrl, // Showroom image (hook/world-building)
    hoverImage: products.labete.gallery[1].src, // Clean front shot on hover
    href: '/products/labete',
    price_range: products.labete.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: 'gentlemens-club',
    featured: true,
  },
  {
    id: 'blessed',
    name: 'BLESSED',
    slug: 'blessed',
    materialLine: 'Word Made Metal.',
    imageUrl: products.blessed.imageUrl,
    hoverImage: products.blessed.gallery[1].src, // Angle shot on hover
    href: '/products/blessed',
    price_range: products.blessed.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: ['gentlemens-club', 'ladies', 'collective'], // Multi-category
    featured: true,
  },
  {
    id: 'coogi-i',
    name: 'COOGI I',
    slug: 'coogi-i',
    materialLine: 'Chaos, disciplined.',
    imageUrl: products.coogiI.imageUrl,
    hoverImage: products.coogiI.gallery[1]?.src,
    href: '/products/coogi-i',
    price_range: products.coogiI.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: ['gentlemens-club', 'ladies', 'collective'],
    featured: true,
  },
  {
    id: 'fondo-curvo',
    name: 'Fondo Curvo',
    slug: 'fondo-curvo',
    materialLine: products.fondoCurvo.shopMaterialLine,
    imageUrl: products.fondoCurvo.imageUrl,
    href: '/products/fondo-curvo',
    price_range: formatPrice(products.fondoCurvo.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: 'ladies',
  },
  {
    id: 'corinthians-15-14',
    name: '1 Corinthians 15:14',
    slug: 'corinthians-15-14',
    materialLine: products.corinthians1514.shopMaterialLine,
    imageUrl: products.corinthians1514.imageUrl,
    href: '/products/corinthians-15-14',
    price_range: formatPrice(products.corinthians1514.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: 'ladies',
  },
  {
    id: 'drape',
    name: 'DRAPE',
    slug: 'drape',
    materialLine: products.drape.shopMaterialLine,
    imageUrl: products.drape.imageUrl,
    hoverImage: products.drape.onBodyImage,
    href: '/products/drape',
    price_range: formatPrice(products.drape.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'pendants',
    audience: ['ladies', 'collective'],
    isNew: true,
    isFeatured: true,
    displayOrder: 1,
  },
  {
    id: 'le-cocktail-de-jessica',
    name: 'Le Cocktail de Jessica',
    slug: 'le-cocktail-de-jessica',
    materialLine: products.cocktailJessica.shopMaterialLine,
    imageUrl: products.cocktailJessica.imageUrl,
    hoverImage: products.cocktailJessica.hoverImage,
    href: '/products/le-cocktail-de-jessica',
    price_range: products.cocktailJessica.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: ['ladies', 'collective'],
    isNew: true,
    isFeatured: true,
    displayOrder: 2,
  },
  {
    id: 'prise-de-couronne',
    name: 'Prise de Couronne',
    slug: 'prise-de-couronne',
    materialLine: products.priseDeCouronne.shopMaterialLine,
    imageUrl: products.priseDeCouronne.imageUrl,
    href: '/products/prise-de-couronne',
    price_range: formatPrice(products.priseDeCouronne.basePrice, 'USD'),
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: ['gentlemens-club', 'collective'],
    isNew: true,
    isFeatured: true,
    displayOrder: 3,
  },
  {
    id: 'nervatura',
    name: 'The Phileon Nervatura',
    slug: 'nervatura',
    materialLine: products.nervatura.shopMaterialLine,
    imageUrl: products.nervatura.imageUrl,
    href: '/products/nervatura',
    price_range: products.nervatura.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: ['ladies', 'collective'],
    isNew: true,
    isFeatured: true,
    displayOrder: 4,
  },
  {
    id: 'the-don-gorgon',
    name: 'The Don Gorgon',
    slug: 'the-don-gorgon',
    materialLine: products.theDonGorgon.shopMaterialLine,
    imageUrl: products.theDonGorgon.imageUrl,
    href: '/products/the-don-gorgon',
    price_range: products.theDonGorgon.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: ['gentlemens-club', 'collective'],
    isNew: true,
    isFeatured: true,
    displayOrder: 5,
  },
  {
    id: 'the-grand-dame',
    name: 'The Grand Dame Cuff',
    slug: 'the-grand-dame',
    materialLine: products.theGrandDame.shopMaterialLine,
    imageUrl: products.theGrandDame.imageUrl,
    href: '/products/the-grand-dame',
    price_range: products.theGrandDame.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'bracelets',
    audience: ['ladies'],
    isNew: true,
    isFeatured: true,
    displayOrder: 6,
  },
  {
    id: 'the-carapace',
    name: 'The Carapace',
    slug: 'the-carapace',
    materialLine: products.theCarapace.shopMaterialLine,
    imageUrl: products.theCarapace.imageUrl,
    href: '/products/the-carapace',
    price_range: products.theCarapace.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: ['ladies', 'gentlemens-club', 'collective'],
    isNew: true,
    isFeatured: true,
    displayOrder: 7,
  },
  {
    id: 'midweek',
    name: 'MIDWEEK',
    slug: 'midweek',
    materialLine: products.midweek.shopMaterialLine,
    imageUrl: products.midweek.imageUrl,
    href: '/products/midweek',
    price_range: products.midweek.priceFrom,
    inventory_count: 100,
    is_core: true,
    category: 'bracelets',
    audience: ['gentlemens-club', 'collective'],
    isNew: true,
    isFeatured: true,
    displayOrder: 8,
  },
  {
    id: 'la-madonna',
    name: 'LA MADONNA',
    slug: 'la-madonna',
    materialLine: 'Architectural Gold Mesh · Corset Form',
    imageUrl: '/images/la-madonna-hand-category.png',
    href: '/la-madonna',
    price_range: '$28,500 USD',
    inventory_count: 100,
    is_core: true,
    category: 'bracelets',
    audience: ['ladies', 'collective'],
    isNew: true,
    isFeatured: true,
    displayOrder: 2,
  },
  {
    id: 'la-scarpa-della-regina',
    name: 'LA SCARPA DELLA REGINA',
    slug: 'la-scarpa-della-regina',
    materialLine: '18K Rose Gold · Hand-set Diamond Field · Signature Objects',
    imageUrl: '/la-scarpa/scarpa-portrait.jpg',
    href: '/la-scarpa-della-regina',
    price_range: '$9,000 USD',
    inventory_count: 100,
    is_core: true,
    category: 'pendants',
    audience: ['ladies'],
    isNew: true,
    isFeatured: true,
    displayOrder: 2,
  },
  {
    id: 'bape',
    name: 'BAPE™',
    slug: 'bape',
    materialLine: 'Tribute Series · Multi-stone Signet',
    imageUrl: '/homage/bape-ring.webp',
    href: '/homage/bape',
    price_range: 'From $9,500 USD',
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: ['gentlemens-club', 'collective'],
    isNew: true,
    isFeatured: true,
    displayOrder: 3,
    customCard: 'bape',
  },
  {
    id: 'lisa',
    name: 'LISA',
    slug: 'lisa',
    materialLine: 'Natural Emerald · 18K White Gold · Two Scale Expressions',
    imageUrl: '/lisa/lisa-bold-hero.jpg',
    href: '/lisa',
    price_range: 'From CAD $6,800',
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: ['ladies', 'gentlemens-club', 'collective'],
    tags: ['Ladies', 'Gents', 'Collective', 'Emerald', 'Dome Ring'],
    isNew: true,
    isFeatured: true,
    displayOrder: 4,
  },
  {
    id: 'lady-jay',
    name: 'LADY JAY',
    slug: 'lady-jay',
    materialLine: 'Tribute Series · 2026 Season Only · White Gold · Blue Sapphire + White Diamond',
    imageUrl: '/lady-jay/lady-jay-hero.png',
    href: '/lady-jay',
    price_range: 'From $14,500 USD',
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: ['ladies', 'collective'],
    tags: ['Ladies', 'Tribute Series', 'Sapphire', 'Diamond', 'Feather Ring', 'Season Only'],
    isNew: true,
    isFeatured: true,
    displayOrder: 5,
  },
  {
    id: 'the-true-vine',
    name: 'THE TRUE VINE',
    slug: 'the-true-vine',
    materialLine: 'Sacred Objects · Pendant · Open Mesh Arch · Raised Cross · Vine Relief',
    imageUrl: '/the-true-vine/the-true-vine-hero.jpg',
    href: '/the-true-vine',
    price_range: 'From $1,650 USD',
    inventory_count: 100,
    is_core: true,
    category: 'pendants',
    audience: ['gentlemens-club', 'collective'],
    tags: ['Gents', 'Collective', 'Pendant', 'Sacred Objects', 'Yellow Gold', 'Cross'],
    isNew: true,
    isFeatured: true,
    displayOrder: 6,
  },
  {
    id: 'porta-aurea',
    name: 'PORTA AUREA',
    slug: 'porta-aurea',
    materialLine: 'Signet Objects · Yellow Gold · Emerald-Cut Ruby · Greek Key Bezel',
    imageUrl: '/porta-aurea/porta-aurea-hero.jpg',
    href: '/porta-aurea',
    price_range: 'From $5,500 USD',
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: ['gentlemens-club', 'collective'],
    tags: ['Gents', 'Collective', 'Signet', 'Ring', 'Yellow Gold', 'Ruby'],
    isNew: true,
    isFeatured: true,
    displayOrder: 7,
  },
  {
    id: 'coogi-dna-tag',
    name: 'COOGI DNA TAG',
    slug: 'coogi-dna-tag',
    materialLine: 'Tribute Series · Snow & Sand · 10K Gold · Multi-Stone · Diamond Pavé',
    imageUrl: '/coogi-dna/coogi-dna-hero.png',
    href: '/coogi-dna-tag',
    price_range: '$8,500 USD',
    inventory_count: 100,
    is_core: true,
    category: 'pendants',
    audience: ['gentlemens-club', 'collective'],
    tags: ['Gents', 'Collective', 'Pendant', 'Tribute Series', 'COOGI', 'Multi-Stone'],
    isNew: true,
    isFeatured: true,
    displayOrder: 8,
  },
  {
    id: 'battenti-della-villa',
    name: 'BATTENTI DELLA VILLA',
    slug: 'battenti-della-villa',
    materialLine: 'Villa Door Knocker Earrings · Sterling Silver Vermeil → 18K Yellow Gold · Rope Twist · Omega Back',
    imageUrl: 'https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/kzk3m7gb_1000156318.png',
    href: '/battenti-della-villa',
    price_range: 'From $2,800 USD',
    inventory_count: 100,
    is_core: true,
    category: 'earrings',
    audience: ['ladies', 'collective'],
    tags: ['Ladies', 'Collective', 'Earrings', 'Silver', '18K', 'Yellow Gold', 'Italia'],
    isNew: true,
    isFeatured: true,
    displayOrder: 9,
  },
  {
    id: 'gent',
    name: 'GENT',
    slug: 'gent',
    materialLine: 'Architectural Signet Ring · Sterling Silver → 14K Yellow Gold · Woven Lattice · Monumental Typography',
    imageUrl: 'https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/87u8o3vp_1000156494.jpg',
    href: '/gent',
    price_range: 'From $1,850 USD',
    inventory_count: 100,
    is_core: true,
    category: 'rings',
    audience: ['gentlemens-club', 'collective'],
    tags: ['Gents', 'Collective', 'Signet', 'Ring', 'Architectural', 'House Signature', 'Yellow Gold', 'Silver', 'Vermeil'],
    isNew: true,
    isFeatured: true,
    displayOrder: 10,
  },
  {
    id: 'stackrats',
    name: 'STACKRATS',
    slug: 'stackrats',
    materialLine: 'Micro-bead Mesh Bangles · Dinah · Valerie · Dominique · Wide 10mm or Thin 7mm',
    imageUrl: 'https://customer-assets.emergentagent.com/job_0967ced5-e732-403d-b891-6f292f5aebbc/artifacts/dgp6tl9l_1000156925.jpg',
    href: '/stackrats',
    price_range: 'From $1,800 USD',
    inventory_count: 100,
    is_core: true,
    category: 'bracelets',
    audience: ['ladies', 'collective'],
    tags: ['Ladies', 'Collective', 'Bangle', 'Bracelet', 'Mesh', 'Rose Gold', 'White Gold', 'Yellow Gold', 'Stack'],
    isNew: true,
    isFeatured: true,
    displayOrder: 11,
  },
];

// Additional drop products as fallback
const DROP_PRODUCTS = [
  {
    id: '1',
    name: 'Eclipse Ring',
    slug: 'eclipse-ring',
    materialLine: 'Titanium · Black Diamond',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
    href: '/piece/eclipse-ring',
    inventory_count: 0,
  },
  {
    id: '2',
    name: 'Celestial Band',
    slug: 'celestial-band',
    materialLine: 'White Gold · Star Sapphire',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
    href: '/piece/celestial-band',
    inventory_count: 0,
  },
  {
    id: '3',
    name: 'Serpent Coil',
    slug: 'serpent-coil',
    materialLine: '18K Rose Gold · Emerald Eyes',
    imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    href: '/piece/serpent-coil',
    inventory_count: 0,
  },
];

const ShopDropPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [hideSoldOut, setHideSoldOut] = useState(false); // DEFAULT OFF for hype
  const { has, toggle } = useWishlist();

  // Get filter params from URL
  const categoryParam = searchParams.get('category');
  const audienceParam = searchParams.get('audience');
  const collectionParam = searchParams.get('collection'); // 'sacred' | 'signature' | 'editorial' | 'collective' | null = All

  const setCollection = (key) => {
    const next = new URLSearchParams(searchParams);
    if (key) next.set('collection', key);
    else next.delete('collection');
    setSearchParams(next, { replace: true });
    setVisibleProducts([]);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await publicApi.getProducts({ featured: true });
        const apiProducts = response.data || [];
        
        // Always show core products first, then API products (excluding duplicates), then drop products
        const coreIds = CORE_PRODUCTS.map(p => p.id);
        const filteredApiProducts = apiProducts.filter(p => !coreIds.includes(p.id));
        
        const allProducts = [
          ...CORE_PRODUCTS,
          ...filteredApiProducts,
          ...DROP_PRODUCTS,
        ];
        
        setProducts(allProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        // Show core products + drop products as fallback
        setProducts([...CORE_PRODUCTS, ...DROP_PRODUCTS]);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on category, audience, and sold out visibility
  const filteredProducts = products.filter(product => {
    // Filter by sold out
    if (hideSoldOut) {
      const inventoryCount = product.inventory_count || product.stock || 0;
      if (inventoryCount === 0) return false;
    }

    // If category or audience filter is active, only show products that have those fields defined
    const hasFilters = categoryParam || audienceParam;
    
    // Filter by category if specified (supports both string and array)
    if (categoryParam) {
      // Exclude products without a category when filter is active
      if (!product.category) return false;
      // Support array categories (e.g., ["gents", "ladies", "collective"])
      if (Array.isArray(product.category)) {
        if (!product.category.includes(categoryParam)) return false;
      } else {
        if (product.category !== categoryParam) return false;
      }
    }

    // Filter by audience if specified (supports both string and array)
    if (audienceParam) {
      // Exclude products without an audience when filter is active
      if (!product.audience) return false;
      
      // Support array audiences
      if (Array.isArray(product.audience)) {
        if (!product.audience.includes(audienceParam)) return false;
      } else {
        // Allow unisex products to show in both ladies and gentlemens-club collections
        if (product.audience === 'unisex') {
          // Unisex shows in ladies and gentlemens-club, but not in other specific filters
          if (audienceParam !== 'ladies' && audienceParam !== 'gentlemens-club') return false;
        } else if (product.audience !== audienceParam) {
          return false;
        }
      }
    }

    // Filter by shop collection if specified (sacred / signature / editorial / collective)
    if (collectionParam) {
      const productCollection = SHOP_COLLECTION_MAP[product.slug];
      if (productCollection !== collectionParam) return false;
    }

    return true;
  });

  // Group filtered products by their shop collection (used when no specific chip is active)
  const groupedByCollection = SHOP_COLLECTIONS.reduce((acc, { key }) => {
    acc[key] = filteredProducts.filter(p => SHOP_COLLECTION_MAP[p.slug] === key);
    return acc;
  }, {});

  // Determine if grouped sections should render (only on the "All" view with no category/audience filter active)
  const showGroupedSections = !collectionParam && !categoryParam && !audienceParam;

  // Stagger product reveal
  useEffect(() => {
    filteredProducts.forEach((_, index) => {
      setTimeout(() => {
        setVisibleProducts(prev => [...prev, index]);
      }, 150 * index);
    });
  }, [filteredProducts]);

  const soldOutCount = products.filter(product => {
    const inventoryCount = product.inventory_count || product.stock || 0;
    return inventoryCount === 0;
  }).length;

  return (
    <div className="shop-drop" data-testid="shop-drop-page">
      {/* Hero */}
      <section className="shop-drop__hero">
        <div className="shop-drop__hero-inner">
          <span className="shop-drop__hero-badge">EXCLUSIVE ACCESS</span>
          <h1 className="shop-drop__hero-title">SHOP DROP</h1>
          <p className="shop-drop__hero-description">
            Curated pieces available for immediate inquiry. Each creation represents 
            months of development and reflects our commitment to exceptional craftsmanship.
          </p>
          <div className="shop-drop__hero-line" />
        </div>
      </section>

      {/* COLLECTION CHIPS — Sacred / Signature / Editorial / Collective */}
      <section className="mb-6 mt-2" data-testid="shop-collection-chips">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-white text-xl tracking-[0.2em] uppercase font-light">SHOP</h2>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <button
                onClick={() => setCollection(null)}
                data-testid="shop-chip-all"
                className={`px-4 py-2 text-[11px] tracking-[0.25em] uppercase border transition-all ${
                  !collectionParam
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white'
                    : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                }`}
              >
                All
              </button>
              {SHOP_COLLECTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCollection(key)}
                  data-testid={`shop-chip-${key}`}
                  className={`px-4 py-2 text-[11px] tracking-[0.25em] uppercase border transition-all ${
                    collectionParam === key
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white'
                      : 'border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Controls - DROP MODE */}
      <section className="mb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-yellow-500" />
              <span className="text-white font-medium">
                {filteredProducts.length} pieces available
                {soldOutCount > 0 && (
                  <span className="text-gray-400 ml-2">
                    ({soldOutCount} sold out {hideSoldOut ? 'hidden' : 'shown'})
                  </span>
                )}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={hideSoldOut}
                  onChange={(e) => {
                    setHideSoldOut(e.target.checked);
                    setVisibleProducts([]); // Reset animation
                  }}
                  className="w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                />
                {hideSoldOut ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-sm">Hide sold out</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="shop-drop__section">
        {/* Special Editorial Layout for Ladies Bracelets/Cuffs */}
        {categoryParam === 'bracelets' && audienceParam === 'ladies' ? (
          <>
            {/* BOUND - Featured Anchor Product */}
            {filteredProducts.filter(p => p.id === 'bound').map((product) => {
              const productUrl = product.href || `/products/${product.slug}`;
              return (
                <div key={product.id} className="bound-featured-section mb-16">
                  <a 
                    href={productUrl}
                    className="block group"
                    data-testid="featured-bound-card"
                  >
                    <div className="max-w-5xl mx-auto px-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                        {/* Image */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#0a0a0a] rounded-sm">
                          <img 
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-[6s] ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </div>
                        
                        {/* Info */}
                        <div className="text-center lg:text-left py-8 lg:py-0">
                          <p className="text-[#C6A25D]/50 text-[10px] tracking-[0.4em] uppercase mb-4">
                            FEATURED PIECE
                          </p>
                          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white/90 tracking-wide font-light">
                            {product.name}
                          </h2>
                          <p className="text-white/40 text-lg tracking-[0.1em] mt-2">
                            The Bustier Bangle
                          </p>
                          <p className="text-white/30 text-sm mt-4 max-w-md mx-auto lg:mx-0">
                            Form, held in tension. A study in restraint and release — 
                            engineered to move with the body, yet command the eye.
                          </p>
                          <p className="text-[#C6A25D] text-2xl mt-6 tracking-wide">
                            <LiveFromPrice slug={product.slug} fallback={product.price_range} />
                          </p>
                          <div className="mt-8">
                            <span className="inline-block px-8 py-3 border border-white/20 text-white/80 text-sm tracking-[0.2em] uppercase transition-all duration-300 group-hover:border-[#C6A25D]/60 group-hover:shadow-[0_0_20px_rgba(198,162,93,0.15)]">
                              VIEW PIECE
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                  
                  {/* Wishlist button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggle(product.id);
                    }}
                    className="absolute top-6 right-6 z-10 p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors"
                    title={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-5 h-5 ${has(product.id) ? 'fill-current text-red-400' : ''}`} />
                  </button>
                </div>
              );
            })}
            
            {/* Divider */}
            <div className="max-w-4xl mx-auto px-6 mb-12">
              <div className="flex items-center gap-6">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase">
                  MORE BRACELETS & CUFFS
                </span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
            
            {/* Other Products Grid */}
            <div className="shop-drop__grid">
              {filteredProducts.filter(p => p.id !== 'bound').map((product, index) => {
                const inventoryCount = product.inventory_count || product.stock || 0;
                const isSoldOut = inventoryCount === 0;
                const productUrl = product.href || `/products/${product.slug}`;
                
                // Use clean product shot for non-BOUND items
                const cardImage = product.imageUrl;
                
                if (product.customCard === 'bape') {
                  return (
                    <div
                      key={product.id}
                      className={`shop-drop__card-wrapper ${visibleProducts.includes(index) ? 'is-visible' : ''}`}
                      style={{ position: 'relative', transitionDelay: `${index * 80}ms` }}
                    >
                      <BapeShopCard />
                    </div>
                  );
                }

                return (
                  <div 
                    key={product.id}
                    className={`shop-drop__card-wrapper ${visibleProducts.includes(index) ? 'is-visible' : ''}`}
                    style={{ 
                      position: 'relative',
                      transitionDelay: `${index * 80}ms` 
                    }}
                  >
                    {/* Wishlist */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggle(product.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        zIndex: 100,
                        padding: '8px',
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: 'none',
                        borderRadius: '50%',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                      title={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-4 h-4 ${has(product.id) ? 'fill-current text-red-400' : ''}`} />
                    </button>

                    <a 
                      href={productUrl}
                      style={{
                        display: 'block',
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                      }}
                      data-testid={`product-card-${product.slug}`}
                    >
                      <div style={{
                        position: 'relative',
                        aspectRatio: product.category === 'earrings' ? 'auto' : '1/1',
                        minHeight: product.category === 'earrings' ? '300px' : 'auto',
                        maxHeight: product.category === 'earrings' ? '80vh' : 'none',
                        overflow: 'hidden',
                        background: product.category === 'earrings' ? '#fff' : '#0a0a0a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: product.category === 'rings' ? '16px' : '0',
                      }}>
                        <img 
                          src={cardImage} 
                          alt={product.name}
                          loading="lazy"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            filter: isSoldOut ? 'grayscale(1)' : 'none',
                          }}
                          draggable="false"
                        />
                      </div>
                      
                      <div style={{ padding: '12px 0 8px' }}>
                        <h3 className="shop-drop__card-name">{product.name}</h3>
                        <p className="shop-drop__card-material">{product.materials?.join(' · ') || product.materialLine}</p>
                        {product.price_range && (
                          <p className="shop-drop__card-price"><LiveFromPrice slug={product.slug} fallback={product.price_range} /></p>
                        )}
                        {product.slug === 'the-true-vine' && (
                          <p
                            data-testid="vine-card-inscription-badge"
                            style={{
                              fontSize: '10px',
                              letterSpacing: '0.18em',
                              textTransform: 'uppercase',
                              color: 'rgba(201,169,110,0.62)',
                              marginTop: '6px',
                              marginBottom: 0,
                            }}
                          >
                            + Sacred Inscription available
                          </p>
                        )}
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Standard Grid for other categories */
          (() => {
            // Reusable card grid renderer
            const renderGrid = (productList, sectionIdx = 0) => (
              <div className="shop-drop__grid">
                {productList.map((product, index) => {
                  const globalIndex = sectionIdx * 100 + index;
                  const inventoryCount = product.inventory_count || product.stock || 0;
                  const isSoldOut = inventoryCount === 0;
                  const productUrl = product.href || `/products/${product.slug}`;

                  const cardImage =
                    product.audienceImages?.[audienceParam] ||
                    product.audienceImages?.[audienceParam === 'gentlemens-club' ? 'gentlemensClub' : audienceParam] ||
                    product.lifestyleImages?.[audienceParam] ||
                    product.lifestyleImages?.[audienceParam === 'gentlemens-club' ? 'gentlemensClub' : audienceParam] ||
                    product.images?.[0] ||
                    product.imageUrl ||
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80';

                  if (product.customCard === 'bape') {
                    return (
                      <div
                        key={product.id}
                        className={`shop-drop__card-wrapper ${visibleProducts.includes(globalIndex) ? 'is-visible' : ''}`}
                        style={{ position: 'relative', transitionDelay: `${index * 80}ms` }}
                      >
                        <BapeShopCard />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={product.id}
                      className={`shop-drop__card-wrapper ${visibleProducts.includes(globalIndex) ? 'is-visible' : ''}`}
                      style={{ position: 'relative', transitionDelay: `${index * 80}ms` }}
                    >
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
                        style={{
                          position: 'absolute', top: '12px', right: '12px', zIndex: 100,
                          padding: '8px', background: 'rgba(0, 0, 0, 0.4)', border: 'none',
                          borderRadius: '50%', color: 'white', cursor: 'pointer',
                        }}
                        title={has(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart className={`w-4 h-4 ${has(product.id) ? 'fill-current text-red-400' : ''}`} />
                      </button>

                      <a
                        href={productUrl}
                        className="group"
                        style={{ display: 'block', textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
                        data-testid={`product-card-${product.slug}`}
                      >
                        <div style={{
                          position: 'relative',
                          aspectRatio: product.category === 'earrings' ? 'auto' : '1/1',
                          minHeight: product.category === 'earrings' ? '300px' : 'auto',
                          maxHeight: product.category === 'earrings' ? '80vh' : 'none',
                          overflow: 'hidden',
                          background: product.category === 'earrings' ? '#fff' : '#0a0a0a',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: product.category === 'rings' ? '16px' : '0',
                        }}>
                          <img
                            src={cardImage}
                            alt={product.name}
                            loading="lazy"
                            className={`transition-all ease-out ${(product.slug === 'drape' || product.slug === 'le-cocktail-de-jessica') ? 'duration-500 group-hover:scale-[1.04] group-hover:opacity-0' : `duration-300 ${product.hoverImage ? 'group-hover:opacity-0' : ''}`}`}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', filter: isSoldOut ? 'grayscale(1)' : 'none' }}
                            draggable="false"
                          />
                          {product.hoverImage && (
                            <img
                              src={product.hoverImage}
                              alt={`${product.name} alternate view`}
                              loading="lazy"
                              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-all ease-out ${(product.slug === 'drape' || product.slug === 'le-cocktail-de-jessica') ? 'duration-500 group-hover:scale-[1.04]' : 'duration-300'}`}
                              style={{
                                width: '100%', height: '100%', objectFit: 'contain',
                                filter: isSoldOut ? 'grayscale(1)' : 'none',
                                padding: product.category === 'rings' ? '16px' : '0',
                              }}
                              draggable="false"
                            />
                          )}

                          {/* DRAPE — "SEE IT WORN" hover overlay */}
                          {product.slug === 'drape' && (
                            <div
                              className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                              style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent)',
                                padding: '12px 16px 14px',
                              }}
                            >
                              <p className="text-white text-[10px] tracking-[0.3em] text-center uppercase">
                                See it worn
                              </p>
                            </div>
                          )}

                          {/* LE COCKTAIL DE JESSICA — "EXPRESSION IN MOTION" hover overlay */}
                          {product.slug === 'le-cocktail-de-jessica' && (
                            <div
                              className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                              style={{
                                background: 'linear-gradient(to top, rgba(0,0,0,0.60), transparent)',
                                padding: '12px 16px 14px',
                              }}
                            >
                              <p className="text-white text-[10px] tracking-[0.3em] text-center uppercase">
                                Expression in motion
                              </p>
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '12px 0 8px' }}>
                          <h3 className="shop-drop__card-name">{product.name}</h3>
                          <p className="shop-drop__card-material">{product.materials?.join(' · ') || product.materialLine}</p>
                          {product.price_range && (
                            <p className="shop-drop__card-price">{product.price_range}</p>
                          )}
                          {product.slug === 'the-true-vine' && (
                            <p
                              data-testid="vine-card-inscription-badge"
                              style={{
                                fontSize: '10px',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: 'rgba(201,169,110,0.62)',
                                marginTop: '6px',
                                marginBottom: 0,
                              }}
                            >
                              + Sacred Inscription available
                            </p>
                          )}
                        </div>
                      </a>
                    </div>
                  );
                })}
              </div>
            );

            // GROUPED LAYOUT — only when "All" chip + no other filter active
            if (showGroupedSections) {
              return (
                <div className="space-y-16">
                  {SHOP_COLLECTIONS.map(({ key, label }, sectionIdx) => {
                    const items = groupedByCollection[key] || [];
                    if (items.length === 0) return null;
                    return (
                      <div key={key} data-testid={`shop-section-${key}`}>
                        <div className="max-w-7xl mx-auto px-6 mb-6">
                          <h2 className="text-white text-lg tracking-[0.35em] uppercase font-light">
                            {label}
                          </h2>
                          <div className="w-12 h-px bg-[#D4AF37]/30 mt-3" />
                        </div>
                        {renderGrid(items, sectionIdx)}
                      </div>
                    );
                  })}
                </div>
              );
            }

            // SINGLE GRID — chip selected, or category/audience filter active
            return renderGrid(filteredProducts);
          })()
        )}
      </section>
    </div>
  );
};

export default ShopDropPage;