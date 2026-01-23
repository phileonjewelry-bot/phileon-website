import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '@/lib/api';
import { FolderOpen, Gem, MessageSquare, Calendar } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    collections: 0,
    products: 0,
    new_inquiries: 0,
    pending_consultations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { 
      title: 'Collections', 
      value: stats.collections, 
      icon: FolderOpen, 
      link: '/admin/collections',
      color: 'bg-blue-900/30 text-blue-400'
    },
    { 
      title: 'Products', 
      value: stats.products, 
      icon: Gem, 
      link: '/admin/products',
      color: 'bg-purple-900/30 text-purple-400'
    },
    { 
      title: 'New Inquiries', 
      value: stats.new_inquiries, 
      icon: MessageSquare, 
      link: '/admin/inquiries',
      color: 'bg-green-900/30 text-green-400'
    },
    { 
      title: 'Pending Consultations', 
      value: stats.pending_consultations, 
      icon: Calendar, 
      link: '/admin/consultations',
      color: 'bg-phileon-gold/20 text-phileon-gold'
    },
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="font-serif text-2xl tracking-[0.1em] text-phileon-ivory">Dashboard</h1>
        <p className="text-phileon-ivory-muted text-sm mt-1">Welcome to Phileon Admin</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.title}
                  to={stat.link}
                  className="bg-phileon-charcoal p-6 hover:bg-phileon-charcoal/80 transition-colors group"
                  data-testid={`stat-${stat.title.toLowerCase().replace(' ', '-')}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${stat.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-phileon-ivory-muted text-xs group-hover:text-phileon-gold transition-colors">
                      View →
                    </span>
                  </div>
                  <p className="font-serif text-3xl text-phileon-ivory">{stat.value}</p>
                  <p className="text-phileon-ivory-muted text-sm mt-1">{stat.title}</p>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="font-serif text-lg tracking-wider text-phileon-ivory mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/collections"
                className="bg-phileon-charcoal p-4 text-center hover:bg-phileon-gold hover:text-phileon-black transition-colors"
              >
                <span className="text-sm">+ Add Collection</span>
              </Link>
              <Link
                to="/admin/products"
                className="bg-phileon-charcoal p-4 text-center hover:bg-phileon-gold hover:text-phileon-black transition-colors"
              >
                <span className="text-sm">+ Add Product</span>
              </Link>
              <Link
                to="/admin/testimonials"
                className="bg-phileon-charcoal p-4 text-center hover:bg-phileon-gold hover:text-phileon-black transition-colors"
              >
                <span className="text-sm">+ Add Testimonial</span>
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="bg-phileon-near-black border border-phileon-charcoal p-6">
            <h3 className="text-phileon-gold text-sm tracking-wider mb-3">Getting Started</h3>
            <ul className="space-y-2 text-sm text-phileon-ivory-muted">
              <li>• Create collections to organize your jewelry pieces</li>
              <li>• Add products with images, materials, and pricing</li>
              <li>• Manage incoming inquiries and consultation requests</li>
              <li>• Update site settings and featured items</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
