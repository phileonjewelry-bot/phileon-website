import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const categories = [
  { value: 'process', label: 'Design Process' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'care', label: 'Care & Maintenance' },
  { value: 'general', label: 'General' },
];

const AdminFAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    display_order: 0,
    is_visible: true,
  });

  const fetchFaqs = async () => {
    try {
      const response = await adminApi.getFAQ();
      setFaqs(response.data);
    } catch (error) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      display_order: faqs.length,
      is_visible: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      display_order: faq.display_order,
      is_visible: faq.is_visible,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await adminApi.updateFAQ(editingFaq.id, formData);
        toast.success('FAQ updated');
      } else {
        await adminApi.createFAQ(formData);
        toast.success('FAQ created');
      }
      setModalOpen(false);
      fetchFaqs();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await adminApi.deleteFAQ(id);
      toast.success('FAQ deleted');
      fetchFaqs();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const toggleVisibility = async (faq) => {
    try {
      await adminApi.updateFAQ(faq.id, { is_visible: !faq.is_visible });
      fetchFaqs();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const filteredFaqs = filterCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === filterCategory);

  const getCategoryLabel = (value) => {
    return categories.find(c => c.value === value)?.label || value;
  };

  return (
    <div data-testid="admin-faq">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl tracking-[0.1em] text-phileon-ivory">FAQ</h1>
          <p className="text-phileon-ivory-muted text-sm mt-1">Manage frequently asked questions</p>
        </div>
        <Button onClick={openCreateModal} className="btn-primary" data-testid="add-faq-btn">
          <Plus size={18} className="mr-2" /> Add FAQ
        </Button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48 bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredFaqs.length > 0 ? (
        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className={`bg-phileon-charcoal p-6 ${!faq.is_visible ? 'opacity-50' : ''}`}
              data-testid={`faq-row-${faq.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 bg-phileon-near-black text-phileon-gold">
                      {getCategoryLabel(faq.category)}
                    </span>
                    {!faq.is_visible && (
                      <span className="text-xs text-phileon-ivory-muted">Hidden</span>
                    )}
                  </div>
                  <h3 className="text-phileon-ivory mt-3 font-medium">
                    {faq.question}
                  </h3>
                  <p className="text-phileon-ivory-muted text-sm mt-2 line-clamp-2">
                    {faq.answer}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={faq.is_visible}
                    onCheckedChange={() => toggleVisibility(faq)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(faq)}
                    className="text-phileon-ivory-muted hover:text-phileon-gold"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(faq.id)}
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
          <p className="text-phileon-ivory-muted">No FAQs yet</p>
          <Button onClick={openCreateModal} className="btn-outline mt-4">
            Add First FAQ
          </Button>
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-phileon-near-black border-phileon-charcoal text-phileon-ivory max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl tracking-wider">
              {editingFaq ? 'Edit FAQ' : 'New FAQ'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                CATEGORY
              </label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                QUESTION *
              </label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                ANSWER *
              </label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                rows={5}
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
              />
              <span className="text-sm text-phileon-ivory-muted">Visible on site</span>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 btn-primary">
                {editingFaq ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFAQ;
