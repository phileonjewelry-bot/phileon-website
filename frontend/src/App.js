import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import ParabolaPage from "@/pages/ParabolaPage";
import ParabolaHeritagePage from "@/pages/ParabolaHeritagePage";
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
import DrewFacePage from "@/pages/DrewFacePage";
import LaScarpaPage from "@/pages/LaScarpaPage";
import LisaPage from "@/pages/LisaPage";
import LadyJayPage from "@/pages/LadyJayPage";
import TrueVinePage from "@/pages/TrueVinePage";
import PortaAureaPage from "@/pages/PortaAureaPage";
import BattentiDellaVillaPage from "@/pages/BattentiDellaVillaPage";
import GentPage from "@/pages/GentPage";
import StackratsPage from "@/pages/StackratsPage";
import WynettePalettePage from "@/pages/WynettePalettePage";
import VeyronNoirPage from "@/pages/VeyronNoirPage";
import UncleJoPage from "@/pages/UncleJoPage";
import InspirationVaultPage from "@/pages/InspirationVaultPage";
import NoirCadencePage from "@/pages/NoirCadencePage";
import FirstDiscoveryPage from "@/pages/FirstDiscoveryPage";
import LiaisonPage from "@/pages/LiaisonPage";
import NoirTidePage from "@/pages/NoirTidePage";
import PrismaticLaurelPage from "@/pages/PrismaticLaurelPage";
import ViridianTeardropsPage from "@/pages/ViridianTeardropsPage";
import OrbitLumierePage from "@/pages/OrbitLumierePage";
import DecoEventailPage from "@/pages/DecoEventailPage";
import RoseOfSharonPage from "@/pages/RoseOfSharonPage";
import BossKnotPage from "@/pages/BossKnotPage";
import LadyBossKnotPage from "@/pages/LadyBossKnotPage";
import KatrinaCascataPage from "@/pages/KatrinaCascataPage";
import RingSizeGuidePage from "@/pages/RingSizeGuidePage";
import CoogiDnaTagPage from "@/pages/CoogiDnaTagPage";
import AtelierPage from "@/pages/AtelierPage";
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
            <Route path="/products/parabola" element={<ParabolaPage />} />
            <Route path="/products/parabola-heritage" element={<ParabolaHeritagePage />} />
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
            <Route path="/vault/drew-face" element={<DrewFacePage />} />
            <Route path="/la-scarpa-della-regina" element={<LaScarpaPage />} />
            <Route path="/lisa" element={<LisaPage />} />
            <Route path="/lady-jay" element={<LadyJayPage />} />
            <Route path="/the-true-vine" element={<TrueVinePage />} />
            <Route path="/products/the-true-vine" element={<TrueVinePage />} />
            <Route path="/porta-aurea" element={<PortaAureaPage />} />
            <Route path="/products/porta-aurea" element={<PortaAureaPage />} />
            <Route path="/coogi-dna-tag" element={<CoogiDnaTagPage />} />
            <Route path="/products/coogi-dna-tag" element={<CoogiDnaTagPage />} />
            <Route path="/battenti-della-villa" element={<BattentiDellaVillaPage />} />
            <Route path="/products/battenti-della-villa" element={<BattentiDellaVillaPage />} />
            <Route path="/gent" element={<GentPage />} />
            <Route path="/products/gent" element={<GentPage />} />
            <Route path="/stackrats" element={<StackratsPage />} />
            <Route path="/products/stackrats" element={<StackratsPage />} />
            <Route path="/wynette-palette" element={<WynettePalettePage />} />
            <Route path="/products/wynette-palette" element={<WynettePalettePage />} />
            <Route path="/veyron-noir" element={<VeyronNoirPage />} />
            <Route path="/products/veyron-noir" element={<VeyronNoirPage />} />
            <Route path="/uncle-jo" element={<UncleJoPage />} />
            <Route path="/products/uncle-jo" element={<UncleJoPage />} />
            <Route path="/vault" element={<InspirationVaultPage />} />
            <Route path="/inspiration-vault" element={<InspirationVaultPage />} />
            <Route path="/first-discovery" element={<FirstDiscoveryPage />} />
            <Route path="/inspiration-vault/first-discovery" element={<FirstDiscoveryPage />} />
            <Route path="/prima-wave" element={<FirstDiscoveryPage />} />
            <Route path="/inspiration-vault/prima-wave" element={<FirstDiscoveryPage />} />
            <Route path="/inspiration-vault/noir-cadence" element={<NoirCadencePage />} />
            <Route path="/noir-cadence" element={<NoirCadencePage />} />
            <Route path="/liaison" element={<LiaisonPage />} />
            <Route path="/inspiration-vault/liaison" element={<LiaisonPage />} />
            <Route path="/noir-tide" element={<NoirTidePage />} />
            <Route path="/inspiration-vault/noir-tide" element={<NoirTidePage />} />
            <Route path="/prismatic-laurel" element={<PrismaticLaurelPage />} />
            <Route path="/inspiration-vault/prismatic-laurel" element={<PrismaticLaurelPage />} />
            <Route path="/viridian-teardrops" element={<ViridianTeardropsPage />} />
            <Route path="/inspiration-vault/viridian-teardrops" element={<ViridianTeardropsPage />} />
            <Route path="/orbit-lumiere" element={<OrbitLumierePage />} />
            <Route path="/inspiration-vault/orbit-lumiere" element={<OrbitLumierePage />} />
            <Route path="/deco-eventail" element={<DecoEventailPage />} />
            <Route path="/inspiration-vault/deco-eventail" element={<DecoEventailPage />} />
            <Route path="/rose-of-sharon" element={<RoseOfSharonPage />} />
            <Route path="/products/rose-of-sharon" element={<RoseOfSharonPage />} />
            <Route path="/boss-knot" element={<BossKnotPage />} />
            <Route path="/products/boss-knot" element={<BossKnotPage />} />
            <Route path="/lady-boss-knot" element={<LadyBossKnotPage />} />
            <Route path="/products/lady-boss-knot" element={<LadyBossKnotPage />} />
            <Route path="/katrina-cascata" element={<KatrinaCascataPage />} />
            <Route path="/products/katrina-cascata" element={<KatrinaCascataPage />} />
            <Route path="/ring-size-guide" element={<RingSizeGuidePage />} />
            <Route path="/size-guide" element={<RingSizeGuidePage />} />
            <Route path="/atelier" element={<AtelierPage />} />
            <Route path="/custom" element={<AtelierPage />} />
            <Route path="/commission" element={<AtelierPage />} />
            <Route path="/ladies/rings/lisa-small" element={<Navigate to="/lisa?expression=small" replace />} />
            <Route path="/gents/rings/lisa-bold" element={<Navigate to="/lisa?expression=bold" replace />} />
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
