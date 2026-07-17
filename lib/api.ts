export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const API_URL = typeof window !== 'undefined' ? '/api/v1' : `${BACKEND_URL}/api/v1`;

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  parent_id: number;
  position: number;
  childes?: Category[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  unit: string;
  unit_price: number;
  purchase_price: number;
  tax: number;
  discount: number;
  discount_type: string;
  current_stock: number;
  thumbnail: string;
  rating?: {
    average: number;
    count: number;
  }[];
}

export interface Brand {
  id: number;
  name: string;
  image: string;
}

export interface CustomerLogin {
  login_option?: {
    manual_login?: number | boolean;
    otp_login?: number | boolean;
    social_login?: number | boolean;
  };
  social_media_login_options?: {
    google?: number | boolean;
    facebook?: number | boolean;
    apple?: number | boolean;
  };
}

export interface Recaptcha {
  site_key?: string;
  status?: number | boolean;
}

export interface AuthResponse {
  token?: string;
  temporary_token?: string;
  status?: boolean;
  phone?: string;
  email?: string;
  is_phone_verified?: boolean;
  is_email_verified?: boolean;
  message?: string;
  errors?: { code?: string; message?: string }[];
}

export interface CustomerInfo {
  id: number;
  f_name: string;
  l_name: string;
  phone?: string;
  email?: string;
  image?: string;
  is_phone_verified?: boolean;
  is_email_verified?: boolean;
  orders_count?: number;
  referral_user_count?: number;
  [key: string]: any;
}

export interface OrderDetail {
  id?: number;
  qty?: number;
  price?: number;
  discount?: number;
  product?: {
    name?: string;
    thumbnail?: string;
    image?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface Order {
  id: number;
  order_status?: string;
  payment_status?: string;
  order_amount?: number | string;
  created_at?: string;
  details?: OrderDetail[];
  [key: string]: any;
}

export interface OrderListResponse {
  total_size: number;
  limit: number;
  offset: number;
  orders: Order[];
}

// Helper to get or retrieve guest ID
async function getGuestId(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  let id = localStorage.getItem('shopsphere_guest_id');
  if (id) return id;

  try {
    const res = await fetch(`${API_URL}/get-guest-id`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.guest_id) {
        localStorage.setItem('shopsphere_guest_id', String(data.guest_id));
        return String(data.guest_id);
      }
    }
  } catch (err) {
    console.error('Failed to get guest ID', err);
  }
  return null;
}

// Fetch helper with standard headers
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let finalEndpoint = endpoint;

  // Exclude get-guest-id loop
  if (!endpoint.includes('get-guest-id')) {
    const guestId = await getGuestId();
    if (guestId) {
      const separator = endpoint.includes('?') ? '&' : '?';
      finalEndpoint = `${endpoint}${separator}guest_id=${guestId}`;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Localization': 'en',
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('shopsphere_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${finalEndpoint}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    let errorMsg = `API error: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData?.message) errorMsg = errData.message;
      else if (errData?.errors?.[0]?.message) errorMsg = errData.errors[0].message;
    } catch {}
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('shopsphere_token');
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

// Multipart upload helper (used for profile updates with image files)
async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  let finalEndpoint = endpoint;

  if (!endpoint.includes('get-guest-id')) {
    const guestId = await getGuestId();
    if (guestId) {
      formData.append('guest_id', guestId);
    }
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-Localization': 'en',
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('shopsphere_token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${finalEndpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    let errorMsg = `API error: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData?.message) errorMsg = errData.message;
      else if (errData?.errors?.[0]?.message) errorMsg = errData.errors[0].message;
    } catch {}
    if (res.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('shopsphere_token');
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

function extractProducts(data: any): Product[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.products)) return data.products;
    if (Array.isArray(data.data)) return data.data;
  }
  return [];
}

function extractBrands(data: any): Brand[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.brands)) return data.brands;
    if (Array.isArray(data.data)) return data.data;
  }
  return [];
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  click_count?: number;
}

export interface BlogTranslation {
  id: number;
  translation_id: number;
  locale: string;
  key: string;
  value: string;
}

export interface BlogSeoInfo {
  id: number;
  blog_id: number;
  meta_title?: string;
  meta_description?: string;
  meta_image?: string;
  canon_url?: string;
}

export interface Blog {
  id: number;
  slug: string;
  readable_id: number;
  category_id: number;
  writer?: string;
  title: string;
  description: string;
  image?: string;
  publish_date: string;
  click_count: number;
  thumbnail_full_url?: string;
  category?: BlogCategory;
  translations?: BlogTranslation[];
  seo_info?: BlogSeoInfo;
}

export interface BlogListResponse {
  blogTitle: string;
  blogSubTitle: string;
  blogList: {
    current_page: number;
    data: Blog[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  recentBlogList: Blog[];
  blogCategoryList: BlogCategory[];
  downloadAppStatus?: number | boolean;
  appTitleData?: any;
}

export interface PopularBlogResponse {
  popularBlogList: {
    current_page: number;
    data: Blog[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  blogCategoryList: BlogCategory[];
}

export interface BlogDetailsResponse {
  blogData: Blog;
  popularBlogList: Blog[];
  articleLinks: { id: string; text: string }[];
  updatedDescription: string;
  downloadAppStatus?: number | boolean;
  appTitleData?: any;
}


export const api = {
  // Customer orders
  getMyOrders: async (params?: { status?: string; limit?: number; offset?: number }): Promise<OrderListResponse> => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset));
    const qs = query.toString();
    return apiFetch<OrderListResponse>(`/customer/order/list${qs ? `?${qs}` : ''}`);
  },

  getOrderDetails: async (orderId: number): Promise<any> => {
    return apiFetch<any>(`/customer/order/details?order_id=${orderId}`);
  },

  getOrderInvoice: async (orderId: number): Promise<number[]> => {
    return apiFetch<number[]>(`/customer/order/generate-invoice?order_id=${orderId}`);
  },

  // Cancel a pending cash-on-delivery order
  cancelOrder: async (orderId: number): Promise<any> => {
    return apiFetch<any>(`/order/cancel-order?order_id=${orderId}`);
  },

  // Order tracking status history (returns { history: {...}, is_digital_order })
  getOrderTrackHistory: async (orderId: number): Promise<any> => {
    return apiFetch<any>(`/order/track-order-details?order_id=${orderId}`);
  },

  // Seller/shop info + ratings by shop slug
  getSellerInfo: async (slug: string): Promise<any> => {
    return apiFetch<any>(`/seller?slug=${encodeURIComponent(slug)}`);
  },

  // Submit / update a product review (multipart to support image attachments)
  submitProductReview: async (payload: { product_id: number; order_id: number; comment: string; rating: number; files?: File[] }): Promise<any> => {
    const formData = new FormData();
    formData.append('product_id', String(payload.product_id));
    formData.append('order_id', String(payload.order_id));
    formData.append('comment', payload.comment);
    formData.append('rating', String(payload.rating));
    (payload.files || []).forEach((file, i) => formData.append(`fileUpload[${i}]`, file));
    return apiUpload<any>('/products/reviews/submit', formData);
  },

  // Submit / update the delivery man review for an order
  submitDeliverymanReview: async (payload: { order_id: number; comment: string; rating: number }): Promise<any> => {
    return apiFetch<any>('/customer/order/deliveryman-reviews/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Chat: list of conversations for a type ('seller' or 'delivery-man')
  getChatList: async (type: 'seller' | 'delivery-man'): Promise<any> => {
    return apiFetch<any>(`/customer/chat/list/${type}`);
  },

  // Chat: fetch a conversation with a seller (id=0 for in-house/admin) or delivery man
  getChatMessages: async (type: 'seller' | 'delivery-man', id: number, offset = 1, limit = 50): Promise<any> => {
    return apiFetch<any>(`/customer/chat/get-messages/${type}/${id}?offset=${offset}&limit=${limit}`);
  },

  // Chat: send a message to a seller (id=0 for in-house/admin) or delivery man
  sendChatMessage: async (type: 'seller' | 'delivery-man', id: number, message: string): Promise<any> => {
    return apiFetch<any>(`/customer/chat/send-message/${type}`, {
      method: 'POST',
      body: JSON.stringify({ id, message }),
    });
  },

  // Products by Category
  getProductsByCategory: async (categoryId: number, limit = 10, offset = 1): Promise<Product[]> => {
    return apiFetch<any>(`/categories/products/${categoryId}?limit=${limit}&offset=${offset}`).then(extractProducts);
  },

  // Restock requests
  getRestockRequests: async (params?: { limit?: number; offset?: number }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset ?? 0));
    const qs = query.toString();
    return apiFetch<any>(`/customer/restock-requests/list${qs ? `?${qs}` : ''}`);
  },

  deleteRestockRequest: async (payload: { id?: number; type?: 'all' }): Promise<any> => {
    return apiFetch<any>('/customer/restock-requests/delete', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Wishlist
  getWishlist: async (): Promise<any[]> => {
    return apiFetch<any[]>('/customer/wish-list');
  },

  addToWishlist: async (productId: number): Promise<any> => {
    return apiFetch<any>('/customer/wish-list/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  },

  removeFromWishlist: async (productId: number): Promise<any> => {
    return apiFetch<any>('/customer/wish-list/remove', {
      method: 'DELETE',
      body: JSON.stringify({ product_id: productId }),
    });
  },

  // Address book
  getAddresses: async (): Promise<any[]> => {
    return apiFetch<any[]>('/customer/address/list');
  },

  addAddress: async (payload: any): Promise<any> => {
    return apiFetch<any>('/customer/address/add', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateAddress: async (payload: any): Promise<any> => {
    return apiFetch<any>('/customer/address/update', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteAddress: async (id: number): Promise<any> => {
    return apiFetch<any>('/customer/address', {
      method: 'DELETE',
      body: JSON.stringify({ address_id: id }),
    });
  },

  validateCoupon: async (code: string): Promise<any> => {
    return apiFetch<any>(`/coupon/apply?code=${code}`);
  },

  placeOrder: async (payload: any): Promise<any> => {
    // Filter out null or empty values
    const cleanPayload: Record<string, string> = {};
    Object.keys(payload).forEach((key) => {
      if (payload[key] !== null && payload[key] !== undefined && payload[key] !== '') {
        cleanPayload[key] = String(payload[key]);
      }
    });
    const qs = new URLSearchParams(cleanPayload).toString();
    return apiFetch<any>(`/customer/order/place?${qs}`);
  },

  getOfflinePaymentMethods: async (): Promise<any> => {
    return apiFetch<any>('/customer/order/offline-payment-method-list');
  },

  placeOfflineOrder: async (payload: any): Promise<any> => {
    return apiFetch<any>('/customer/order/place-by-offline-payment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Support tickets
  getSupportTickets: async (): Promise<any[]> => {
    return apiFetch<any[]>('/customer/support-ticket/get');
  },

  getSupportTicketConv: async (ticketId: number): Promise<any[]> => {
    return apiFetch<any[]>(`/customer/support-ticket/conv/${ticketId}`);
  },

  replySupportTicket: async (ticketId: number, message: string, files?: File[]): Promise<any> => {
    const fd = new FormData();
    fd.append('message', message);
    (files || []).forEach((f, i) => fd.append(`image[${i}]`, f));
    return apiUpload<any>(`/customer/support-ticket/reply/${ticketId}`, fd);
  },

  closeSupportTicket: async (ticketId: number): Promise<any> => {
    return apiFetch<any>(`/customer/support-ticket/close/${ticketId}`);
  },

  createSupportTicket: async (payload: { subject: string; type: string; priority: string; description: string; files?: File[] }): Promise<any> => {
    const fd = new FormData();
    fd.append('subject', payload.subject);
    fd.append('type', payload.type);
    fd.append('priority', payload.priority);
    fd.append('description', payload.description);
    (payload.files || []).forEach((f, i) => fd.append(`image[${i}]`, f));
    return apiUpload<any>('/customer/support-ticket/create', fd);
  },

  // Coupons
  getCoupons: async (params?: { limit?: number; offset?: number }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset ?? 0));
    const qs = query.toString();
    return apiFetch<any>(`/coupon/list${qs ? `?${qs}` : ''}`);
  },

  // Track order (by order id + phone number, returns order details array)
  trackOrder: async (orderId: number, phoneNumber: string): Promise<any> => {
    return apiFetch<any>('/order/track-order', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId, phone_number: phoneNumber }),
    });
  },

  // Latest products
  getLatestProducts: async (): Promise<Product[]> => {
    return apiFetch<any>('/products/latest').then(extractProducts);
  },

  // New arrivals
  getNewArrivals: async (): Promise<Product[]> => {
    return apiFetch<any>('/products/new-arrival').then(extractProducts);
  },

  // Top/Best Sellings
  getTopSellers: async (): Promise<Product[]> => {
    return apiFetch<any>('/products/best-sellings').then(extractProducts);
  },

  // Featured/Recommended Products
  getFeaturedProducts: async (): Promise<Product[]> => {
    return apiFetch<any>('/products/featured').then(extractProducts);
  },

  // Top Rated Products
  getTopRatedProducts: async (): Promise<Product[]> => {
    return apiFetch<any>('/products/top-rated').then(extractProducts);
  },
  
  // Discounted Products
  getDiscountedProducts: async (limit = 10, offset = 1): Promise<{ products: Product[]; total_size: number }> => {
    return apiFetch<any>(`/products/discounted-product?limit=${limit}&offset=${offset}`).then(res => ({
      products: extractProducts(res),
      total_size: Number(res?.total_size ?? res?.pagination?.total_size ?? 0)
    }));
  },

  // Brands
  getBrands: async (): Promise<Brand[]> => {
    return apiFetch<any>('/brands').then(extractBrands);
  },

  // Top Sellers (Shops)
  getTopShops: async (): Promise<any[]> => {
    return apiFetch<any>('/seller/list/top').then((res) => res.sellers || []);
  },

  // Get all sellers with filtering
  getSellers: async (params: {
    type?: string;
    limit?: number;
    offset?: number;
    shop_name?: string;
    category_id?: string | number[];
    brand_id?: string | number[];
    product_type?: string;
  }): Promise<{ sellers: any[]; total_size: number }> => {
    const type = params.type || 'all';
    const query = new URLSearchParams();
    query.append('limit', String(params.limit ?? 12));
    query.append('offset', String(params.offset ?? 1));
    if (params.shop_name) query.append('shop_name', params.shop_name);
    if (params.category_id) {
      const catVal = Array.isArray(params.category_id) ? params.category_id.join(',') : String(params.category_id);
      if (catVal) query.append('category_id', catVal);
    }
    if (params.brand_id) {
      const brandVal = Array.isArray(params.brand_id) ? params.brand_id.join(',') : String(params.brand_id);
      if (brandVal) query.append('brand_id', brandVal);
    }
    if (params.product_type && params.product_type !== 'all') {
      query.append('product_type', params.product_type);
    }
    return apiFetch<any>(`/seller/list/${type}?${query.toString()}`).then((res) => ({
      sellers: res.sellers || [],
      total_size: res.total_size || 0,
    }));
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    return apiFetch<Category[]>('/categories');
  },

  // Product details (mirrors Blade details.blade.php data source)
  getProductDetails: async (slug: string): Promise<any> => {
    return apiFetch<any>(`/products/details/${encodeURIComponent(slug)}`);
  },

  // Related / similar products
  getRelatedProducts: async (slug: string): Promise<Product[]> => {
    return apiFetch<any>(`/products/related-products/${encodeURIComponent(slug)}`).then(extractProducts);
  },

  // More products from the same seller / in-house shop
  getVendorProducts: async (slug: string, limit = 10, offset = 1): Promise<Product[]> => {
    return apiFetch<any>(`/seller/${encodeURIComponent(slug)}/products?limit=${limit}&offset=${offset}`).then(extractProducts);
  },

  // Paginated vendor products with total_size (used by shop view page)
  getVendorProductsPaginated: async (params: {
    slug: string;
    limit?: number;
    offset?: number;
    search?: string;
    category?: number[];
    brand_ids?: number[];
    product_type?: 'all' | 'physical' | 'digital';
    publishing_houses?: number[];
    product_authors?: number[];
  }): Promise<{ products: Product[]; total_size: number }> => {
    const query = new URLSearchParams();
    query.append('limit', String(params.limit ?? 30));
    query.append('offset', String(params.offset ?? 1));
    if (params.search) query.append('search', params.search);
    if (params.category && params.category.length > 0) query.append('category', JSON.stringify(params.category));
    if (params.brand_ids && params.brand_ids.length > 0) query.append('brand_ids', JSON.stringify(params.brand_ids));
    if (params.product_type) query.append('product_type', params.product_type);
    if (params.publishing_houses && params.publishing_houses.length > 0) query.append('publishing_houses', JSON.stringify(params.publishing_houses));
    if (params.product_authors && params.product_authors.length > 0) query.append('product_authors', JSON.stringify(params.product_authors));

    return apiFetch<any>(`/seller/${encodeURIComponent(params.slug)}/products?${query.toString()}`).then(res => ({
      products: extractProducts(res),
      total_size: Number(res?.total_size ?? res?.pagination?.total_size ?? 0),
    }));
  },

  // Restock request
  requestRestock: async (productId: number): Promise<any> => {
    return apiFetch<any>('/product-restock-request', {
      method: 'POST',
      body: JSON.stringify({ id: productId }),
    });
  },

  // Suggestions
  searchSuggestions: async (query: string): Promise<Product[]> => {
    if (!query) return [];
    return apiFetch<any>(`/products/suggestion-product?name=${encodeURIComponent(query)}`).then(extractProducts);
  },

  // Search results
  searchProducts: async (query: string): Promise<Product[]> => {
    if (!query) return [];
    return apiFetch<any>(`/products/search?name=${encodeURIComponent(query)}`).then(extractProducts);
  },

  // Dynamic filter products API
  getProductsFilter: async (params: {
    search?: string;
    category?: number[];
    brand?: number[];
    product_type?: 'all' | 'physical' | 'digital';
    sort_by?: 'latest' | 'low-high' | 'high-low' | 'a-z' | 'z-a';
    price_min?: number;
    price_max?: number;
    publishing_houses?: number[];
    product_authors?: number[];
    limit?: number;
    offset?: number;
    data_from?: string;
    offer_type?: string;
  }): Promise<{ total_size: number; products: Product[]; min_price: number; max_price: number }> => {
    const searchBase64 = params.search ? btoa(params.search) : '';
    const body = {
      search: searchBase64,
      category: JSON.stringify(params.category || []),
      brand: JSON.stringify(params.brand || []),
      product_type: params.product_type || 'all',
      sort_by: params.sort_by || 'latest',
      price_min: params.price_min ?? '',
      price_max: params.price_max ?? '',
      publishing_houses: JSON.stringify(params.publishing_houses || []),
      product_authors: JSON.stringify(params.product_authors || []),
      limit: params.limit || 20,
      offset: params.offset || 1,
      data_from: params.data_from || '',
      offer_type: params.offer_type || '',
    };
    return apiFetch<any>('/products/filter', {
      method: 'POST',
      body: JSON.stringify(body),
    }).then(res => ({
      total_size: Number(res.total_size) || 0,
      min_price: Number(res.min_price) || 0,
      max_price: Number(res.max_price) || 0,
      products: extractProducts(res)
    }));
  },

  // Author and Publisher lists (for digital filters)
  getAuthors: async (): Promise<any[]> => {
    return apiFetch<any[]>('/products/digital-author-list');
  },

  getPublishingHouses: async (): Promise<any[]> => {
    return apiFetch<any[]>('/products/digital-publishing-house-list');
  },

  // System Config
  getBusinessPages: async (): Promise<any[]> => {
    return apiFetch<any[]>('/business-pages');
  },

  getConfig: async (): Promise<any> => {
    return apiFetch<any>('/config');
  },

  // Banners list
  getBanners: async (): Promise<any[]> => {
    return apiFetch<any[]>('/banners');
  },

  // Customer profile
  getCustomerInfo: async (): Promise<CustomerInfo> => {
    return apiFetch<CustomerInfo>('/customer/info');
  },

  updateCustomerProfile: async (formData: FormData): Promise<any> => {
    formData.append('_method', 'put');
    return apiUpload<any>('/customer/update-profile', formData);
  },

  // Customer Auth
  login: async (emailOrPhone: string, password: string, type: 'phone' | 'email'): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email_or_phone: emailOrPhone, password, type }),
    });
  },

  checkPhone: async (phone: string): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/auth/check-phone', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  verifyOTP: async (phone: string, token: string): Promise<AuthResponse> => {
    return apiFetch<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, token }),
    });
  },

  registerVendor: async (formData: FormData): Promise<any> => {
    const res = await fetch(`${BACKEND_URL}/api/v3/seller/registration`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Localization': 'en',
      },
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      // Check if message is array of errors (e.g. from failedValidation ResponseHandler)
      const errorMsg = Array.isArray(errData.message)
        ? errData.message.map((e: any) => e.message).join('\n')
        : (errData.message || errData.error || 'Failed to register vendor');
      throw new Error(errorMsg);
    }
    return res.json();
  },

  getBlogList: async (params?: { search?: string; category?: string; writer?: string; page?: number }): Promise<BlogListResponse> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.writer) query.append('writer', params.writer);
    if (params?.page) query.append('page', String(params.page));
    const qs = query.toString();
    return apiFetch<BlogListResponse>(`/blog/list${qs ? `?${qs}` : ''}`);
  },

  getPopularBlogs: async (params?: { search?: string; category?: string; writer?: string; page?: number }): Promise<PopularBlogResponse> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.writer) query.append('writer', params.writer);
    if (params?.page) query.append('page', String(params.page));
    const qs = query.toString();
    return apiFetch<PopularBlogResponse>(`/blog/popular${qs ? `?${qs}` : ''}`);
  },

  getBlogDetails: async (slug: string, source?: string): Promise<BlogDetailsResponse> => {
    const qs = source ? `?source=${source}` : '';
    return apiFetch<BlogDetailsResponse>(`/blog/details/${slug}${qs}`);
  },

  getBlogCategories: async (): Promise<BlogCategory[]> => {
    return apiFetch<BlogCategory[]>('/blog/categories');
  },
};
