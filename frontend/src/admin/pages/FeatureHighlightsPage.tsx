import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, GripVertical, AlertCircle, RefreshCw } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { adminFeatureHighlightService } from '../services/featureHighlightService';
import type { AdminFeatureHighlight } from '../services/featureHighlightService';
import { adminCategoryService } from '../services/categoryService';
import { FeatureHighlightFormModal } from '../components/feature-highlights/FeatureHighlightFormModal';
import { featureHighlightKeys, categoryKeys } from '@/lib/queryKeys';

// --- Sortable Row Component ---
const SortableRow = ({
  item,
  onEdit,
  onDelete,
  onToggleStatus,
  isStatusUpdating,
}: {
  item: AdminFeatureHighlight;
  onEdit: (item: AdminFeatureHighlight) => void;
  onDelete: (item: AdminFeatureHighlight) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  isStatusUpdating: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const badgeName = typeof item.category === 'object' && item.category ? item.category.name : 'None';

  return (
    <tr ref={setNodeRef} style={style} className={`bg-white border-b hover:bg-gray-50 ${isDragging ? 'shadow-lg relative' : ''}`}>
      <td className="px-6 py-4 w-10">
        <button className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
          <GripVertical className="w-5 h-5" />
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-16 w-12 rounded overflow-hidden bg-gray-100">
            <img className="h-full w-full object-cover" src={item.imageSrc} alt={item.altText || 'Highlight'} />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{item.altText || 'No Alt Text'}</div>
            <div className="text-sm text-gray-500">Order: {item.displayOrder}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {badgeName}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <button
          onClick={() => onToggleStatus(item._id, item.isActive)}
          disabled={isStatusUpdating}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            item.isActive ? 'bg-primary' : 'bg-gray-200'
          } ${isStatusUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              item.isActive ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end gap-3">
          <button
            onClick={() => onEdit(item)}
            className="text-gray-400 hover:text-primary transition-colors"
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function FeatureHighlightsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<AdminFeatureHighlight | null>(null);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [modalError, setModalError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: highlights = [], isLoading, isError } = useQuery({
    queryKey: featureHighlightKeys.lists(),
    queryFn: adminFeatureHighlightService.getAll,
  });

  const { data: categories = [] } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => adminCategoryService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminFeatureHighlightService.create(data, setUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureHighlightKeys.lists() });
      handleCloseModal();
    },
    onError: (error: any) => {
      setModalError(error.message || 'Failed to create highlight');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => adminFeatureHighlightService.update(id, data, setUploadProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureHighlightKeys.lists() });
      handleCloseModal();
    },
    onError: (error: any) => {
      setModalError(error.message || 'Failed to update highlight');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminFeatureHighlightService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureHighlightKeys.lists() });
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminFeatureHighlightService.updateStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureHighlightKeys.lists() });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: adminFeatureHighlightService.reorder,
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = highlights.findIndex((item) => item._id === active.id);
      const newIndex = highlights.findIndex((item) => item._id === over.id);
      
      const newItems = arrayMove(highlights, oldIndex, newIndex);
      
      queryClient.setQueryData(featureHighlightKeys.lists(), newItems);

      reorderMutation.mutate(
        newItems.map((item, index) => ({ _id: item._id, displayOrder: index + 1 })),
        {
          onError: () => queryClient.invalidateQueries({ queryKey: featureHighlightKeys.lists() })
        }
      );
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedItem(null);
    setUploadProgress(0);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AdminFeatureHighlight) => {
    setModalMode('edit');
    setSelectedItem(item);
    setUploadProgress(0);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setUploadProgress(0);
      setModalError(null);
      setSelectedItem(null);
    }, 200);
  };

  const handleSubmit = (data: any) => {
    setModalError(null);
    setUploadProgress(0);
    if (modalMode === 'create') {
      createMutation.mutate(data);
    } else if (selectedItem) {
      updateMutation.mutate({ id: selectedItem._id, data });
    }
  };

  const handleDelete = (item: AdminFeatureHighlight) => {
    if (window.confirm('Are you sure you want to delete this feature highlight? This will permanently remove the image from Cloudinary.')) {
      deleteMutation.mutate(item._id);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    statusMutation.mutate({ id, isActive: !currentStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Highlights</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the infinite product image carousel on the homepage.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Highlight
        </button>
      </div>

      {isError ? (
        <div className="rounded-lg bg-red-50 p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading feature highlights</h3>
            <div className="mt-2 text-sm text-red-700">Please check your connection and try again.</div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="w-10 px-6 py-3"></th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Badge Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
                        <p className="mt-4 text-sm text-gray-500">Loading highlights...</p>
                      </td>
                    </tr>
                  ) : highlights.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="text-sm text-gray-500">No feature highlights found. Create one to get started.</div>
                      </td>
                    </tr>
                  ) : (
                    <SortableContext items={highlights.map(h => h._id)} strategy={verticalListSortingStrategy}>
                      {highlights.map((item) => (
                        <SortableRow
                          key={item._id}
                          item={item}
                          onEdit={handleOpenEditModal}
                          onDelete={handleDelete}
                          onToggleStatus={handleToggleStatus}
                          isStatusUpdating={statusMutation.isPending && statusMutation.variables?.id === item._id}
                        />
                      ))}
                    </SortableContext>
                  )}
                </tbody>
              </table>
            </div>
          </DndContext>
        </div>
      )}

      <FeatureHighlightFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={selectedItem}
        categories={categories}
        isSaving={createMutation.isPending || updateMutation.isPending}
        uploadProgress={uploadProgress}
        error={modalError}
        onSubmit={handleSubmit}
        onClose={handleCloseModal}
      />
    </div>
  );
}
