import { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { adminInventoryService, type AdminInventoryItem } from '../services/inventoryService';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<AdminInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await adminInventoryService.getInventory();
      setInventory(data);
    } catch (error) {
      console.error('Failed to fetch inventory', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const startEdit = (item: AdminInventoryItem) => {
    setEditingId(item._id);
    setEditStock(item.stock);
  };

  const saveEdit = async (item: AdminInventoryItem) => {
    try {
      const updated = await adminInventoryService.updateStock(item._id, editStock);
      setInventory(inventory.map(i => i._id === item._id ? { ...i, stock: editStock, status: updated.status } : i));
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update stock', error);
      alert('Failed to update stock quantity');
    }
  };

  const columns: Column<AdminInventoryItem>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (item) => (
        <div>
          <div className="font-medium text-gray-900">{item.product.name}</div>
          <div className="text-gray-500 text-xs">{item.product.slug}</div>
        </div>
      )
    },
    {
      key: 'stock',
      header: 'Stock Quantity',
      render: (item) => {
        if (editingId === item._id) {
          return (
            <input
              type="number"
              min="0"
              value={editStock}
              onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
              className="block w-24 rounded-md border border-gray-300 shadow-sm sm:text-sm px-2 py-1 focus:border-primary focus:ring-primary outline-none"
              autoFocus
            />
          );
        }
        return <span className={item.stock < 5 ? 'text-red-600 font-semibold' : 'text-gray-900'}>{item.stock}</span>;
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge 
          status={
            item.status === 'In Stock' ? 'success' :
            item.status === 'Low Stock' ? 'warning' : 'error'
          } 
          label={item.status} 
        />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => {
        if (editingId === item._id) {
          return (
            <div className="flex space-x-2">
              <button onClick={() => saveEdit(item)} className="text-green-600 hover:text-green-800 text-sm font-medium">Save</button>
              <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-800 text-sm font-medium">Cancel</button>
            </div>
          );
        }
        return (
          <button
            onClick={() => startEdit(item)}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Update Stock
          </button>
        );
      }
    }
  ];

  const filteredInventory = inventory.filter(i => 
    i.product.name.toLowerCase().includes(search.toLowerCase()) || 
    i.product.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Inventory Management" />

      <DataTable
        data={filteredInventory}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products by name or slug..."
      />
    </div>
  );
}
