// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUp, ArrowDown, Sliders, Eye, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { adminFilterService, type AdminFilterConfiguration } from '../services/filterService';
import { adminCategoryService, type AdminCategory } from '../services/categoryService';
import toast from 'react-hot-toast';

export default function FiltersPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<AdminFilterConfiguration[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AdminFilterConfiguration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFilters = async () => {
    try {
      setLoading(true);
      const [fData, cData] = await Promise.all([
        adminFilterService.getFilters(),
        adminCategoryService.getCategories(),
      ]);
      setFilters(fData);
      setCategories(cData);
    } catch (error) {
      console.error('Failed to fetch filters', error);
      toast.error('Failed to load filter configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleReorder = async (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === filters.length - 1)) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...filters];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;

    const payload = updated.map((item, i) => {
      item.displayOrder = i + 1;
      return { _id: item._id, displayOrder: i + 1 };
    });

    setFilters(updated);
    try {
      await adminFilterService.reorderFilters(payload);
      toast.success('Filter order updated!');
    } catch (e) {
      toast.error('Failed to update filter sequence');
      fetchFilters();
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await adminFilterService.deleteFilter(itemToDelete._id);
      setFilters(filters.filter((f) => f._id !== itemToDelete._id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
      toast.success('Filter configuration deleted');
    } catch (e) {
      toast.error('Error deleting filter');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<AdminFilterConfiguration>[] = [
    {
      key: 'displayOrder',
      header: 'Order',
      render: (item) => {
        const index = filters.findIndex((f) => f._id === item._id);
        return (
          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            <span className="w-6 text-xs font-semibold text-gray-500">#{item.displayOrder}</span>
            <button
              onClick={(e) => handleReorder(e, index, 'up')}
              disabled={index === 0}
              className="p-1 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-20"
              title="Move Up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleReorder(e, index, 'down')}
              disabled={index === filters.length - 1}
              className="p-1 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-20"
              title="Move Down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Filter Name',
      render: (item) => (
        <div>
          <div className="font-semibold text-gray-900">{item.name}</div>
          <div className="text-xs font-mono text-gray-500">Key: {item.key}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'UI Control Type',
      render: (item) => {
        let bg = 'bg-blue-50 text-blue-800 border-blue-200';
        if (item.type === 'Color Swatch') bg = 'bg-pink-50 text-pink-800 border-pink-200';
        if (item.type === 'Price Range' || item.type === 'Numeric Range') bg = 'bg-green-50 text-green-800 border-green-200';
        return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${bg}`}>{item.type}</span>;
      },
    },
    {
      key: 'showProductCounts',
      header: 'Product Counts',
      render: (item) => (
        <span className={`inline-flex items-center text-xs font-medium ${item.showProductCounts ? 'text-emerald-600' : 'text-gray-400'}`}>
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          {item.showProductCounts ? 'Live Counts ON' : 'Hidden'}
        </span>
      ),
    },
    {
      key: 'enabled',
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${item.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.enabled && item.visible ? 'Visible & Active' : 'Disabled / Hidden'}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category Scope',
      render: (item: any) => {
        const catName = typeof item.category === 'object' && item.category ? item.category.name : (item.category ? categories.find(c => c._id === item.category)?.name : null);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${catName ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-indigo-50 text-indigo-800 border-indigo-200'}`}>
            {catName ? `📁 ${catName}` : '🌐 Global (All Collections)'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/filters/${item._id}`);
            }}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Configure
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setItemToDelete(item);
              setDeleteModalOpen(true);
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  const filtered = filters.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.key.toLowerCase().includes(search.toLowerCase());
    const itemCatId = typeof (f as any).category === 'object' && (f as any).category ? (f as any).category._id : (f as any).category;
    const matchesCategory = selectedCategory === 'all' || itemCatId === selectedCategory || (!itemCatId && selectedCategory !== 'all');
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-12">
      <PageHeader
        title="Dynamic Storefront Filters"
        actionButton={{
          label: 'Add Filter Config',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => navigate(`/admin/filters/new${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`),
        }}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Select Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md py-1.5 px-3 text-sm text-gray-800 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
            >
              <option value="all">🌐 All Collections & Global Filters</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  📁 {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-500">
            {selectedCategory === 'all' ? 'Showing all filter configurations. Select a collection to manage its specific sidebar filters.' : 'Showing filters applied to selected collection.'}
          </div>
        </div>
      </div>

      <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-3.5 mb-6 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-700 shrink-0" />
          <span><strong>Metadata-Driven Architecture:</strong> Control filter presentation, order, and live product count calculation on customer storefronts without writing code! Source of truth for option values always remains product attributes.</span>
        </div>
        <span className="font-mono bg-white px-2.5 py-1 rounded border border-blue-300 text-[10px] shrink-0 font-semibold">WF-05 Enterprise Spec</span>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search filter groups by name or attribute key..."
        onRowClick={(item) => navigate(`/admin/filters/${item._id}`)}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Remove Filter Group"
        message={`Are you sure you want to remove the "${itemToDelete?.name}" filter? It will no longer appear on customer collection pages.`}
        confirmLabel="Remove Filter"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
