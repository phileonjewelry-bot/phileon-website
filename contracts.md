# Phileon Jewelry E-commerce - Backend Integration Contracts

## Current Status: Frontend MVP Complete with Mock Data

### 1. API Contracts

#### Products API
```
GET    /api/products              - Get all products (with optional filters)
GET    /api/products/:id          - Get single product by ID
POST   /api/products              - Create new product (admin)
PUT    /api/products/:id          - Update product (admin)
DELETE /api/products/:id          - Delete product (admin)
POST   /api/products/upload       - Upload product images
```

#### Customer Photos API
```
GET    /api/customer-photos       - Get all customer photos
POST   /api/customer-photos       - Upload new customer photo
DELETE /api/customer-photos/:id   - Delete customer photo (admin)
```

#### Cart & Wishlist API
```
POST   /api/cart                  - Add item to cart
GET    /api/cart/:userId          - Get user's cart
PUT    /api/cart/:itemId          - Update cart item quantity
DELETE /api/cart/:itemId          - Remove from cart

POST   /api/wishlist              - Add to wishlist
GET    /api/wishlist/:userId      - Get user's wishlist
DELETE /api/wishlist/:itemId      - Remove from wishlist
```

#### Orders & Checkout API
```
POST   /api/orders                - Create new order
GET    /api/orders/:userId        - Get user's orders
GET    /api/orders/:orderId       - Get specific order
POST   /api/shipping/calculate    - Calculate shipping cost
POST   /api/payment/process       - Process payment
```

### 2. Mocked Data (Frontend localStorage)

**Currently Mocked:**
- Product catalog (8 products in mockData.js)
- Customer photos (6 photos in mockData.js)
- Cart items (localStorage: 'cart')
- Wishlist items (localStorage: 'wishlist')
- Admin products (localStorage: 'adminProducts')
- Admin customer photos (localStorage: 'adminCustomerPhotos')
- Shipping calculation (mock logic in Checkout.jsx)
- Payment processing (mock form submission in Checkout.jsx)
- Virtual try-on UI (placeholder button)

### 3. Backend Implementation Plan

#### Phase 1: Core Product Management
- MongoDB schema for products with image URLs
- CRUD operations for products
- Image upload to cloud storage (AWS S3 or Cloudinary)
- Product filtering and search

#### Phase 2: Customer Gallery
- MongoDB schema for customer photos
- Image upload functionality
- Admin approval workflow (optional)

#### Phase 3: Shopping Features
- User authentication (JWT or session-based)
- Cart persistence in database
- Wishlist persistence in database
- Order creation and management

#### Phase 4: Payment & Shipping Integration
- **Stripe Integration** for payment processing
- **PayPal Integration** as alternative payment method
- **Shipping API Integration** (ShipEngine/EasyPost)
  - Real-time shipping rate calculation
  - Label generation
  - Tracking integration

#### Phase 5: Virtual Try-On
- **Neuroviz.ai Integration** or similar AR/AI service
- Image processing for jewelry overlay
- Save try-on results

### 4. Frontend-Backend Integration Points

#### Replace Mock Data:
1. **Home.jsx** - Fetch bestsellers and customer photos from API
2. **Products.jsx** - Fetch products with filters from API
3. **ProductDetail.jsx** - Fetch single product from API
4. **Cart.jsx** - Sync cart with backend API
5. **Wishlist.jsx** - Sync wishlist with backend API
6. **Checkout.jsx** - Integrate real shipping API and payment gateway
7. **AdminDashboard.jsx** - Connect to backend CRUD operations

#### API Integration Pattern:
```javascript
// Replace localStorage with API calls
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Example: Fetch products
const response = await axios.get(`${BACKEND_URL}/api/products`);

// Example: Add to cart
await axios.post(`${BACKEND_URL}/api/cart`, { productId, quantity });
```

### 5. Required API Keys

**For Full Implementation:**
- **Stripe**: Test & Production keys
- **PayPal**: Client ID & Secret
- **Shipping API**: ShipEngine or EasyPost API key
- **Neuroviz.ai**: API key for virtual try-on
- **Cloud Storage**: AWS S3 credentials or Cloudinary API key
- **Email Service** (optional): SendGrid for order confirmations

### 6. Database Models

#### Product Schema
```javascript
{
  id: String,
  name: String,
  category: String (enum: necklaces, rings, bracelets, earrings),
  price: Number,
  images: [String], // Array of image URLs
  description: String,
  material: String,
  weight: String,
  certification: String,
  inStock: Boolean,
  bestseller: Boolean,
  rating: Number,
  reviews: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Customer Photo Schema
```javascript
{
  id: String,
  customerName: String,
  productName: String,
  location: String,
  image: String, // Image URL
  approved: Boolean,
  createdAt: Date
}
```

#### Order Schema
```javascript
{
  id: String,
  userId: String,
  items: [{
    productId: String,
    quantity: Number,
    price: Number
  }],
  shippingAddress: Object,
  shippingCost: Number,
  subtotal: Number,
  total: Number,
  paymentMethod: String,
  paymentStatus: String,
  orderStatus: String,
  trackingNumber: String,
  createdAt: Date
}
```

### 7. Security Considerations

- Admin routes require authentication
- Image uploads need validation and size limits
- Payment processing must be server-side
- Input sanitization for all user data
- Rate limiting on APIs
- HTTPS for production

### 8. Testing Checklist

**Frontend (Current):**
- ✓ Hero slider animation
- ✓ Product filtering and sorting
- ✓ Add to cart functionality (localStorage)
- ✓ Add to wishlist functionality (localStorage)
- ✓ Checkout form validation
- ✓ Admin drag-and-drop image upload
- ✓ Responsive design

**Backend (To Be Tested):**
- [ ] Product CRUD operations
- [ ] Image upload and storage
- [ ] Real shipping cost calculation
- [ ] Payment processing
- [ ] Order creation and tracking
- [ ] Virtual try-on integration
- [ ] Email notifications
