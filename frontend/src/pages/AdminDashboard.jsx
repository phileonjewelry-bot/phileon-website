import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Trash2, Save, Image as ImageIcon, Users, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import { products, customerPhotos } from '../data/mockData';

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  // Product Management State
  const [productList, setProductList] = useState(products);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'necklaces',
    price: '',
    description: '',
    material: '',
    weight: '',
    certification: '',
    images: [],
    videos: []
  });

  // Customer Photos State
  const [customerPhotosList, setCustomerPhotosList] = useState(customerPhotos);
  const [newCustomerPhoto, setNewCustomerPhoto] = useState({
    customerName: '',
    productName: '',
    location: '',
    image: null
  });

  // Drag and Drop Handlers for Product Images
  const handleProductImageDrop = (e, isNewProduct = true) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleProductImageFiles(files, isNewProduct);
  };

  const handleProductImageFiles = (files, isNewProduct = true) => {
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target.result;
          if (isNewProduct) {
            setNewProduct(prev => ({
              ...prev,
              images: [...prev.images, imageUrl]
            }));
          } else if (editingProduct) {
            setEditingProduct(prev => ({
              ...prev,
              images: [...prev.images, imageUrl]
            }));
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Drag and Drop for Customer Photos
  const handleCustomerPhotoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewCustomerPhoto(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save New Product
  const saveNewProduct = () => {
    if (!newProduct.name || !newProduct.price || newProduct.images.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in name, price and upload at least one image.',
      });
      return;
    }

    const product = {
      ...newProduct,
      id: `${Date.now()}`,
      price: parseFloat(newProduct.price),
      inStock: true,
      bestseller: false,
      rating: 4.5,
      reviews: 0
    };

    setProductList([...productList, product]);
    // Save to localStorage for persistence
    const allProducts = [...productList, product];
    localStorage.setItem('adminProducts', JSON.stringify(allProducts));

    toast({
      title: 'Product Added',
      description: `${product.name} has been added successfully.`,
    });

    // Reset form
    setNewProduct({
      name: '',
      category: 'necklaces',
      price: '',
      description: '',
      material: '',
      weight: '',
      certification: '',
      images: []
    });
  };

  // Save Customer Photo
  const saveCustomerPhoto = () => {
    if (!newCustomerPhoto.customerName || !newCustomerPhoto.image) {
      toast({
        title: 'Missing Information',
        description: 'Please enter customer name and upload an image.',
      });
      return;
    }

    const photo = {
      ...newCustomerPhoto,
      id: `c${Date.now()}`
    };

    setCustomerPhotosList([...customerPhotosList, photo]);
    localStorage.setItem('adminCustomerPhotos', JSON.stringify([...customerPhotosList, photo]));

    toast({
      title: 'Customer Photo Added',
      description: 'Customer photo has been added successfully.',
    });

    setNewCustomerPhoto({
      customerName: '',
      productName: '',
      location: '',
      image: null
    });
  };

  // Delete Product
  const deleteProduct = (id) => {
    const updated = productList.filter(p => p.id !== id);
    setProductList(updated);
    localStorage.setItem('adminProducts', JSON.stringify(updated));
    toast({
      title: 'Product Deleted',
      description: 'Product has been removed.',
    });
  };

  // Delete Customer Photo
  const deleteCustomerPhoto = (id) => {
    const updated = customerPhotosList.filter(p => p.id !== id);
    setCustomerPhotosList(updated);
    localStorage.setItem('adminCustomerPhotos', JSON.stringify(updated));
    toast({
      title: 'Photo Deleted',
      description: 'Customer photo has been removed.',
    });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
              <p className="text-black/80 mt-1">Manage your products and customer gallery</p>
            </div>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-yellow-500"
            >
              View Store
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-900 border border-gray-800 mb-8">
            <TabsTrigger value="products" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="customer-photos" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black">
              <Users className="w-4 h-4 mr-2" />
              Customer Photos
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add New Product Form */}
              <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-6 h-6 text-yellow-500" />
                    Add New Product
                  </h2>

                  <div className="space-y-4">
                    {/* Image Upload Area */}
                    <div>
                      <Label className="text-gray-300 mb-2 block">Product Images</Label>
                      <div
                        onDrop={(e) => handleProductImageDrop(e, true)}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-yellow-500 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('product-image-input').click()}
                      >
                        <Upload className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm mb-1">Drag & drop images here</p>
                        <p className="text-gray-600 text-xs">or click to browse</p>
                        <input
                          id="product-image-input"
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleProductImageFiles(Array.from(e.target.files), true)}
                        />
                      </div>
                      {newProduct.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                          {newProduct.images.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img src={img} alt="Product" className="w-full h-20 object-cover rounded" />
                              <button
                                onClick={() => setNewProduct(prev => ({
                                  ...prev,
                                  images: prev.images.filter((_, i) => i !== idx)
                                }))}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="name" className="text-gray-300 mb-2 block">Product Name</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="e.g., Diamond Ring"
                      />
                    </div>

                    <div>
                      <Label htmlFor="category" className="text-gray-300 mb-2 block">Category</Label>
                      <select
                        id="category"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2"
                      >
                        <option value="necklaces">Necklaces</option>
                        <option value="rings">Rings</option>
                        <option value="bracelets">Bracelets</option>
                        <option value="earrings">Earrings</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="price" className="text-gray-300 mb-2 block">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="1299.99"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-gray-300 mb-2 block">Description</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Elegant gold necklace..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="material" className="text-gray-300 mb-2 block">Material</Label>
                      <Input
                        id="material"
                        value={newProduct.material}
                        onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="18K Yellow Gold"
                      />
                    </div>

                    <div>
                      <Label htmlFor="weight" className="text-gray-300 mb-2 block">Weight</Label>
                      <Input
                        id="weight"
                        value={newProduct.weight}
                        onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="12.5g"
                      />
                    </div>

                    <div>
                      <Label htmlFor="certification" className="text-gray-300 mb-2 block">Certification</Label>
                      <Input
                        id="certification"
                        value={newProduct.certification}
                        onChange={(e) => setNewProduct({ ...newProduct, certification: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="GIA Certified"
                      />
                    </div>

                    <Button
                      onClick={saveNewProduct}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Product
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Product List */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-white mb-6">All Products ({productList.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {productList.map(product => (
                    <Card key={product.id} className="bg-gray-900 border-gray-800">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                            <p className="text-yellow-500 font-bold mb-1">${product.price.toFixed(2)}</p>
                            <p className="text-gray-400 text-xs mb-2">{product.category}</p>
                            <Button
                              onClick={() => deleteProduct(product.id)}
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Customer Photos Tab */}
          <TabsContent value="customer-photos">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Customer Photo Form */}
              <Card className="bg-gray-900 border-gray-800 lg:col-span-1">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Plus className="w-6 h-6 text-yellow-500" />
                    Add Customer Photo
                  </h2>

                  <div className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <Label className="text-gray-300 mb-2 block">Customer Photo</Label>
                      <div
                        onDrop={handleCustomerPhotoDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-yellow-500 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('customer-photo-input').click()}
                      >
                        {newCustomerPhoto.image ? (
                          <img src={newCustomerPhoto.image} alt="Preview" className="w-full h-48 object-cover rounded mb-3" />
                        ) : (
                          <>
                            <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm mb-1">Drag & drop photo here</p>
                            <p className="text-gray-600 text-xs">or click to browse</p>
                          </>
                        )}
                        <input
                          id="customer-photo-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setNewCustomerPhoto(prev => ({ ...prev, image: e.target.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="customerName" className="text-gray-300 mb-2 block">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={newCustomerPhoto.customerName}
                        onChange={(e) => setNewCustomerPhoto({ ...newCustomerPhoto, customerName: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="e.g., Sarah M."
                      />
                    </div>

                    <div>
                      <Label htmlFor="productName" className="text-gray-300 mb-2 block">Product Name</Label>
                      <Input
                        id="productName"
                        value={newCustomerPhoto.productName}
                        onChange={(e) => setNewCustomerPhoto({ ...newCustomerPhoto, productName: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="e.g., Diamond Ring"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-gray-300 mb-2 block">Location</Label>
                      <Input
                        id="location"
                        value={newCustomerPhoto.location}
                        onChange={(e) => setNewCustomerPhoto({ ...newCustomerPhoto, location: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="e.g., New York, USA"
                      />
                    </div>

                    <Button
                      onClick={saveCustomerPhoto}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Photo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Photos Gallery */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-white mb-6">Customer Gallery ({customerPhotosList.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {customerPhotosList.map(photo => (
                    <Card key={photo.id} className="bg-gray-900 border-gray-800 group relative overflow-hidden">
                      <CardContent className="p-0">
                        <img
                          src={photo.image}
                          alt={photo.customerName}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <p className="text-white font-semibold">{photo.customerName}</p>
                          <p className="text-yellow-500 text-sm">{photo.productName}</p>
                          <p className="text-gray-400 text-xs">{photo.location}</p>
                          <Button
                            onClick={() => deleteCustomerPhoto(photo.id)}
                            size="sm"
                            variant="outline"
                            className="mt-3 w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;