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
import VaultPage from "@/pages/VaultPage";
import LaMarvaPage from "@/pages/LaMarvaPage";
import AnnieRosePage from "@/pages/AnnieRosePage";
import MonikaCouturePage from "@/pages/MonikaCouturePage";
import AlejandraHeelsPage from "@/pages/AlejandraHeelsPage";
import PTPCuffPage from "@/pages/PTPCuffPage";
import RosariaPage from "@/pages/RosariaPage";
import DesirCorsetPage from "@/pages/DesirCorsetPage";
import FormeCuffPage from "@/pages/FormeCuffPage";
import RhythmMeshRingPage from "@/pages/RhythmMeshRingPage";
import TolaIIPage from "@/pages/TolaIIPage";
import Galatians614Page from "@/pages/Galatians614Page";
import TracePage from "@/pages/TracePage";
import BoundPage from "@/pages/BoundPage";
import ApexPage from "@/pages/ApexPage";
import HomagePage from "@/pages/HomagePage";
import CypherPage from "@/pages/CypherPage";
import MorsoPage from "@/pages/MorsoPage";
import LaBetePage from "@/pages/LaBetePage";
import BlessedPage from "@/pages/BlessedPage";
import CoogiPage from "@/pages/CoogiPage";
import BamburghPage from "@/pages/BamburghPage";
import BamburghCirclePage from "@/pages/BamburghCirclePage";
import LadyBamburghPage from "@/pages/LadyBamburghPage";
import DrapePage from "@/pages/DrapePage";
import FondoCurvoPage from "@/pages/FondoCurvoPage";
import CorinthiansPage from "@/pages/CorinthiansPage";
import ChainsComingSoonPage from "@/pages/ChainsComingSoonPage";
import CocktailJessicaPage from "@/pages/CocktailJessicaPage";
import SizeGuidePage from "@/pages/SizeGuidePage";
import CouronnePage from "@/pages/CouronnePage";
import NervaturaPage from "@/pages/NervaturaPage";
import DonGorgonPage from "@/pages/DonGorgonPage";
import GrandDamePage from "@/pages/GrandDamePage";
import CarapacePage from "@/pages/CarapacePage";
import MidweekPage from "@/pages/MidweekPage";
import LaMadonnaPage from "@/pages/LaMadonnaPage";
import BapePage from "@/pages/BapePage";
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
import { MarketPricingProvider } from "@/context/MarketPricingContext";

// Components
import CartDrawer from "@/components/CartDrawer";

function App() {
  return (
    <div className="min-h-screen bg-phileon-black">
      <MarketPricingProvider>
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
            <Route path="/products/la-marva" element={<LaMarvaPage />} />
            <Route path="/products/annie-rose" element={<AnnieRosePage />} />
            <Route path="/products/monika-couture" element={<MonikaCouturePage />} />
            <Route path="/products/alejandra-heels" element={<AlejandraHeelsPage />} />
            <Route path="/products/ptp-cuff" element={<PTPCuffPage />} />
            <Route path="/products/rosaria" element={<RosariaPage />} />
            <Route path="/products/desir-corset" element={<DesirCorsetPage />} />
            <Route path="/products/forme-cuff" element={<FormeCuffPage />} />
            <Route path="/products/rhythm-mesh-ring" element={<RhythmMeshRingPage />} />
            <Route path="/products/tola-ii" element={<TolaIIPage />} />
            <Route path="/products/galatians-614" element={<Galatians614Page />} />
            <Route path="/products/trace" element={<TracePage />} />
            <Route path="/products/bound" element={<BoundPage />} />
            <Route path="/products/apex" element={<ApexPage />} />
            <Route path="/products/homage" element={<HomagePage />} />
            <Route path="/products/cypher" element={<CypherPage />} />
            <Route path="/products/morso" element={<MorsoPage />} />
            <Route path="/products/labete" element={<LaBetePage />} />
            <Route path="/products/blessed" element={<BlessedPage />} />
            <Route path="/products/coogi-i" element={<CoogiPage />} />
            <Route path="/products/bamburgh" element={<BamburghPage />} />
            <Route path="/products/the-bamburgh" element={<BamburghPage />} />
            <Route path="/products/lady-bamburgh" element={<LadyBamburghPage />} />
            <Route path="/bamburgh-circle" element={<BamburghCirclePage />} />
            <Route path="/products/drape" element={<DrapePage />} />
            <Route path="/products/fondo-curvo" element={<FondoCurvoPage />} />
            <Route path="/products/corinthians-15-14" element={<CorinthiansPage />} />
            <Route path="/collections/chains-coming-soon" element={<ChainsComingSoonPage />} />
            <Route path="/products/le-cocktail-de-jessica" element={<CocktailJessicaPage />} />
            <Route path="/size-guide" element={<SizeGuidePage />} />
            <Route path="/products/prise-de-couronne" element={<CouronnePage />} />
            <Route path="/products/nervatura" element={<NervaturaPage />} />
            <Route path="/products/the-don-gorgon" element={<DonGorgonPage />} />
            <Route path="/products/the-grand-dame" element={<GrandDamePage />} />
            <Route path="/products/the-carapace" element={<CarapacePage />} />
            <Route path="/products/midweek" element={<MidweekPage />} />
            <Route path="/la-madonna" element={<LaMadonnaPage />} />
            <Route path="/homage/bape" element={<BapePage />} />
            <Route path="/shop/labete" element={<LaBetePage />} />
            <Route path="/shop/blessed" element={<BlessedPage />} />
            <Route path="/shop/coogi-i" element={<CoogiPage />} />
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
            <Route path="/vault/drews-world" element={<VaultPage />} />
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
    </MarketPricingProvider>
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
