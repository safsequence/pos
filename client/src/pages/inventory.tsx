import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Search, Package, AlertTriangle, Edit, Plus, Minus } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  cost: string;
  stock: number;
  lowStockThreshold: number;
  sku?: string;
  barcode?: string;
  category?: {
    id: number;
    name: string;
  };
}

export default function Inventory() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockUpdate, setStockUpdate] = useState({
    stock: 0,
    adjustment: 0,
    adjustmentType: 'set', // 'set', 'add', 'subtract'
    reason: ''
  });
  
  // Check if user has admin/manager privileges for stock adjustments
  const canAdjustStock = user?.role === 'admin' || user?.role === 'manager';

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Stock update mutation
  const updateStockMutation = useMutation({
    mutationFn: async ({ productId, newStock }: { productId: number; newStock: number }) => {
      const res = await apiRequest("PUT", `/api/products/${productId}/stock`, {
        stock: newStock
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Stock updated successfully!",
      });
      setIsStockModalOpen(false);
      setSelectedProduct(null);
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update stock.",
      });
    }
  });

  const handleStockUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    let newStock = selectedProduct.stock;
    
    switch (stockUpdate.adjustmentType) {
      case 'set':
        newStock = stockUpdate.adjustment;
        break;
      case 'add':
        newStock = selectedProduct.stock + stockUpdate.adjustment;
        break;
      case 'subtract':
        newStock = Math.max(0, selectedProduct.stock - stockUpdate.adjustment);
        break;
    }

    updateStockMutation.mutate({
      productId: selectedProduct.id,
      newStock
    });
  };

  const openStockModal = (product: Product) => {
    setSelectedProduct(product);
    setStockUpdate({
      stock: product.stock,
      adjustment: 0,
      adjustmentType: 'set',
      reason: ''
    });
    setIsStockModalOpen(true);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockProducts = products.filter(product => 
    product.stock <= product.lowStockThreshold
  );

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
              <p className="text-gray-600">Monitor stock levels and manage inventory</p>
            </div>
            
            {/* Stock Alerts */}
            {lowStockProducts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                  <span className="text-sm font-medium text-amber-800">
                    {lowStockProducts.length} item{lowStockProducts.length !== 1 ? 's' : ''} low in stock
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Stock Overview ({filteredProducts.length} products)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Low Stock Alert
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          {products.length === 0 ? "No products in inventory" : "No products match your search."}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              {product.sku && <div className="text-sm text-gray-500">SKU: {product.sku}</div>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{product.category?.name || 'Uncategorized'}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium">{product.stock} units</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-600">{product.lowStockThreshold} units</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.stock <= 0 ? (
                              <Badge variant="destructive">Out of Stock</Badge>
                            ) : product.stock <= product.lowStockThreshold ? (
                              <Badge className="bg-amber-100 text-amber-800">Low Stock</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {canAdjustStock ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openStockModal(product)}
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Adjust Stock
                              </Button>
                            ) : (
                              <span className="text-gray-400 text-sm">View Only</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Stock Adjustment Modal */}
        <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adjust Stock - {selectedProduct?.name}</DialogTitle>
            </DialogHeader>
            
            {selectedProduct && (
              <form onSubmit={handleStockUpdate} className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Current Stock</div>
                  <div className="text-lg font-semibold">{selectedProduct.stock} units</div>
                </div>

                <div>
                  <Label htmlFor="adjustment-type">Adjustment Type</Label>
                  <Select 
                    value={stockUpdate.adjustmentType} 
                    onValueChange={(value) => setStockUpdate({...stockUpdate, adjustmentType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="set">Set to specific amount</SelectItem>
                      <SelectItem value="add">Add to current stock</SelectItem>
                      <SelectItem value="subtract">Remove from current stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="adjustment">
                    {stockUpdate.adjustmentType === 'set' ? 'New Stock Amount' : 'Adjustment Amount'}
                  </Label>
                  <Input
                    id="adjustment"
                    type="number"
                    min="0"
                    value={stockUpdate.adjustment}
                    onChange={(e) => setStockUpdate({...stockUpdate, adjustment: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Input
                    id="reason"
                    placeholder="e.g., Received shipment, Damaged goods, etc."
                    value={stockUpdate.reason}
                    onChange={(e) => setStockUpdate({...stockUpdate, reason: e.target.value})}
                  />
                </div>

                {/* Preview */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <strong>Preview:</strong> Stock will be updated to{' '}
                    <span className="font-semibold">
                      {stockUpdate.adjustmentType === 'set' 
                        ? stockUpdate.adjustment
                        : stockUpdate.adjustmentType === 'add'
                        ? selectedProduct.stock + stockUpdate.adjustment
                        : Math.max(0, selectedProduct.stock - stockUpdate.adjustment)
                      } units
                    </span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setIsStockModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="btn-primary" disabled={updateStockMutation.isPending}>
                    {updateStockMutation.isPending ? 'Updating...' : 'Update Stock'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}