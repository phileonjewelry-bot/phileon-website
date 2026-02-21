import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Public Pages
import HomePage from "@/pages/HomePage";
import CollectionsPage from "@/pages/CollectionsPage";
import CollectionDetailPage from "@/pages/CollectionDetailPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CustomDesignPage from "@/pages/CustomDesignPage";
import ProcessPage from "@/pages/ProcessPage";
import AboutPage from "@/pages/AboutPage";
import TestimonialsPage from "@/pages/TestimonialsPage";
import ContactPage from "@/pages/ContactPage";
import FAQPage from "@/pages/FAQPage";
import CraftsmanshipPage from "@/pages/CraftsmanshipPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import RingTryOnPage from "@/pages/RingTryOnPage";
import ShopDropPage from "@/pages/ShopDropPage";
import DropPage from "@/pages/DropPage";
import MobileDropPage from "@/pages/MobileDropPage";
import SecretDropPage from "./pages/SecretDropPage";
import WishlistPage from "@/pages/WishlistPage";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel from "@/pages/CheckoutCancel";

// Admin Pages
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCollections from "@/pages/admin/AdminCollections";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminInquiries from "@/pages/admin/AdminInquiries";
import AdminConsultations from "@/pages/admin/AdminConsultations";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminFAQ from "@/pages/admin/AdminFAQ";
import AdminSettings from "@/pages/admin/AdminSettings";

// Layout Components
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Context Providers
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";

// Components
import CartDrawer from "@/components/CartDrawer";

function App() {
  return (
    <div className="min-h-screen bg-phileon-black">
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
        <Routes>
          {/* Surprise Drop Pages (standalone, no layout) */}
          <Route path="/drop" element={<DropPage />} />
          <Route path="/m-drop" element={<MobileDropPage />} />
          <Route path="/secret-drop" element={<SecretDropPage />} />
          <Route path="/secretdrop" element={<SecretDropPage />} />

          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopDropPage />} />
            <Route path="/shop-drop" element={<ShopDropPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/:slug" element={<CollectionDetailPage />} />
            <Route path="/piece/:slug" element={<ProductDetailPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/custom-design" element={<CustomDesignPage />} />
            <Route path="/ring-try-on" element={<RingTryOnPage />} />
            <Route path="/process" element={<ProcessPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/craftsmanship" element={<CraftsmanshipPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="consultations" element={<AdminConsultations />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="faq" element={<AdminFAQ />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        <CartDrawer />
      </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
    <Toaster 
      position="bottom-right" 
      toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#f5f2eb',
          border: '1px solid #2a2a2a',
        },
      }}
    />
  </div>
);
}

export default App;
