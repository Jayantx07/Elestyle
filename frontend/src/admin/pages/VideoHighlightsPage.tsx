import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { StatusBadge } from '../components/shared/StatusBadge';
import { adminCategoryService } from '../services/categoryService';
import {
  adminVideoHighlightService,
  type AdminVideoHighlight,
  type VideoHighlightFormData,
} from '../services/videoHighlightService';
import { videoHighlightKeys, categoryKeys } from '@/lib/queryKeys';
import { useAuth } from '@/contexts/AuthContext';
import { VideoHighlightFormModal } from '../components/video-highlights/VideoHighlightFormModal';

export default function VideoHighlightsPage() {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  const [search, setSearch] = useState('');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<AdminVideoHighlight | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [highlightToDelete, setHighlightToDelete] = useState<AdminVideoHighlight | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const canQuery = !!accessToken;

  const {
    data: highlights = [],
    isLoading: highlightsLoading,
    error: highlightsError,
  } = useQuery({
    queryKey: videoHighlightKeys.all,
    queryFn: () => adminVideoHighlightService.getAll(),
    enabled: canQuery,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => adminCategoryService.getCategories(),
  });

  const loading = highlightsLoading || categoriesLoading;
  const orderedHighlights = useMemo(() => [...highlights].sort((a, b) => a.displayOrder - b.displayOrder), [highlights]);

  const closeForm = () => {
    setFormOpen(false);
    setSelectedHighlight(null);
    setUploadProgress(0);
    setSaveError(null);
  };

  const openCreateForm = () => {
    setFormMode('create');
    setSelectedHighlight(null);
    setUploadProgress(0);
    setSaveError(null);
    setFormOpen(true);
  };

  const openEditForm = (highlight: AdminVideoHighlight) => {
    setFormMode('edit');
    setSelectedHighlight(highlight);
    setUploadProgress(0);
    setSaveError(null);
    setFormOpen(true);
  };

  const handleSave = async (payload: VideoHighlightFormData) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setUploadProgress(0);
      
      if (formMode === 'create') {
        await adminVideoHighlightService.create(payload, setUploadProgress);
        toast.success('Video highlight created successfully');
      } else {
        if (!selectedHighlight) throw new Error('Missing selected highlight');
        await adminVideoHighlightService.update(selectedHighlight._id, payload, setUploadProgress);
        toast.success('Video highlight updated successfully');
      }
      
      queryClient.invalidateQueries({ queryKey: videoHighlightKeys.all });
      closeForm();
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save video highlight');
      toast.error(error.message || 'Failed to save video highlight');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatusMutation = useMutation({
    mutationFn: async (highlight: AdminVideoHighlight) => {
      return adminVideoHighlightService.updateStatus(highlight._id, !highlight.isActive);
    },
    onMutate: async (highlight) => {
      await queryClient.cancelQueries({ queryKey: videoHighlightKeys.all });
      const previous = queryClient.getQueryData<AdminVideoHighlight[]>(videoHighlightKeys.all);
      queryClient.setQueryData<AdminVideoHighlight[]>(videoHighlightKeys.all, (current) =>
        current
          ? current.map((item) => (item._id === highlight._id ? { ...item, isActive: !item.isActive } : item))
          : []
      );
      return { previous };
    },
    onError: (_error, _highlight, context) => {
      if (context?.previous) {
        queryClient.setQueryData(videoHighlightKeys.all, context.previous);
      }
      toast.error('Failed to update status');
    },
    onSuccess: () => {
      toast.success('Status updated');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: videoHighlightKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminVideoHighlightService.delete(id);
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: videoHighlightKeys.all });
      const previous = queryClient.getQueryData<AdminVideoHighlight[]>(videoHighlightKeys.all);
      queryClient.setQueryData<AdminVideoHighlight[]>(videoHighlightKeys.all, (current) =>
        current ? current.filter((item) => item._id !== deletedId) : []
      );
      return { previous };
    },
    onError: (_error, _deletedId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(videoHighlightKeys.all, context.previous);
      }
      toast.error('Failed to delete video highlight');
    },
    onSuccess: () => {
      toast.success('Video highlight deleted successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: videoHighlightKeys.all });
      setDeleteModalOpen(false);
      setHighlightToDelete(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: { _id: string; displayOrder: number }[]) => {
      await adminVideoHighlightService.reorder(items);
    },
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: videoHighlightKeys.all });
      const previous = queryClient.getQueryData<AdminVideoHighlight[]>(videoHighlightKeys.all);
      queryClient.setQueryData<AdminVideoHighlight[]>(videoHighlightKeys.all, (current) => {
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
        queryClient.setQueryData(videoHighlightKeys.all, context.previous);
      }
      toast.error('Failed to update order');
    },
    onSuccess: () => {
      toast.success('Order updated');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: videoHighlightKeys.all });
    },
  });

  const handleDeleteClick = (highlight: AdminVideoHighlight) => {
    setHighlightToDelete(highlight);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!highlightToDelete) return;
    deleteMutation.mutate(highlightToDelete._id);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === orderedHighlights.length - 1)) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...orderedHighlights];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    const payload = updated.map((item, position) => ({ _id: item._id, displayOrder: position + 1 }));
    reorderMutation.mutate(payload);
  };

  const filteredHighlights = useMemo(() => {
    const normalized = search.toLowerCase();
    return orderedHighlights.filter((h) => {
      const categoryName = typeof h.category === 'object' && h.category ? h.category.name : '';
      return (
        h.title?.toLowerCase().includes(normalized) ||
        categoryName.toLowerCase().includes(normalized)
      );
    });
  }, [orderedHighlights, search]);

  useEffect(() => {
    if (highlightsError) {
      toast.error('Failed to load video highlights');
    }
  }, [highlightsError]);

  const columns: Column<AdminVideoHighlight>[] = [
    {
      key: 'posterUrl',
      header: 'Preview',
      render: (h) => (
        <div className="h-20 w-12 overflow-hidden rounded border border-gray-200 bg-black flex items-center justify-center relative">
          {h.posterUrl ? (
            <img src={h.posterUrl} alt={h.title || 'Video poster'} className="h-full w-full object-cover opacity-80" />
          ) : (
            <Film className="h-5 w-5 text-gray-500" />
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Caption / Title',
      render: (h) => (
        <div className="font-medium text-gray-900">{h.title || <span className="text-gray-400 italic">No caption</span>}</div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (h) => {
        const category = typeof h.category === 'object' ? h.category : null;
        return category ? (
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {category.name}
          </span>
        ) : (
          <span className="text-xs text-gray-400">None</span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (h) => (
        <div className="flex flex-col gap-2">
          <StatusBadge status={h.isActive ? 'success' : 'default'} label={h.isActive ? 'Active' : 'Inactive'} />
          <button
            type="button"
            onClick={() => toggleStatusMutation.mutate(h)}
            disabled={toggleStatusMutation.isPending}
            className="text-left text-xs font-semibold text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
          >
            {h.isActive ? 'Disable' : 'Enable'}
          </button>
        </div>
      ),
    },
    {
      key: 'displayOrder',
      header: 'Order',
      render: (h) => {
        const index = orderedHighlights.findIndex((item) => item._id === h._id);
        return (
          <div className="flex items-center gap-2">
            <span className="w-6 text-sm font-semibold text-gray-700">{h.displayOrder}</span>
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
                disabled={index === orderedHighlights.length - 1 || reorderMutation.isPending}
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
      key: 'actions',
      header: 'Actions',
      render: (h) => (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openEditForm(h)}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeleteClick(h)}
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
        title="Video Highlights"
        actionButton={{
          label: 'Add Highlight',
          icon: <Plus className="h-4 w-4" />,
          onClick: openCreateForm,
        }}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-600">
          Manage the short looping videos shown in the "IN MOTION" section on the storefront.
        </p>
      </div>

      {filteredHighlights.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center shadow-sm">
          <Film className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No video highlights yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Upload your first video to showcase products in motion.
          </p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Highlight
          </button>
        </div>
      ) : (
        <DataTable
          data={filteredHighlights}
          columns={columns}
          keyExtractor={(item) => item._id}
          isLoading={loading}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search videos..."
        />
      )}

      <VideoHighlightFormModal
        isOpen={formOpen}
        mode={formMode}
        categories={categories}
        initialData={selectedHighlight}
        isSaving={isSaving}
        uploadProgress={uploadProgress}
        error={saveError}
        onSubmit={handleSave}
        onClose={closeForm}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete this video highlight?"
        message={`This action cannot be undone. The video file will be permanently removed from storage.`}
        confirmLabel="Delete Video"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
        error={deleteMutation.isError ? deleteMutation.error.message || 'Failed to delete video' : null}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
