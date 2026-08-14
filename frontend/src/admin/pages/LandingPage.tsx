import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { StatusBadge } from '../components/shared/StatusBadge';
import { adminCategoryService } from '../services/categoryService';
import {
  adminLandingBannerService,
  type AdminLandingBanner,
  type LandingBannerPayload,
} from '../services/landingBannerService';
import { landingBannerKeys, categoryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/contexts/AuthContext';
import { LandingBannerFormModal } from '../components/landing-page/LandingBannerFormModal';

export default function LandingPage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  const [search, setSearch] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<AdminLandingBanner | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<AdminLandingBanner | null>(null);

  const canQuery = !!accessToken;

  const {
    data: banners = [],
    isLoading: bannersLoading,
    error: bannersError,
  } = useQuery({
    queryKey: landingBannerKeys.all,
    queryFn: () => adminLandingBannerService.getLandingBanners(accessToken as string),
    enabled: canQuery,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => adminCategoryService.getCategories(),
  });

  const loading = bannersLoading || categoriesLoading;
  const orderedBanners = useMemo(() => [...banners].sort((a, b) => a.displayOrder - b.displayOrder), [banners]);

  const closeForm = () => {
    setFormOpen(false);
    setSelectedBanner(null);
  };

  const openCreateForm = () => {
    setFormMode('create');
    setSelectedBanner(null);
    setFormOpen(true);
  };

  const openEditForm = (banner: AdminLandingBanner) => {
    setFormMode('edit');
    setSelectedBanner(banner);
    setFormOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: LandingBannerPayload) => {
      if (!accessToken) throw new Error('Missing access token');
      if (formMode === 'create') {
        return adminLandingBannerService.createLandingBanner(payload, accessToken);
      }
      if (!selectedBanner) throw new Error('Missing selected banner');
      return adminLandingBannerService.updateLandingBanner(selectedBanner._id, payload, accessToken);
    },
    onSuccess: (savedBanner) => {
      queryClient.invalidateQueries({ queryKey: landingBannerKeys.all });
      toast.success(formMode === 'create' ? 'Banner created successfully' : 'Banner updated successfully');
      closeForm();
      if (formMode === 'create') {
        const categoryId = typeof savedBanner.category === 'object' ? savedBanner.category._id : '';
        if (categoryId) {
          queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        }
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save banner');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (banner: AdminLandingBanner) => {
      if (!accessToken) throw new Error('Missing access token');
      return adminLandingBannerService.updateLandingBannerStatus(banner._id, !banner.isActive, accessToken);
    },
    onMutate: async (banner) => {
      await queryClient.cancelQueries({ queryKey: landingBannerKeys.all });
      const previous = queryClient.getQueryData<AdminLandingBanner[]>(landingBannerKeys.all);
      queryClient.setQueryData<AdminLandingBanner[]>(landingBannerKeys.all, (current) =>
        current
          ? current.map((item) => (item._id === banner._id ? { ...item, isActive: !item.isActive } : item))
          : []
      );
      return { previous };
    },
    onError: (_error, _banner, context) => {
      if (context?.previous) {
        queryClient.setQueryData(landingBannerKeys.all, context.previous);
      }
      toast.error('Failed to update banner status');
    },
    onSuccess: () => {
      toast.success('Banner status updated');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: landingBannerKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) throw new Error('Missing access token');
      await adminLandingBannerService.deleteLandingBanner(id, accessToken);
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: landingBannerKeys.all });
      const previous = queryClient.getQueryData<AdminLandingBanner[]>(landingBannerKeys.all);
      queryClient.setQueryData<AdminLandingBanner[]>(landingBannerKeys.all, (current) =>
        current ? current.filter((item) => item._id !== deletedId) : []
      );
      return { previous };
    },
    onError: (_error, _deletedId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(landingBannerKeys.all, context.previous);
      }
      toast.error('Failed to delete banner');
    },
    onSuccess: () => {
      toast.success('Banner deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: landingBannerKeys.all });
      setDeleteModalOpen(false);
      setBannerToDelete(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { _id: string; displayOrder: number }[]) => {
      if (!accessToken) throw new Error('Missing access token');
      await adminLandingBannerService.reorderLandingBanners(items, accessToken);
    },
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: landingBannerKeys.all });
      const previous = queryClient.getQueryData<AdminLandingBanner[]>(landingBannerKeys.all);
      queryClient.setQueryData<AdminLandingBanner[]>(landingBannerKeys.all, (current) => {
        if (!current) return [];
        const updated = current.map((item) => {
          const matched = items.find((next) => next._id === item._id);
          return matched ? { ...item, displayOrder: matched.displayOrder } : item;
        });
        return [...updated].sort((a, b) => a.displayOrder - b.displayOrder);
      });
      return { previous };
    },
    onError: (_error, _items, context) => {
      if (context?.previous) {
        queryClient.setQueryData(landingBannerKeys.all, context.previous);
      }
      toast.error('Failed to update banner order');
    },
    onSuccess: () => {
      toast.success('Banner order updated');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: landingBannerKeys.all });
    },
  });

  const handleSave = (payload: LandingBannerPayload) => {
    saveMutation.mutate(payload);
  };

  const handleDeleteClick = (banner: AdminLandingBanner) => {
    setBannerToDelete(banner);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!bannerToDelete) return;
    deleteMutation.mutate(bannerToDelete._id);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === orderedBanners.length - 1)) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...orderedBanners];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    const payload = updated.map((item, position) => ({ _id: item._id, displayOrder: position + 1 }));
    reorderMutation.mutate(payload);
  };

  const filteredBanners = useMemo(() => {
    const normalized = search.toLowerCase();
    return orderedBanners.filter((banner) => {
      const categoryName = typeof banner.category === 'object' && banner.category ? banner.category.name : '';
      return (
        (banner.title || '').toLowerCase().includes(normalized) ||
        (banner.subtitle || '').toLowerCase().includes(normalized) ||
        (categoryName || '').toLowerCase().includes(normalized)
      );
    });
  }, [orderedBanners, search]);

  useEffect(() => {
    if (bannersError) {
      toast.error('Failed to load landing banners');
    }
  }, [bannersError]);

  const columns: Column<AdminLandingBanner>[] = [
    {
      key: 'imageUrl',
      header: 'Preview',
      render: (banner) => (
        <div className="h-16 w-24 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
          <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (banner) => (
        <div>
          <div className="font-medium text-gray-900">{banner.title}</div>
          <div className="mt-1 text-xs text-gray-500">{banner.subtitle || 'No subtitle set'}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (banner) => {
        const category = typeof banner.category === 'object' ? banner.category : null;
        return category ? (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
            {category.name}
          </span>
        ) : (
          <span className="text-xs text-gray-400">Unassigned</span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (banner) => (
        <div className="flex flex-col gap-2">
          <StatusBadge status={banner.isActive ? 'success' : 'default'} label={banner.isActive ? 'Active' : 'Inactive'} />
          <button
            type="button"
            onClick={() => toggleStatusMutation.mutate(banner)}
            disabled={toggleStatusMutation.isPending}
            className="text-left text-xs font-semibold text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
          >
            {banner.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      ),
    },
    {
      key: 'displayOrder',
      header: 'Order',
      render: (banner) => {
        const index = orderedBanners.findIndex((item) => item._id === banner._id);
        return (
          <div className="flex items-center gap-2">
            <span className="w-6 text-sm font-semibold text-gray-700">{banner.displayOrder}</span>
            <div className="flex flex-col rounded-md border border-gray-200 bg-white">
              <button
                type="button"
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0 || reorderMutation.isPending}
                className="flex items-center justify-center border-b border-gray-200 px-2 py-1 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
                title="Move up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMove(index, 'down')}
                disabled={index === orderedBanners.length - 1 || reorderMutation.isPending}
                className="flex items-center justify-center px-2 py-1 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30"
                title="Move down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      },
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      render: (banner) =>
        banner.updatedAt ? new Date(banner.updatedAt).toLocaleDateString() : '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (banner) => (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openEditForm(banner)}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClick(banner)}
            className="text-sm font-medium text-red-600 transition-colors hover:text-red-800"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Landing Page"
        actionButton={{
          label: 'Add Banner',
          icon: <Plus className="h-4 w-4" />,
          onClick: openCreateForm,
        }}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-600">
          Manage the banners and content displayed on your storefront.
        </p>
      </div>

      {filteredBanners.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">No landing page banners yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Create your first banner to start customizing the storefront.
          </p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Banner
          </button>
        </div>
      ) : (
        <DataTable
          data={filteredBanners}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={loading}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search banners..."
        />
      )}

      <LandingBannerFormModal
        isOpen={formOpen}
        mode={formMode}
        categories={categories}
        initialBanner={selectedBanner}
        isSaving={saveMutation.isPending}
        error={saveMutation.isError ? saveMutation.error.message : null}
        onSubmit={handleSave}
        onClose={closeForm}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete this banner?"
        message={`This action cannot be undone.${bannerToDelete ? ` The banner "${bannerToDelete.title}" will be removed.` : ''}`}
        confirmLabel="Delete Banner"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        error={deleteMutation.isError ? deleteMutation.error.message || 'Failed to delete banner' : null}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}