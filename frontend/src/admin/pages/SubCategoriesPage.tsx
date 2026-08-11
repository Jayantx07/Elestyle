// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { adminSubCategoryService, type AdminSubCategory } from '../services/subCategoryService';
import { adminCategoryService, type AdminCategory } from '../services/categoryService';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { categoryKeys, subCategoryKeys } from '@/lib/queryKeys';

export default function SubCategoriesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AdminSubCategory | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: subCategories = [], isLoading: subsLoading } = useQuery({
    queryKey: subCategoryKeys.all,
    queryFn: () => adminSubCategoryService.getSubCategories(),
  });

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => adminCategoryService.getCategories(),
  });

  const loading = subsLoading || catsLoading;

  const handleDeleteClick = (e: React.MouseEvent, item: AdminSubCategory) => {
    e.stopPropagation();
    setItemToDelete(item);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminSubCategoryService.deleteSubCategory(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: subCategoryKeys.all });
      const previousSubs = queryClient.getQueryData<AdminSubCategory[]>(subCategoryKeys.all);
      queryClient.setQueryData<AdminSubCategory[]>(subCategoryKeys.all, (old) => 
        old ? old.filter(c => c._id !== deletedId) : []
      );
      setDeleteModalOpen(false);
      setItemToDelete(null);
      return { previousSubs };
    },
    onError: (error: any, _, context) => {
      if (context?.previousSubs) {
        queryClient.setQueryData(subCategoryKeys.all, context.previousSubs);
      }
      setDeleteError(error.message || 'Failed to delete subcategory');
      toast.error('Failed to delete subcategory');
    },
    onSuccess: () => toast.success('SubCategory deleted successfully'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: subCategoryKeys.all }),
  });

  const confirmDelete = () => {
    if (itemToDelete) deleteMutation.mutate(itemToDelete._id);
  };

  const reorderMutation = useMutation({
    mutationFn: (reorderPayload: any[]) => adminSubCategoryService.reorderSubCategories(reorderPayload),
    onMutate: async (reorderPayload) => {
      await queryClient.cancelQueries({ queryKey: subCategoryKeys.all });
      const previousSubs = queryClient.getQueryData<AdminSubCategory[]>(subCategoryKeys.all);
      // We already did the optimistic update in handleReorder, so we don't need to do it here again.
      return { previousSubs };
    },
    onError: (error, _, context) => {
      if (context?.previousSubs) queryClient.setQueryData(subCategoryKeys.all, context.previousSubs);
      toast.error('Failed to save order');
    },
    onSuccess: () => toast.success('Display order updated!'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: subCategoryKeys.all }),
  });

  const debounceTimer = React.useRef<NodeJS.Timeout>();

  const handleReorder = (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.stopPropagation();
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === subCategories.length - 1)) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // 1. Optimistic Update Immediately
    queryClient.setQueryData<AdminSubCategory[]>(subCategoryKeys.all, (old) => {
      if (!old) return [];
      const updated = [...old];
      const temp = updated[index];
      updated[index] = updated[newIndex];
      updated[newIndex] = temp;
      return updated;
    });

    // 2. Compute final payload based on the NEW state
    // We must read it from the optimistic cache or re-compute it
    const updatedPayload = [...subCategories];
    const tempPayload = updatedPayload[index];
    updatedPayload[index] = updatedPayload[newIndex];
    updatedPayload[newIndex] = tempPayload;
    const reorderPayload = updatedPayload.map((item, i) => ({ _id: item._id, displayOrder: i }));

    // 3. Debounce the network request
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      reorderMutation.mutate(reorderPayload);
    }, 1000);
  };

  const columns: Column<AdminSubCategory>[] = [
    {
      key: 'displayOrder',
      header: 'Order',
      render: (item) => {
        const index = subCategories.findIndex((c) => c._id === item._id);
        return (
          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
            <span className="w-6 text-xs font-semibold text-gray-500">{item.displayOrder}</span>
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
              disabled={index === subCategories.length - 1}
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
      header: 'SubCategory',
      render: (item) => (
        <div className="flex items-center">
          <div className="h-10 w-10 shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-200">
            {item.image || item.icon ? (
              <img src={item.image || item.icon} alt="" className="h-10 w-10 object-cover" />
            ) : (
              <div className="text-[10px] text-gray-400 font-medium">No Img</div>
            )}
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{item.name}</div>
            <div className="text-gray-500 text-xs font-mono">{item.slug}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Parent Category',
      render: (item) => {
        const catName = typeof item.category === 'object' ? item.category.name : 'Unknown';
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">{catName}</span>;
      }
    },
    {
      key: 'productCount',
      header: 'Products',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
          {item.productCount !== undefined ? `${item.productCount} items` : '0 items'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <div className="flex flex-col gap-1">
          <span className={`w-fit inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {item.isActive ? 'Active' : 'Inactive'}
          </span>
          {item.featured && (
            <span className="w-fit inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800">
              Featured ⭐
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/subcategories/${item._id}`);
            }}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => handleDeleteClick(e, item)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const filtered = subCategories.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || (typeof c.category === 'object' ? c.category._id : c.category) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-12">
      <PageHeader
        title="SubCategories"
        actionButton={{
          label: 'Add SubCategory',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => navigate(`/admin/subcategories/new${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`)
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
              <option value="all">🌐 All Categories ({subCategories.length})</option>
              {categories.map((cat) => {
                const count = subCategories.filter(sc => (typeof sc.category === 'object' ? sc.category._id : sc.category) === cat._id).length;
                return (
                  <option key={cat._id} value={cat._id}>
                    📁 {cat.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>
          <div className="text-xs text-gray-500">
            {selectedCategory === 'all' ? 'Showing subcategories across all collections. Select a category to isolate its subcategories.' : 'Filtered to selected collection.'}
          </div>
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-3 mb-6 text-xs text-amber-900 flex items-center justify-between">
        <span>💡 <strong>Pro Tip:</strong> Use the Up/Down order arrows to reorder how subcategory circular cards appear on store collection pages!</span>
        <span className="font-mono bg-white px-2 py-1 rounded border border-amber-200 text-[11px]">WF-05 Enterprise Architecture</span>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search subcategories by name or slug..."
        onRowClick={(item) => navigate(`/admin/subcategories/${item._id}`)}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete SubCategory"
        message={
          itemToDelete && (itemToDelete.productCount || 0) > 0
            ? `⚠️ WARNING: This SubCategory has ${itemToDelete.productCount} active products assigned! Deleting will orphan them. Are you sure you want to attempt deletion?`
            : `Are you sure you want to delete "${itemToDelete?.name}"?`
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        error={deleteError}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
