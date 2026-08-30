import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await adminApi.login(credentials);
      localStorage.setItem('phileon_admin_token', response.data.access_token);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (error) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-phileon-black flex items-center justify-center px-6" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl tracking-[0.15em] text-phileon-gold">PHILEON</h1>
          <p className="text-phileon-ivory-muted text-sm mt-2 tracking-wider">ADMIN PORTAL</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
              USERNAME
            </label>
            <Input
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
              data-testid="admin-username"
            />
          </div>
          <div>
            <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
              PASSWORD
            </label>
            <Input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory h-12"
              data-testid="admin-password"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary"
            data-testid="admin-login-btn"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
