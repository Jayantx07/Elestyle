export interface AdminReview {
  _id: string;
  product: { _id: string; name: string };
  customerName: string;
  rating: number;
  comment: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

export const adminReviewService = {
  getReviews: async (): Promise<AdminReview[]> => {
    const res = await fetch('/api/v1/admin/reviews');
    if (!res.ok) throw new Error('Failed to fetch reviews');
    const json = await res.json();
    return json.data;
  },

  updateReviewStatus: async (id: string, status: 'Approved' | 'Rejected'): Promise<AdminReview> => {
    const res = await fetch(`/api/v1/admin/reviews/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update review status');
    const json = await res.json();
    return json.data;
  },

  deleteReview: async (id: string): Promise<void> => {
    const res = await fetch(`/api/v1/admin/reviews/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete review');
  }
};
