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
import { Plus, Pencil, Trash2, Star, X } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCollection, setFilterCollection] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    collection_id: '',
    images: [],
    materials: [],
    price_range: '',
    availability: 'inquiry_only',
    is_featured: false,
    is_visible: true,
    display_order: 0,
    details: {},
  });
  const [newImage, setNewImage] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  const fetchData = async () => {
    try {
      const [productsRes, collectionsRes] = await Promise.all([
        adminApi.getProducts(),
        adminApi.getCollections(),
      ]);
      setProducts(productsRes.data);
      setCollections(collectionsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: editingProduct ? formData.slug : generateSlug(name),
    });
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      short_description: '',
      collection_id: collections[0]?.id || '',
      images: [],
      materials: [],
      price_range: '',
      availability: 'inquiry_only',
      is_featured: false,
      is_visible: true,
      display_order: products.length,
      details: {},
    });
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.short_description || '',
      collection_id: product.collection_id,
      images: product.images || [],
      materials: product.materials || [],
      price_range: product.price_range || '',
      availability: product.availability,
      is_featured: product.is_featured,
      is_visible: product.is_visible,
      display_order: product.display_order,
      details: product.details || {},
    });
    setModalOpen(true);
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImage.trim()] });
      setNewImage('');
    }
  };

  const removeImage = (idx) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) });
  };

  const addMaterial = () => {
    if (newMaterial.trim()) {
      setFormData({ ...formData, materials: [...formData.materials, newMaterial.trim()] });
      setNewMaterial('');
    }
  };

  const removeMaterial = (idx) => {
    setFormData({ ...formData, materials: formData.materials.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, formData);
        toast.success('Product updated');
      } else {
        await adminApi.createProduct(formData);
        toast.success('Product created');
      }
      setModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success('Product deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const toggleFeatured = async (product) => {
    try {
      await adminApi.updateProduct(product.id, { is_featured: !product.is_featured });
      fetchData();
    } catch (error) {
      toast.error('Failed to update product');
    }
  };

  const filteredProducts = filterCollection === 'all' 
    ? products 
    : products.filter(p => p.collection_id === filterCollection);

  const getCollectionName = (id) => {
    return collections.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <div data-testid="admin-products">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl tracking-[0.1em] text-phileon-ivory">Products</h1>
          <p className="text-phileon-ivory-muted text-sm mt-1">Manage your jewelry pieces</p>
        </div>
        <Button onClick={openCreateModal} className="btn-primary" data-testid="add-product-btn">
          <Plus size={18} className="mr-2" /> Add Product
        </Button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Select value={filterCollection} onValueChange={setFilterCollection}>
          <SelectTrigger className="w-48 bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory">
            <SelectValue placeholder="Filter by collection" />
          </SelectTrigger>
          <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
            <SelectItem value="all">All Collections</SelectItem>
            {collections.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" />
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-phileon-charcoal overflow-hidden"
              data-testid={`product-card-${product.id}`}
            >
              <div className="aspect-square bg-phileon-near-black relative">
                {product.images?.[0] ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-phileon-ivory-muted">
                    No Image
                  </div>
                )}
                {product.is_featured && (
                  <div className="absolute top-2 right-2 bg-phileon-gold p-1">
                    <Star size={14} className="text-phileon-black" />
                  </div>
                )}
                {!product.is_visible && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-phileon-ivory text-sm">Hidden</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-serif text-phileon-ivory tracking-wider truncate">
                  {product.name}
                </h3>
                <p className="text-phileon-ivory-muted text-xs mt-1">
                  {getCollectionName(product.collection_id)}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs px-2 py-1 ${
                    product.availability === 'available' 
                      ? 'bg-green-900/30 text-green-400' 
                      : product.availability === 'made_to_order'
                      ? 'bg-phileon-gold/20 text-phileon-gold'
                      : 'bg-phileon-near-black text-phileon-ivory-muted'
                  }`}>
                    {product.availability === 'available' && 'Available'}
                    {product.availability === 'made_to_order' && 'Made to Order'}
                    {product.availability === 'inquiry_only' && 'Inquiry Only'}
                  </span>
                  {product.price_range && (
                    <span className="text-phileon-gold text-xs">{product.price_range}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-phileon-near-black">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFeatured(product)}
                    className={`flex-1 ${product.is_featured ? 'text-phileon-gold' : 'text-phileon-ivory-muted'}`}
                  >
                    <Star size={14} className="mr-1" /> Featured
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(product)}
                    className="text-phileon-ivory-muted hover:text-phileon-gold"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-phileon-ivory-muted hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-phileon-charcoal">
          <p className="text-phileon-ivory-muted">No products yet</p>
          <Button onClick={openCreateModal} className="btn-outline mt-4">
            Add Your First Product
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-phileon-near-black border-phileon-charcoal text-phileon-ivory max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl tracking-wider">
              {editingProduct ? 'Edit Product' : 'New Product'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">NAME *</label>
                <Input
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                  className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">SLUG *</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">COLLECTION *</label>
                <Select 
                  value={formData.collection_id} 
                  onValueChange={(value) => setFormData({ ...formData, collection_id: value })}
                  required
                >
                  <SelectTrigger className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory">
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
                    {collections.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">AVAILABILITY</label>
                <Select 
                  value={formData.availability} 
                  onValueChange={(value) => setFormData({ ...formData, availability: value })}
                >
                  <SelectTrigger className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-phileon-charcoal border-phileon-charcoal">
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="made_to_order">Made to Order</SelectItem>
                    <SelectItem value="inquiry_only">Inquiry Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">SHORT DESCRIPTION</label>
              <Input
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">FULL DESCRIPTION</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory resize-none"
              />
            </div>

            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">PRICE RANGE</label>
              <Input
                value={formData.price_range}
                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                placeholder="e.g., $5,000 - $15,000"
                className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">IMAGES</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="Image URL"
                  className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
                />
                <Button type="button" onClick={addImage} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="" className="w-16 h-16 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Materials */}
            <div>
              <label className="block text-xs tracking-wider text-phileon-ivory-muted mb-2">MATERIALS</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="e.g., 18K Gold"
                  className="bg-phileon-charcoal border-phileon-charcoal text-phileon-ivory"
                />
                <Button type="button" onClick={addMaterial} variant="outline" size="sm">
                  Add
                </Button>
              </div>
              {formData.materials.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.materials.map((mat, idx) => (
                    <span key={idx} className="bg-phileon-charcoal px-3 py-1 text-sm flex items-center gap-2">
                      {mat}
                      <button type="button" onClick={() => removeMaterial(idx)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
