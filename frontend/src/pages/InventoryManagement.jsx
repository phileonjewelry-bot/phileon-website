import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, TrendingDown, TrendingUp, Users, Mail, Settings } from 'lucide-react';
import axios from 'axios';
import StockBadge from '@/components/StockBadge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingProduct, setUpdatingProduct] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/products`);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = async (productId, newInventoryCount) => {
    if (newInventoryCount < 0) return;

    try {
      setUpdatingProduct(productId);
      const response = await axios.put(`${BACKEND_URL}/api/products/${productId}/inventory`, null, {
        params: { inventory_count: newInventoryCount }
      });

      // Update local state
      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, inventory_count: newInventoryCount, inventory_status: response.data.inventory_status }
          : product
      ));

      toast({
        title: 'Inventory Updated',
        description: `Inventory updated to ${newInventoryCount} units. Previous: ${response.data.previous_inventory}`,
      });

      // Show alert info if any alerts were triggered
      if (response.data.previous_inventory > 2 && newInventoryCount <= 2) {
        toast({
          title: 'LOW STOCK Alert Sent!',
          description: `Email alert triggered for crossing threshold (${response.data.previous_inventory} → ${newInventoryCount})`,
        });
      } else if (response.data.previous_inventory === 0 && newInventoryCount > 0) {
        toast({
          title: 'RESTOCK Alert Sent!',
          description: `Restock notification sent (0 → ${newInventoryCount})`,
        });
      }

    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inventory',
        variant: 'destructive'
      });
    } finally {
      setUpdatingProduct(null);
    }
  };

  const getRestockList = async (productId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/restock/product/${productId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching restock list:', error);
      return [];
    }
  };

  const notifyRestockList = async (productId) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/restock/notify/${productId}`);
      toast({
        title: 'Restock Notifications Sent!',
        description: `${response.data.notifications_sent} customers notified about ${response.data.product_name}`,
      });
    } catch (error) {
      console.error('Error sending restock notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to send restock notifications',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">DROP MODE Inventory Management</h1>
          <p className="text-gray-300">
            Manage inventory levels and test DROP MODE alerts. Threshold = 2 by default.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Products</p>
                  <p className="text-2xl font-bold text-white">{products.length}</p>
                </div>
                <Package className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Sold Out</p>
                  <p className="text-2xl font-bold text-red-500">
                    {products.filter(p => (p.inventory_count || 0) === 0).length}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Low Stock</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {products.filter(p => {
                      const inv = p.inventory_count || 0;
                      const threshold = p.low_stock_threshold || 2;
                      return inv > 0 && inv <= threshold;
                    }).length}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">In Stock</p>
                  <p className="text-2xl font-bold text-green-500">
                    {products.filter(p => (p.inventory_count || 0) > (p.low_stock_threshold || 2)).length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {products.map((product) => {
            const inventoryCount = product.inventory_count || 0;
            const lowStockThreshold = product.low_stock_threshold || 2;
            const inventoryStatus = product.inventory_status || {};

            return (
              <Card key={product.id} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg line-clamp-2">
                        {product.name}
                      </CardTitle>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                        {product.materials?.join(' · ') || 'No materials specified'}
                      </p>
                    </div>
                    <StockBadge
                      inventoryCount={inventoryCount}
                      lowStockThreshold={lowStockThreshold}
                      className="ml-2"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Status */}
                  <div className="bg-gray-800 rounded p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Stock:</span>
                      <span className="text-white font-semibold">{inventoryCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Threshold:</span>
                      <span className="text-white">{lowStockThreshold}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className={
                        inventoryStatus.status === 'sold_out' ? 'text-red-500' :
                        inventoryStatus.status === 'low_stock' ? 'text-orange-500' :
                        'text-green-500'
                      }>
                        {inventoryStatus.message || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Inventory Controls */}
                  <div>
                    <Label className="text-gray-300 text-sm">Update Inventory</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={() => updateInventory(product.id, Math.max(0, inventoryCount - 1))}
                        disabled={updatingProduct === product.id || inventoryCount <= 0}
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        -1
                      </Button>
                      <Input
                        type="number"
                        value={inventoryCount}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          if (newValue >= 0 && newValue !== inventoryCount) {
                            updateInventory(product.id, newValue);
                          }
                        }}
                        className="bg-gray-800 border-gray-700 text-white text-center"
                        min="0"
                      />
                      <Button
                        onClick={() => updateInventory(product.id, inventoryCount + 1)}
                        disabled={updatingProduct === product.id}
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        +1
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateInventory(product.id, 0)}
                      disabled={updatingProduct === product.id}
                      size="sm"
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Set Sold Out
                    </Button>
                    <Button
                      onClick={() => updateInventory(product.id, 5)}
                      disabled={updatingProduct === product.id}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Restock (5)
                    </Button>
                  </div>

                  {/* Restock List Actions */}
                  {inventoryCount === 0 && (
                    <div className="bg-red-900/20 border border-red-800 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-red-300 text-sm font-medium">Sold Out Actions</span>
                        <Users className="w-4 h-4 text-red-400" />
                      </div>
                      <Button
                        onClick={() => notifyRestockList(product.id)}
                        size="sm"
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Notify Restock List
                      </Button>
                    </div>
                  )}

                  {/* Alert Status */}
                  {product.low_stock_alert_sent && (
                    <div className="bg-orange-900/20 border border-orange-800 rounded p-2">
                      <p className="text-orange-300 text-xs">
                        ⚠️ Low stock alert sent
                      </p>
                    </div>
                  )}

                  {updatingProduct === product.id && (
                    <div className="flex items-center justify-center py-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500 mr-2"></div>
                      <span className="text-yellow-500 text-sm">Updating...</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* DROP MODE Testing Guide */}
        <Card className="mt-8 bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-yellow-500" />
              DROP MODE Testing Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-3">
            <div>
              <strong className="text-white">Email Alerts:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>LOW STOCK alert sends when crossing from >2 to ≤2 (e.g., 3→2)</li>
                <li>RESTOCK alert sends when going from 0 to any positive number</li>
                <li>No spam: won't re-send low stock until inventory goes above threshold</li>
              </ul>
            </div>
            <div>
              <strong className="text-white">UI Behavior:</strong>
              <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                <li>SOLD OUT (0): Red badge, "Join Restock List" button, kept visible for hype</li>
                <li>LOW STOCK (1-2): Orange pulsing badge, "Only X left!" warning</li>
                <li>IN STOCK (>2): Green badge, normal "Add to Cart" button</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryManagement;