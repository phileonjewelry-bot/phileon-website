import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "sonner";

// Eager (critical) — landing + layouts + always-mounted UI
import HomePage from "@/pages/HomePage";
import PublicLayout from "@/components/layout/PublicLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import RouteSeoInjector from "@/components/RouteSeoInjector";
import SearchOverlay from "@/components/SearchOverlay";
import CartDrawer from "@/components/CartDrawer";

// Context Providers
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { MarketPricingProvider } from "@/context/MarketPricingContext";
import { PresentmentProvider } from "@/context/PresentmentContext";

// Phase 6 — non-critical, non-commerce lazy surfaces
const JournalIndexPage = lazy(() => import("@/pages/JournalPage").then((m) => ({ default: m.JournalIndexPage })));
const JournalArticlePage = lazy(() => import("@/pages/JournalPage").then((m) => ({ default: m.JournalArticlePage })));
const BlackOwnedJewelryPage = lazy(() => import("@/pages/BlackOwnedJewelryPage"));
const CustomJewelryPage = lazy(() => import("@/pages/CustomJewelryPage"));
const TrustPage = lazy(() => import("@/pages/TrustPage"));
const CollectionPage = lazy(() => import("@/components/CollectionPage"));

// Phase 6.5 — Product / editorial routes (lazy)
const CollectionsPage = lazy(() => import("@/pages/CollectionsPage"));
const CollectionDetailPage = lazy(() => import("@/pages/CollectionDetailPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));
const CustomDesignPage = lazy(() => import("@/pages/CustomDesignPage"));
const ProcessPage = lazy(() => import("@/pages/ProcessPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const TestimonialsPage = lazy(() => import("@/pages/TestimonialsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const CraftsmanshipPage = lazy(() => import("@/pages/CraftsmanshipPage"));
const RingTryOnPage = lazy(() => import("@/pages/RingTryOnPage"));
const ShopDropPage = lazy(() => import("@/pages/ShopDropPage"));
const DropPage = lazy(() => import("@/pages/DropPage"));
const MobileDropPage = lazy(() => import("@/pages/MobileDropPage"));
const SecretDropPage = lazy(() => import("./pages/SecretDropPage"));
const VaultPage = lazy(() => import("@/pages/VaultPage"));
const LaMarvaPage = lazy(() => import("@/pages/LaMarvaPage"));
const ParabolaPage = lazy(() => import("@/pages/ParabolaPage"));
const ParabolaHeritagePage = lazy(() => import("@/pages/ParabolaHeritagePage"));
const AnnieRosePage = lazy(() => import("@/pages/AnnieRosePage"));
const MonikaCouturePage = lazy(() => import("@/pages/MonikaCouturePage"));
const AlejandraHeelsPage = lazy(() => import("@/pages/AlejandraHeelsPage"));
const PTPCuffPage = lazy(() => import("@/pages/PTPCuffPage"));
const RosariaPage = lazy(() => import("@/pages/RosariaPage"));
const DesirCorsetPage = lazy(() => import("@/pages/DesirCorsetPage"));
const FormeCuffPage = lazy(() => import("@/pages/FormeCuffPage"));
const RhythmMeshRingPage = lazy(() => import("@/pages/RhythmMeshRingPage"));
const TolaIIPage = lazy(() => import("@/pages/TolaIIPage"));
const Galatians614Page = lazy(() => import("@/pages/Galatians614Page"));
const TracePage = lazy(() => import("@/pages/TracePage"));
const BoundPage = lazy(() => import("@/pages/BoundPage"));
const ApexPage = lazy(() => import("@/pages/ApexPage"));
const HomagePage = lazy(() => import("@/pages/HomagePage"));
const CypherPage = lazy(() => import("@/pages/CypherPage"));
const MorsoPage = lazy(() => import("@/pages/MorsoPage"));
const LaBetePage = lazy(() => import("@/pages/LaBetePage"));
const BlessedPage = lazy(() => import("@/pages/BlessedPage"));
const CoogiPage = lazy(() => import("@/pages/CoogiPage"));
const BamburghPage = lazy(() => import("@/pages/BamburghPage"));
const BamburghCirclePage = lazy(() => import("@/pages/BamburghCirclePage"));
const LadyBamburghPage = lazy(() => import("@/pages/LadyBamburghPage"));
const DrapePage = lazy(() => import("@/pages/DrapePage"));
const FondoCurvoPage = lazy(() => import("@/pages/FondoCurvoPage"));
const CorinthiansPage = lazy(() => import("@/pages/CorinthiansPage"));
const ChainsComingSoonPage = lazy(() => import("@/pages/ChainsComingSoonPage"));
const CocktailJessicaPage = lazy(() => import("@/pages/CocktailJessicaPage"));
const SizeGuidePage = lazy(() => import("@/pages/SizeGuidePage"));
const CouronnePage = lazy(() => import("@/pages/CouronnePage"));
const NervaturaPage = lazy(() => import("@/pages/NervaturaPage"));
const DonGorgonPage = lazy(() => import("@/pages/DonGorgonPage"));
const GrandDamePage = lazy(() => import("@/pages/GrandDamePage"));
const CarapacePage = lazy(() => import("@/pages/CarapacePage"));
const MidweekPage = lazy(() => import("@/pages/MidweekPage"));
const LaMadonnaPage = lazy(() => import("@/pages/LaMadonnaPage"));
const BapePage = lazy(() => import("@/pages/BapePage"));
const DrewFacePage = lazy(() => import("@/pages/DrewFacePage"));
const HerEternalReignPage = lazy(() => import("@/pages/HerEternalReignPage"));
const VolutaPage = lazy(() => import("@/pages/VolutaPage"));
const GravitePage = lazy(() => import("@/pages/GravitePage"));
const TwoFingerRingPlaceholderPage = lazy(() => import("@/pages/TwoFingerRingPlaceholderPage"));
const DrewsVaultPage = lazy(() => import("@/pages/DrewsVaultPage"));
const RetroBredPage = lazy(() => import("@/pages/RetroBredPage"));
const LaScarpaPage = lazy(() => import("@/pages/LaScarpaPage"));
const LisaPage = lazy(() => import("@/pages/LisaPage"));
const LadyJayPage = lazy(() => import("@/pages/LadyJayPage"));
const TrueVinePage = lazy(() => import("@/pages/TrueVinePage"));
const PortaAureaPage = lazy(() => import("@/pages/PortaAureaPage"));
const BattentiDellaVillaPage = lazy(() => import("@/pages/BattentiDellaVillaPage"));
const GentPage = lazy(() => import("@/pages/GentPage"));
const StackratsPage = lazy(() => import("@/pages/StackratsPage"));
const WynettePalettePage = lazy(() => import("@/pages/WynettePalettePage"));
const VeyronNoirPage = lazy(() => import("@/pages/VeyronNoirPage"));
const UncleJoPage = lazy(() => import("@/pages/UncleJoPage"));
const InspirationVaultPage = lazy(() => import("@/pages/InspirationVaultPage"));
const NoirCadencePage = lazy(() => import("@/pages/NoirCadencePage"));
const FirstDiscoveryPage = lazy(() => import("@/pages/FirstDiscoveryPage"));
const LiaisonPage = lazy(() => import("@/pages/LiaisonPage"));
const NoirTidePage = lazy(() => import("@/pages/NoirTidePage"));
const PrismaticLaurelPage = lazy(() => import("@/pages/PrismaticLaurelPage"));
const ViridianTeardropsPage = lazy(() => import("@/pages/ViridianTeardropsPage"));
const OrbitLumierePage = lazy(() => import("@/pages/OrbitLumierePage"));
const DecoEventailPage = lazy(() => import("@/pages/DecoEventailPage"));
const ParabolaAtelierPage = lazy(() => import("@/pages/ParabolaAtelierPage"));
const EchellePage = lazy(() => import("@/pages/EchellePage"));
const LucentPage = lazy(() => import("@/pages/LucentPage"));
const RoselinePage = lazy(() => import("@/pages/RoselinePage"));
const AltarPage = lazy(() => import("@/pages/AltarPage"));
const OrielPage = lazy(() => import("@/pages/OrielPage"));
const ArchitravePage = lazy(() => import("@/pages/ArchitravePage"));
const RebellePage = lazy(() => import("@/pages/RebellePage"));
const MonacoPage = lazy(() => import("@/pages/MonacoPage"));
const CagedWingsPage = lazy(() => import("@/pages/CagedWingsPage"));
const NovaPage = lazy(() => import("@/pages/NovaPage"));
const DrivenPage = lazy(() => import("@/pages/DrivenPage"));
const StampedeSetPage = lazy(() => import("@/pages/StampedeSetPage"));
const NightfangSetPage = lazy(() => import("@/pages/NightfangSetPage"));
const ParallaxDropEarringsPage = lazy(() => import("@/pages/ParallaxDropEarringsPage"));
const GoldenHourCuffsPage = lazy(() => import("@/pages/GoldenHourCuffsPage"));
const OvationRibbedRingPage = lazy(() => import("@/pages/OvationRibbedRingPage"));
const BajanJoeSignetRingPage = lazy(() => import("@/pages/BajanJoeSignetRingPage"));
const QuadrigaDominusPage = lazy(() => import("@/pages/QuadrigaDominusPage"));
const CrestaNeraBanglePage = lazy(() => import("@/pages/CrestaNeraBanglePage"));
const RibbonRegalePage = lazy(() => import("@/pages/RibbonRegalePage"));
const RibbonRegaleEditionPage = lazy(() => import("@/pages/RibbonRegaleEditionPage"));
const ScaccoMattoPage = lazy(() => import("@/pages/ScaccoMattoPage"));
const TributeSeriesPage = lazy(() => import("@/pages/TributeSeriesPage"));
const NeighborhoodNipPage = lazy(() => import("@/pages/NeighborhoodNipPage"));
const RoseOfSharonPage = lazy(() => import("@/pages/RoseOfSharonPage"));
const BossKnotPage = lazy(() => import("@/pages/BossKnotPage"));
const LadyBossKnotPage = lazy(() => import("@/pages/LadyBossKnotPage"));
const KatrinaCascataPage = lazy(() => import("@/pages/KatrinaCascataPage"));
const RingSizeGuidePage = lazy(() => import("@/pages/RingSizeGuidePage"));
const CoogiDnaTagPage = lazy(() => import("@/pages/CoogiDnaTagPage"));
const AtelierPage = lazy(() => import("@/pages/AtelierPage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const CheckoutSuccess = lazy(() => import("@/pages/CheckoutSuccess"));
const CheckoutCancel = lazy(() => import("@/pages/CheckoutCancel"));
const CartPage = lazy(() => import("@/pages/Cart"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const OrderStatusPage = lazy(() => import("@/pages/OrderStatusPage"));

// Admin Pages (lazy — admin surface never loaded by public visitors)
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminConcierge = lazy(() => import("@/pages/admin/AdminConcierge"));
const AdminShipments = lazy(() => import("@/pages/admin/AdminShipments"));
const AdminFulfillment = lazy(() => import("@/pages/admin/AdminFulfillment"));
const AdminReturns = lazy(() => import("@/pages/admin/AdminReturns"));
const AdminDisputes = lazy(() => import("@/pages/admin/AdminDisputes"));
const AdminRetention = lazy(() => import("@/pages/admin/AdminRetention"));
const AdminCollections = lazy(() => import("@/pages/admin/AdminCollections"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminInquiries = lazy(() => import("@/pages/admin/AdminInquiries"));
const AdminConsultations = lazy(() => import("@/pages/admin/AdminConsultations"));
const AdminTestimonials = lazy(() => import("@/pages/admin/AdminTestimonials"));
const AdminFAQ = lazy(() => import("@/pages/admin/AdminFAQ"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));

function App() {
  return (
    <div className="min-h-screen bg-phileon-black">
      <MarketPricingProvider>
      <PresentmentProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <RouteSeoInjector />
            <SearchOverlay />
        <Suspense fallback={<div style={{minHeight: '100vh', background: '#0a0a0a'}} data-testid="route-fallback" />}>
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
            <Route path="/parabola" element={<ParabolaPage />} />
            <Route path="/products/parabola-heritage" element={<ParabolaHeritagePage />} />
            <Route path="/parabola-heritage" element={<ParabolaHeritagePage />} />
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
            <Route path="/privacy" element={<TrustPage />} />
            <Route path="/terms" element={<TrustPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
            <Route path="/orders/:orderNumber/status" element={<OrderStatusPage />} />
            <Route path="/vault/drews-world" element={<VaultPage />} />
            <Route path="/vault/drew-face" element={<DrewFacePage />} />
            {/* H.E.R. — HER ETERNAL REIGN · Ladies Fine Jewelry ring */}
            <Route path="/her-eternal-reign" element={<HerEternalReignPage />} />
            <Route path="/products/her-eternal-reign" element={<HerEternalReignPage />} />
            <Route path="/fine-jewelry/her-eternal-reign" element={<HerEternalReignPage />} />
            <Route path="/ladies/rings/her-eternal-reign" element={<HerEternalReignPage />} />
            {/* ROUGE SIREN (working name — formerly VOLUTA). Not yet in trusted catalog. */}
            <Route path="/products/rouge-siren" element={<VolutaPage />} />
            <Route path="/rouge-siren" element={<VolutaPage />} />
            <Route path="/fine-jewelry/rouge-siren" element={<VolutaPage />} />
            {/* Legacy VOLUTA aliases — hard redirect to canonical ROUGE SIREN route. */}
            <Route path="/products/voluta" element={<Navigate to="/products/rouge-siren" replace />} />
            <Route path="/voluta" element={<Navigate to="/products/rouge-siren" replace />} />
            <Route path="/fine-jewelry/voluta" element={<Navigate to="/products/rouge-siren" replace />} />
            {/* GRAVITÉ — Product #4 of 6. PRE-CAD, non-purchasable placeholder.
                Backend trusted catalog untouched (still 84). */}
            <Route path="/products/gravite" element={<GravitePage />} />
            <Route path="/gravite" element={<GravitePage />} />
            <Route path="/fine-jewelry/gravite" element={<GravitePage />} />
            <Route path="/ladies/rings/gravite" element={<GravitePage />} />

            {/* TWO-FINGER RING — Working concept placeholder (Fine Jewelry).
                Non-purchasable. Not in trusted checkout. Canonical + Fine Jewelry alias. */}
            <Route path="/products/two-finger-ring" element={<TwoFingerRingPlaceholderPage />} />
            <Route path="/fine-jewelry/two-finger-ring" element={<TwoFingerRingPlaceholderPage />} />

            {/* Phase 4 — Search-intent collection routes. Discovery-classified,
                editorially-worded, structured-data-emitting. Commerce untouched. */}
            <Route path="/mens-rings" element={<CollectionPage intent="mens-rings" />} />
            <Route path="/womens-rings" element={<CollectionPage intent="womens-rings" />} />
            <Route path="/pendants" element={<CollectionPage intent="pendants" />} />
            <Route path="/earrings" element={<CollectionPage intent="earrings" />} />
            <Route path="/fine-jewelry" element={<CollectionPage intent="fine-jewelry" />} />
            <Route path="/mens-jewelry" element={<CollectionPage intent="mens-jewelry" />} />
            <Route path="/statement-rings" element={<CollectionPage intent="statement-rings" />} />
            <Route path="/gold-jewelry" element={<CollectionPage intent="gold-jewelry" />} />
            <Route path="/lab-grown-diamond-jewelry" element={<CollectionPage intent="lab-grown-diamond-jewelry" />} />

            {/* Phase 4 — Journal scaffold. Zero placeholder content. */}
            <Route path="/journal" element={<JournalIndexPage />} />
            <Route path="/journal/:slug" element={<JournalArticlePage />} />

            {/* Phase 4 — Identity + Origin brand-discovery landings.
                Overlapping search intents consolidate to a single canonical page. */}
            <Route path="/black-owned-canadian-jewelry" element={<BlackOwnedJewelryPage />} />
            <Route path="/black-owned-jewelry-brand" element={<Navigate to="/black-owned-canadian-jewelry" replace />} />
            <Route path="/black-owned-jewelry" element={<Navigate to="/black-owned-canadian-jewelry" replace />} />
            <Route path="/canadian-jewelry-designer" element={<Navigate to="/black-owned-canadian-jewelry" replace />} />
            <Route path="/canadian-jewelry-brand" element={<Navigate to="/black-owned-canadian-jewelry" replace />} />
            <Route path="/custom-jewelry-canada" element={<CustomJewelryPage />} />
            <Route path="/custom-jewelry-toronto" element={<Navigate to="/custom-jewelry-canada" replace />} />
            <Route path="/custom-jewelry" element={<Navigate to="/custom-jewelry-canada" replace />} />
            <Route path="/handmade-jewelry-canada" element={<Navigate to="/custom-jewelry-canada" replace />} />

            {/* Phase 5 — Trust page shells. Structure live, copy owner-required. */}
            <Route path="/shipping" element={<TrustPage />} />
            <Route path="/returns" element={<TrustPage />} />
            <Route path="/warranty" element={<TrustPage />} />
            <Route path="/jewelry-care" element={<TrustPage />} />
            <Route path="/materials" element={<TrustPage />} />
            {/* Drew's Vault — private access via /secret-drop unlock. NOT
                linked from public nav/homepage/shop. noindex/nofollow. */}
            <Route path="/drews-vault" element={<DrewsVaultPage />} />
            <Route path="/drews-vault/retro-bred" element={<RetroBredPage />} />
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
            <Route path="/parabola-atelier" element={<ParabolaAtelierPage />} />
            <Route path="/inspiration-vault/parabola-atelier" element={<ParabolaAtelierPage />} />
            <Route path="/echelle" element={<EchellePage />} />
            <Route path="/inspiration-vault/echelle" element={<EchellePage />} />
            <Route path="/lucent" element={<LucentPage />} />
            <Route path="/inspiration-vault/lucent" element={<LucentPage />} />
            <Route path="/roseline" element={<RoselinePage />} />
            <Route path="/inspiration-vault/roseline" element={<RoselinePage />} />
            <Route path="/altar" element={<AltarPage />} />
            <Route path="/inspiration-vault/altar" element={<AltarPage />} />
            <Route path="/oriel" element={<OrielPage />} />
            <Route path="/inspiration-vault/oriel" element={<OrielPage />} />
            <Route path="/architrave" element={<ArchitravePage />} />
            <Route path="/products/architrave" element={<ArchitravePage />} />
            <Route path="/rebelle" element={<RebellePage />} />
            <Route path="/products/rebelle" element={<RebellePage />} />
            <Route path="/monaco" element={<MonacoPage />} />
            <Route path="/inspiration-vault/monaco" element={<MonacoPage />} />
            <Route path="/caged-wings" element={<CagedWingsPage />} />
            <Route path="/inspiration-vault/caged-wings" element={<CagedWingsPage />} />
            <Route path="/nova" element={<NovaPage />} />
            <Route path="/inspiration-vault/nova" element={<NovaPage />} />
            <Route path="/driven" element={<DrivenPage />} />
            <Route path="/inspiration-vault/driven" element={<DrivenPage />} />
            <Route path="/inspiration-vault/stampede-set" element={<StampedeSetPage />} />
            <Route path="/stampede-set" element={<StampedeSetPage />} />
            <Route path="/inspiration-vault/nightfang-set" element={<NightfangSetPage />} />
            <Route path="/nightfang-set" element={<NightfangSetPage />} />
            <Route path="/inspiration-vault/parallax-drop-earrings" element={<ParallaxDropEarringsPage />} />
            <Route path="/parallax-drop-earrings" element={<ParallaxDropEarringsPage />} />
            <Route path="/inspiration-vault/golden-hour-cuffs" element={<GoldenHourCuffsPage />} />
            <Route path="/ovation" element={<OvationRibbedRingPage />} />
            <Route path="/products/ovation" element={<OvationRibbedRingPage />} />
            <Route path="/bajan-joe" element={<BajanJoeSignetRingPage />} />
            <Route path="/products/bajan-joe" element={<BajanJoeSignetRingPage />} />
            <Route path="/fine-jewelry/bajan-joe" element={<BajanJoeSignetRingPage />} />
            <Route path="/quadriga-dominus" element={<QuadrigaDominusPage />} />
            <Route path="/products/quadriga-dominus" element={<QuadrigaDominusPage />} />
            <Route path="/fine-jewelry/quadriga-dominus" element={<QuadrigaDominusPage />} />
            <Route path="/cresta-nera" element={<CrestaNeraBanglePage />} />
            <Route path="/products/cresta-nera" element={<CrestaNeraBanglePage />} />
            <Route path="/fine-jewelry/cresta-nera" element={<CrestaNeraBanglePage />} />
            <Route path="/inspiration-vault/gold-theory-ribbon" element={<RibbonRegalePage />} />
            <Route path="/inspiration-vault/ribbon-regale" element={<RibbonRegalePage />} />
            <Route path="/ribbon-regale-edition" element={<RibbonRegaleEditionPage />} />
            <Route path="/products/ribbon-regale-edition" element={<RibbonRegaleEditionPage />} />
            <Route path="/fine-jewelry/ribbon-regale-edition" element={<RibbonRegaleEditionPage />} />
            <Route path="/scacco-matto" element={<ScaccoMattoPage />} />
            <Route path="/fine-jewelry/scacco-matto" element={<ScaccoMattoPage />} />
            <Route path="/products/scacco-matto" element={<ScaccoMattoPage />} />
            <Route path="/tribute-series" element={<TributeSeriesPage />} />
            <Route path="/tribute-series/neighborhood-nip" element={<NeighborhoodNipPage />} />
            <Route path="/neighborhood-nip" element={<NeighborhoodNipPage />} />
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
            <Route path="concierge" element={<AdminConcierge />} />
            <Route path="shipments" element={<AdminShipments />} />
            <Route path="fulfillment" element={<AdminFulfillment />} />
            <Route path="returns" element={<AdminReturns />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="retention" element={<AdminRetention />} />
            <Route path="collections" element={<AdminCollections />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="consultations" element={<AdminConsultations />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="faq" element={<AdminFAQ />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          {/* Catch-all — must be LAST. Any unknown URL renders the
              PHILEON-styled NotFoundPage instead of a blank body. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
        <CartDrawer />
      </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
    </PresentmentProvider>
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
