import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { adminProductService, type AdminProduct } from '../services/productService';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<AdminProduct | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminProductService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, product: AdminProduct) => {
    e.stopPropagation();
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await adminProductService.deleteProduct(productToDelete._id);
      // Optimistic update
      setProducts(products.filter(p => p._id !== productToDelete._id));
    } catch (error) {
      console.error('Failed to delete product', error);
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const columns: Column<AdminProduct>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (product) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img src={product.images[0].secure_url || product.images[0].previewUrl} alt="" className="h-10 w-10 object-cover" />
            ) : (
              <div className="h-10 w-10 bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Img</div>
            )}
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{product.name}</div>
            <div className="text-gray-500 text-xs">{product.slug}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'category', 
      header: 'Category',
      render: (product) => {
        // category can be populated object or just ID
        if (typeof product.category === 'object' && product.category !== null) {
          return (product.category as any).name || 'Unknown';
        }
        return typeof product.category === 'string' ? product.category : 'Unknown';
      }
    },
    {
      key: 'price',
      header: 'Price',
      render: (product) => `$${product.price.toFixed(2)}`
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (product) => (
        <span className={`${product.stock < 10 ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
          {product.stock}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (product) => (
        <StatusBadge 
          status={product.status === 'active' ? 'success' : 'default'} 
          label={product.status} 
        />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/${product._id}`);
            }}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => handleDeleteClick(e, product)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const filteredProducts = products.filter(p => {
    const searchLower = search.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(searchLower);
    
    // Safely check category name
    let categoryName = '';
    if (typeof p.category === 'object' && p.category !== null) {
      categoryName = (p.category as any).name || '';
    } else if (typeof p.category === 'string') {
      categoryName = p.category;
    }
    const categoryMatch = categoryName.toLowerCase().includes(searchLower);

    return nameMatch || categoryMatch;
  });

  return (
    <div>
      <PageHeader
        title="Products"
        actionButton={{
          label: 'Add Product',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => navigate('/admin/products/new')
        }}
      />

      <DataTable
        data={filteredProducts}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products..."
        onRowClick={(item) => navigate(`/admin/products/${item._id}`)}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action will set the product status to inactive (soft delete).`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
