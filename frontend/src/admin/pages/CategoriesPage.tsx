import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { adminCategoryService, type AdminCategory } from '../services/categoryService';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await adminCategoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, category: AdminCategory) => {
    e.stopPropagation();
    setCategoryToDelete(category);
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await adminCategoryService.deleteCategory(categoryToDelete._id);
      setCategories(categories.filter(c => c._id !== categoryToDelete._id));
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete category', error);
      setDeleteError(error.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
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
    <div>
      <PageHeader
        title="Categories"
        actionButton={{
          label: 'Add Category',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => navigate('/admin/categories/new')
        }}
      />

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

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        error={deleteError}
        isLoading={isDeleting}
      />
    </div>
  );
}
