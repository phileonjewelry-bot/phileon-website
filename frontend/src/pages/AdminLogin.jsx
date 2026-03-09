import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple client-side check (in production, validate on backend)
    const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || 'admin@phileon.com';
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

    if (email === adminEmail && password === adminPassword) {
      // Store auth token in localStorage
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminEmail', email);
      
      toast({
        title: 'Login Successful',
        description: 'Welcome to Phileon Admin Dashboard',
      });
      
      navigate('/admin/dashboard');
    } else {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <Card className="max-w-md w-full bg-gray-900 border-gray-800">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-yellow-500/10 rounded-full mb-4">
              <Lock className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-gray-400">Phileon Jewelry Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                placeholder="admin@phileon.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white focus:border-yellow-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-6 text-lg"
            >
              {loading ? 'Logging in...' : 'Login to Dashboard'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-gray-400 hover:text-yellow-500 text-sm">
              ← Back to Store
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;