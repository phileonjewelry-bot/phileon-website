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
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';

const AdminCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true,
  });

  const fetchCollections = async () => {
    try {
      const response = await adminApi.getCollections();
      setCollections(response.data);
    } catch (error) {
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: editingCollection ? formData.slug : generateSlug(name),
    });
  };

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      display_order: collections.length,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image_url: collection.image_url,
      display_order: collection.display_order,
      is_active: collection.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCollection) {
        await adminApi.updateCollection(editingCollection.id, formData);
        toast.success('Collection updated');
      } else {
        await adminApi.createCollection(formData);
        toast.success('Collection created');
      }
      setModalOpen(false);
      fetchCollections();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      await adminApi.deleteCollection(id);
      toast.success('Collection deleted');
      fetchCollections();
    } catch (error) {
      toast.error('Failed to delete collection');
    }
  };

  const handleToggleActive = async (collection) => {
    try {
      await adminApi.updateCollection(collection.id, { is_active: !collection.is_active });
      fetchCollections();
    } catch (error) {
      toast.error('Failed to update collection');
    }
  };

  return (
    <div data-testid="admin-collections">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl tracking-[0.1em] text-phileon-ivory">Collections</h1>
          <p className="text-phileon-ivory-muted text-sm mt-1">Manage your jewelry collections</p>
        </div>
        <Button onClick={openCreateModal} className="btn-primary" data-testid="add-collection-btn">
          <Plus size={18} className="mr-2" /> Add Collection
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : collections.length > 0 ? (
        <div className="space-y-4">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-phileon-charcoal p-4 flex items-center gap-4"
              data-testid={`collection-row-${collection.id}`}
            >
              <GripVertical className="text-phileon-ivory-muted cursor-move" size={20} />
              
              <div className="w-16 h-16 bg-phileon-near-black flex-shrink-0">
                {collection.image_url && (
                  <img 
                    src={collection.image_url} 
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-phileon-ivory font-serif tracking-wider truncate">
                  {collection.name}
                </h3>
                <p className="text-phileon-ivory-muted text-xs mt-1">/{collection.slug}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={collection.is_active}
                  onCheckedChange={() => handleToggleActive(collection)}
                  data-testid={`toggle-${collection.id}`}
                />
                <span className="text-xs text-phileon-ivory-muted w-16">
                  {collection.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(collection)}
                  className="text-phileon-ivory-muted hover:text-phileon-gold"
                  data-testid={`edit-${collection.id}`}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(collection.id)}
                  className="text-phileon-ivory-muted hover:text-red-400"
                  data-testid={`delete-${collection.id}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-phileon-charcoal">
          <p className="text-phileon-ivory-muted">No collections yet</p>
          <Button onClick={openCreateModal} className="btn-outline mt-4">
            Create Your First Collection
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-phileon-near-black border-phileon-charcoal text-phileon-ivory max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl tracking-wider">
              {editingCollection ? 'Edit Collection' : 'New Collection'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                NAME *
              </label>
              <Input
                value={formData.name}
                onChange={handleNameChange}
                required
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
                data-testid="collection-name-input"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                SLUG *
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
                data-testid="collection-slug-input"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                DESCRIPTION
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory resize-none"
                data-testid="collection-description-input"
              />
            </div>
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">
                IMAGE URL
              </label>
              <Input
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
                data-testid="collection-image-input"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                data-testid="collection-active-toggle"
              />
              <span className="text-sm text-phileon-ivory-muted">Active (visible on site)</span>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 btn-primary" data-testid="save-collection-btn">
                {editingCollection ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCollections;
