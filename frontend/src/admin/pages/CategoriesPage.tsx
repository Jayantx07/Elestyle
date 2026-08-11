// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Table, Layers } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { CatalogTreeView } from '../components/shared/CatalogTreeView';
import { adminCategoryService, type AdminCategory } from '../services/categoryService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryKeys } from '@/lib/queryKeys';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);

  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => adminCategoryService.getCategories(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminCategoryService.deleteCategory(id),
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: categoryKeys.all });
      const previousCategories = queryClient.getQueryData<AdminCategory[]>(categoryKeys.all);
      if (previousCategories) {
        queryClient.setQueryData<AdminCategory[]>(
          categoryKeys.all,
          previousCategories.filter(c => c._id !== deletedId)
        );
      }
      return { previousCategories };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousCategories) {
        queryClient.setQueryData(categoryKeys.all, context.previousCategories);
      }
      console.error('Failed to delete category', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  });

  const handleDeleteClick = (e: React.MouseEvent, category: AdminCategory) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!categoryToDelete) return;
    deleteMutation.mutate(categoryToDelete._id);
  };

  const columns: Column<AdminCategory>[] = [
    {
      key: 'name',
      header: 'Category',
      render: (category) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
            {category.image ? (
              <img src={category.image} alt="" className="h-10 w-10 object-cover" />
            ) : (
              <div className="h-10 w-10 bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Img</div>
            )}
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{category.name}</div>
            <div className="text-gray-500 text-xs">{category.slug}</div>
          </div>
        </div>
      )
    },
    { key: 'description', header: 'Description' },
    {
      key: 'displayOrder',
      header: 'Display Order',
      render: (category) => <span className="font-mono text-sm bg-gray-100 px-2.5 py-1 rounded-md text-gray-700 font-semibold">{category.displayOrder || 0}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (category) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/categories/${category._id}`);
            }}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => handleDeleteClick(e, category)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalog Categories"
        actionButton={{
          label: 'Add Category',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => navigate('/admin/categories/new')
        }}
      />

      {/* Enterprise View Mode Tabs */}
      <div className="flex border-b border-gray-200 space-x-4 pb-1">
        <button
          onClick={() => setViewMode('table')}
          className={`flex items-center space-x-2 pb-3 px-3 border-b-2 font-medium text-sm transition-all ${
            viewMode === 'table'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Table List View</span>
        </button>
        <button
          onClick={() => setViewMode('tree')}
          className={`flex items-center space-x-2 pb-3 px-3 border-b-2 font-medium text-sm transition-all ${
            viewMode === 'tree'
              ? 'border-indigo-600 text-indigo-600 font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Hierarchy Tree View (Category → SubCategory → Products)</span>
        </button>
      </div>

      {viewMode === 'table' ? (
        <DataTable
          data={filteredCategories}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={loading}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search categories..."
          onRowClick={(item) => navigate(`/admin/categories/${item._id}`)}
        />
      ) : (
        <CatalogTreeView />
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        error={deleteMutation.isError ? deleteMutation.error.message || 'Failed to delete category' : null}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
