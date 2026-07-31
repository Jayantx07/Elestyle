const API_URL = '/api/v1/cart';

export const cartService = {
  async getCart(accessToken: string) {
    const res = await fetch(`${API_URL}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.json();
  },

  async addToCart(data: { productId: string; quantity?: number; price?: number }, accessToken: string) {
    const res = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateQuantity(productId: string, quantity: number, accessToken: string) {
    const res = await fetch(`${API_URL}/${productId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ quantity }),
    });
    return res.json();
  },

  async removeFromCart(productId: string, accessToken: string) {
    const res = await fetch(`${API_URL}/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.json();
  },

  async clearCart(accessToken: string) {
    const res = await fetch(`${API_URL}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.json();
  },

  async mergeCart(localItems: { id: string; quantity: number; price: number }[], accessToken: string) {
    const res = await fetch(`${API_URL}/merge`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ localItems }),
    });
    return res.json();
  }
};
