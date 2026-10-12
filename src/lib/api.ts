import {
  User,
  ProductListing,
  ExchangeProposal,
  Order,
  Review,
  Notification,
  PlatformStats,
  CartItem
} from '../types/index.js';

let currentUserId = 'usr_demo_customer';
try {
  const saved = localStorage.getItem('tl_user_id');
  if (saved) currentUserId = saved;
} catch {
  // localStorage may be inaccessible in sandboxed iframes
}

export function setCurrentUserId(userId: string) {
  currentUserId = userId;
  try {
    localStorage.setItem('tl_user_id', userId);
  } catch {
    // ignore iframe storage errors
  }
}

export function getCurrentUserId(): string {
  return currentUserId;
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId,
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorMsg = 'Network request failed';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errData.message || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const api = {
  // Stats & Config
  getStats: () => fetchJson<PlatformStats>('/api/stats'),
  getConfig: () => fetchJson<any>('/api/config'),

  // Auth & Users
  getUsers: () => fetchJson<User[]>('/api/auth/users'),
  getCurrentUser: () => fetchJson<User>('/api/auth/current'),
  login: (credentials: { email?: string; userId?: string }) =>
    fetchJson<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
  register: (data: Partial<User>) =>
    fetchJson<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateProfile: (data: Partial<User>) =>
    fetchJson<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Listings
  getListings: (filters?: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '') params.append(k, String(v));
      });
    }
    return fetchJson<ProductListing[]>(`/api/listings?${params.toString()}`);
  },
  getListingById: (id: string) => fetchJson<ProductListing>(`/api/listings/${id}`),
  createListing: (data: any) =>
    fetchJson<ProductListing>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateListing: (id: string, data: any) =>
    fetchJson<ProductListing>(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteListing: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/listings/${id}`, {
      method: 'DELETE'
    }),
  toggleLike: (id: string) =>
    fetchJson<{ likes: number; isLiked: boolean }>(`/api/listings/${id}/like`, {
      method: 'POST'
    }),

  // Cart & Wishlist
  getCart: () => fetchJson<CartItem[]>('/api/cart'),
  addToCart: (listingId: string) =>
    fetchJson<CartItem[]>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ listingId })
    }),
  removeFromCart: (listingId: string) =>
    fetchJson<CartItem[]>(`/api/cart/${listingId}`, {
      method: 'DELETE'
    }),
  clearCart: () =>
    fetchJson<{ success: boolean }>('/api/cart', {
      method: 'DELETE'
    }),
  getWishlist: () => fetchJson<ProductListing[]>('/api/wishlist'),

  // Exchanges
  getExchanges: () => fetchJson<ExchangeProposal[]>('/api/exchanges'),
  getExchangeById: (id: string) => fetchJson<ExchangeProposal>(`/api/exchanges/${id}`),
  createExchange: (data: {
    targetListingId: string;
    offeredListingId: string;
    cashDifference?: number;
    note?: string;
  }) =>
    fetchJson<ExchangeProposal>('/api/exchanges', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateExchangeStatus: (
    id: string,
    data: {
      status: string;
      counterOfferNote?: string;
      cashDifference?: number;
      carrier?: string;
      trackingNumber?: string;
    }
  ) =>
    fetchJson<ExchangeProposal>(`/api/exchanges/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Orders
  getOrders: () => fetchJson<Order[]>('/api/orders'),
  getOrderById: (id: string) => fetchJson<Order>(`/api/orders/${id}`),
  createOrder: (data: {
    listingId: string;
    shippingAddress: any;
    paymentMethod: string;
    couponCode?: string;
  }) =>
    fetchJson<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateOrderStatus: (id: string, data: { status: string; carrier?: string; trackingNumber?: string }) =>
    fetchJson<Order>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Coupons
  validateCoupon: (code: string, cartTotal: number) =>
    fetchJson<{ valid: boolean; code: string; discount: number; description: string }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, cartTotal })
    }),

  // Reviews
  getReviews: (userId: string) => fetchJson<Review[]>(`/api/reviews/${userId}`),
  createReview: (data: any) =>
    fetchJson<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Notifications
  getNotifications: () => fetchJson<Notification[]>('/api/notifications'),
  markNotificationRead: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT'
    }),
  markAllNotificationsRead: () =>
    fetchJson<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PUT'
    }),

  // Admin
  getAdminMetrics: () => fetchJson<PlatformStats>('/api/admin/metrics'),
  getAdminLogs: () => fetchJson<any[]>('/api/admin/logs'),
  updateAdminConfig: (data: any) =>
    fetchJson<any>('/api/admin/config', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  resetDatabase: () =>
    fetchJson<{ success: boolean; message: string }>('/api/admin/reset', {
      method: 'POST'
    })
};
