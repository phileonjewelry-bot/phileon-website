import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Gem, 
  MessageSquare, 
  Calendar, 
  Quote, 
  HelpCircle, 
  Settings, 
  LogOut,
  Menu,
  X,
  Truck,
  Package,
  Archive,
  RefreshCcw,
  ShieldAlert,
  Bell,
  LifeBuoy
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Concierge Cases', path: '/admin/concierge-cases', icon: LifeBuoy },
  { name: 'Concierge', path: '/admin/concierge', icon: MessageSquare },
  { name: 'Fulfillment', path: '/admin/fulfillment', icon: Package },
  { name: 'Shipments', path: '/admin/shipments', icon: Truck },
  { name: 'Returns', path: '/admin/returns', icon: RefreshCcw },
  { name: 'Disputes', path: '/admin/disputes', icon: ShieldAlert },
  { name: 'Inventory', path: '/admin/inventory', icon: Archive },
  { name: 'Retention', path: '/admin/retention', icon: Bell },
  { name: 'Collections', path: '/admin/collections', icon: FolderOpen },
  { name: 'Products', path: '/admin/products', icon: Gem },
  { name: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
  { name: 'Consultations', path: '/admin/consultations', icon: Calendar },
  { name: 'Testimonials', path: '/admin/testimonials', icon: Quote },
  { name: 'FAQ', path: '/admin/faq', icon: HelpCircle },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('phileon_admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('phileon_admin_token');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-phileon-black flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-phileon-near-black border-r border-phileon-charcoal">
        <div className="p-6 border-b border-phileon-charcoal">
          <Link to="/admin" className="font-serif text-xl tracking-[0.15em] text-phileon-gold">
            PHILEON
          </Link>
          <p className="text-xs text-phileon-ivory-muted mt-1 tracking-wider">ADMIN</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors ${
                  isActive
                    ? 'bg-phileon-charcoal text-phileon-gold'
                    : 'text-phileon-ivory-muted hover:bg-phileon-charcoal hover:text-phileon-ivory'
                }`}
                data-testid={`admin-nav-${link.name.toLowerCase()}`}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-phileon-charcoal">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-sm text-phileon-ivory-muted hover:text-red-400 transition-colors"
            data-testid="admin-logout"
          >
            <LogOut size={18} />
            Logout
          </button>
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 w-full text-sm text-phileon-ivory-muted hover:text-phileon-gold transition-colors mt-1"
          >
            View Site →
          </Link>
        </div>
      </aside>

      {/* Mobile Header & Sidebar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-phileon-near-black border-b border-phileon-charcoal">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/admin" className="font-serif text-lg tracking-[0.15em] text-phileon-gold">
            PHILEON
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-phileon-ivory"
            data-testid="admin-mobile-menu"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsSidebarOpen(false)}>
          <aside 
            className="w-64 h-full bg-phileon-near-black border-r border-phileon-charcoal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pt-20 p-4 space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded text-sm transition-colors ${
                      isActive
                        ? 'bg-phileon-charcoal text-phileon-gold'
                        : 'text-phileon-ivory-muted hover:bg-phileon-charcoal hover:text-phileon-ivory'
                    }`}
                  >
                    <Icon size={18} />
                    {link.name}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 w-full text-sm text-phileon-ivory-muted hover:text-red-400 transition-colors mt-4"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 mt-16 lg:mt-0 overflow-auto">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
