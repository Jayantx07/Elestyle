import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { DataTable, type Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { adminReviewService, type AdminReview } from '../services/reviewService';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<AdminReview | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await adminReviewService.getReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleStatusChange = async (review: AdminReview, newStatus: 'Approved' | 'Rejected') => {
    try {
      await adminReviewService.updateReviewStatus(review._id, newStatus);
      setReviews(reviews.map(r => r._id === review._id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update review status');
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, review: AdminReview) => {
    e.stopPropagation();
    setReviewToDelete(review);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await adminReviewService.deleteReview(reviewToDelete._id);
      setReviews(reviews.filter(r => r._id !== reviewToDelete._id));
    } catch (error) {
      console.error('Failed to delete review', error);
    } finally {
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    }
  };

  const columns: Column<AdminReview>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (review) => <span className="font-medium text-gray-900">{review.product.name}</span>
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (review) => (
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      )
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (review) => <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">{review.comment}</p>
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (review) => review.customerName
    },
    {
      key: 'date',
      header: 'Date',
      render: (review) => new Date(review.date).toLocaleDateString()
    },
    {
      key: 'status',
      header: 'Status',
      render: (review) => (
        <StatusBadge 
          status={
            review.status === 'Approved' ? 'success' :
            review.status === 'Rejected' ? 'error' : 'warning'
          } 
          label={review.status} 
        />
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (review) => (
        <div className="flex space-x-2">
          {review.status !== 'Approved' && (
            <button
              onClick={() => handleStatusChange(review, 'Approved')}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Approve
            </button>
          )}
          {review.status !== 'Rejected' && (
            <button
              onClick={() => handleStatusChange(review, 'Rejected')}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium"
            >
              Reject
            </button>
          )}
          <button
            onClick={(e) => handleDeleteClick(e, review)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  const filteredReviews = reviews.filter(r => 
    r.product.name.toLowerCase().includes(search.toLowerCase()) || 
    r.customerName.toLowerCase().includes(search.toLowerCase()) ||
    r.comment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Reviews" />

      <DataTable
        data={filteredReviews}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={loading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by product, customer or comment..."
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
