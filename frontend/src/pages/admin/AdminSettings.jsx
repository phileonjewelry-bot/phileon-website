import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_image: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminApi.getSettings();
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div data-testid="admin-settings">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl tracking-[0.1em] text-phileon-ivory">Settings</h1>
          <p className="text-phileon-ivory-muted text-sm mt-1">Configure site settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="btn-primary" data-testid="save-settings-btn">
          <Save size={18} className="mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-phileon-charcoal p-6">
          <h2 className="font-serif text-lg tracking-wider text-phileon-gold mb-6">
            Hero Section
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                HERO TITLE
              </label>
              <Input
                value={settings.hero_title || ''}
                onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                placeholder="Timeless Elegance, Crafted for You"
                className="bg-phileon-near-black border-phileon-near-black text-phileon-ivory"
                data-testid="hero-title-input"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                HERO SUBTITLE
              </label>
              <Input
                value={settings.hero_subtitle || ''}
                onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                placeholder="Bespoke jewelry that tells your story"
                className="bg-phileon-near-black border-phileon-near-black text-phileon-ivory"
                data-testid="hero-subtitle-input"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                HERO BACKGROUND IMAGE URL
              </label>
              <Input
                value={settings.hero_image || ''}
                onChange={(e) => setSettings({ ...settings, hero_image: e.target.value })}
                placeholder="https://..."
                className="bg-phileon-near-black border-phileon-near-black text-phileon-ivory"
                data-testid="hero-image-input"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-phileon-charcoal p-6">
          <h2 className="font-serif text-lg tracking-wider text-phileon-gold mb-6">
            Contact Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                EMAIL ADDRESS
              </label>
              <Input
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="hello@phileon.com"
                className="bg-phileon-near-black border-phileon-near-black text-phileon-ivory"
                data-testid="contact-email-input"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                PHONE NUMBER
              </label>
              <Input
                value={settings.contact_phone || ''}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="bg-phileon-near-black border-phileon-near-black text-phileon-ivory"
                data-testid="contact-phone-input"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                ADDRESS
              </label>
              <Textarea
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={3}
                placeholder="123 Luxury Lane, Suite 100..."
                className="bg-phileon-near-black border-phileon-near-black text-phileon-ivory resize-none"
                data-testid="address-input"
              />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-phileon-near-black border border-phileon-charcoal p-6">
          <h3 className="text-phileon-gold text-sm tracking-wider mb-3">Admin Credentials</h3>
          <p className="text-sm text-phileon-ivory-muted">
            Default login: <span className="text-phileon-ivory">admin</span> / <span className="text-phileon-ivory">phileon2024</span>
          </p>
          <p className="text-xs text-phileon-ivory-muted mt-2">
            For security, please change the default credentials in production.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
