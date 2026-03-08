import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    client_name: '',
    client_location: '',
    quote: '',
    story: '',
    product_type: '',
    image_url: '',
    is_featured: false,
    is_visible: true,
    display_order: 0,
  });

  const fetchTestimonials = async () => {
    try {
      const response = await adminApi.getTestimonials();
      setTestimonials(response.data);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openCreateModal = () => {
    setEditingTestimonial(null);
    setFormData({
      client_name: '',
      client_location: '',
      quote: '',
      story: '',
      product_type: '',
      image_url: '',
      is_featured: false,
      is_visible: true,
      display_order: testimonials.length,
    });
    setModalOpen(true);
  };

  const openEditModal = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      client_name: testimonial.client_name,
      client_location: testimonial.client_location || '',
      quote: testimonial.quote,
      story: testimonial.story || '',
      product_type: testimonial.product_type || '',
      image_url: testimonial.image_url || '',
      is_featured: testimonial.is_featured,
      is_visible: testimonial.is_visible,
      display_order: testimonial.display_order,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await adminApi.updateTestimonial(editingTestimonial.id, formData);
        toast.success('Testimonial updated');
      } else {
        await adminApi.createTestimonial(formData);
        toast.success('Testimonial created');
      }
      setModalOpen(false);
      fetchTestimonials();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await adminApi.deleteTestimonial(id);
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const toggleFeatured = async (testimonial) => {
    try {
      await adminApi.updateTestimonial(testimonial.id, { is_featured: !testimonial.is_featured });
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  return (
    <div data-testid="admin-testimonials">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl tracking-[0.1em] text-phileon-ivory">Testimonials</h1>
          <p className="text-phileon-ivory-muted text-sm mt-1">Manage client stories</p>
        </div>
        <Button onClick={openCreateModal} className="btn-primary" data-testid="add-testimonial-btn">
          <Plus size={18} className="mr-2" /> Add Testimonial
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : testimonials.length > 0 ? (
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-phileon-charcoal p-6"
              data-testid={`testimonial-row-${testimonial.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-phileon-ivory font-serif tracking-wider">
                      {testimonial.client_name}
                    </h3>
                    {testimonial.is_featured && (
                      <Star size={14} className="text-phileon-gold fill-phileon-gold" />
                    )}
                    {!testimonial.is_visible && (
                      <span className="text-xs bg-phileon-near-black px-2 py-1 text-phileon-ivory-muted">
                        Hidden
                      </span>
                    )}
                  </div>
                  {testimonial.client_location && (
                    <p className="text-phileon-ivory-muted text-xs mt-1">
                      {testimonial.client_location}
                      {testimonial.product_type && ` • ${testimonial.product_type}`}
                    </p>
                  )}
                  <p className="text-phileon-ivory-muted text-sm mt-3 italic line-clamp-2">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFeatured(testimonial)}
                    className={testimonial.is_featured ? 'text-phileon-gold' : 'text-phileon-ivory-muted'}
                  >
                    <Star size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(testimonial)}
                    className="text-phileon-ivory-muted hover:text-phileon-gold"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                    className="text-phileon-ivory-muted hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-phileon-charcoal">
          <p className="text-phileon-ivory-muted">No testimonials yet</p>
          <Button onClick={openCreateModal} className="btn-outline mt-4">
            Add First Testimonial
          </Button>
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-phileon-near-black border-phileon-charcoal text-phileon-ivory max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl tracking-wider">
              {editingTestimonial ? 'Edit Testimonial' : 'New Testimonial'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                  CLIENT NAME *
                </label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  required
                  className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                  LOCATION
                </label>
                <Input
                  value={formData.client_location}
                  onChange={(e) => setFormData({ ...formData, client_location: e.target.value })}
                  placeholder="e.g., New York, NY"
                  className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                QUOTE *
              </label>
              <Textarea
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                required
                rows={3}
                placeholder="The main testimonial quote..."
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory resize-none"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                FULL STORY
              </label>
              <Textarea
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                rows={4}
                placeholder="Extended story (optional)..."
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory resize-none"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                PRODUCT TYPE
              </label>
              <Input
                value={formData.product_type}
                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                placeholder="e.g., Engagement Ring"
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                />
                <span className="text-sm text-phileon-ivory-muted">Visible</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <span className="text-sm text-phileon-ivory-muted">Featured</span>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 btn-primary">
                {editingTestimonial ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTestimonials;
