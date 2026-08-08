import { apiClient } from '@/lib/apiClient';
export interface AdminReview {
  _id: string;
  product: { _id: string; name: string };
  customerName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  date: string;
}

export const adminReviewService = {
  getReviews: async (): Promise<AdminReview[]> => {
    const res = await apiClient('/api/v1/admin/reviews');
    const json = res;
    return json.data;
  },

  updateReviewStatus: async (id: string, status: 'approved' | 'rejected'): Promise<AdminReview> => {
    const res = await apiClient(`/api/v1/admin/reviews/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = res;
    return json.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    const res = await apiClient(`/api/v1/admin/reviews/${id}`, {
      method: 'DELETE'
    });
  },

  createReview: async (data: { product: string; customerName: string; rating: number; comment: string; }): Promise<AdminReview> => {
    // Actually we can hit the public endpoint but pretend we are auto-approving it since we're admin.
    // Or hit a specific admin endpoint if we created one.
    // Wait, the backend has POST /api/v1/products/:productId/reviews but the admin doesn't have an explicit create review route in backend.
    // Let's use the public one, and then immediately update it to Approved.
    const res = await apiClient(`/api/v1/products/${data.product}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: data.customerName,
        customerEmail: 'admin@elestyle.in',
        rating: data.rating,
        comment: data.comment
      })
    });
    const json = res;
    
    // Now approve it
    if (json.data && json.data._id) {
      await adminReviewService.updateReviewStatus(json.data._id, 'approved');
      json.data.status = 'approved';
    }
    
    return json.data;
  }
};
