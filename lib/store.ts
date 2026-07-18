import { create } from 'zustand';
import { Product, Category, CustomerLogin } from './api';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AppStore {
  // Cart State
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartItemCount: () => number;

  // Navigation & Filtering
  selectedCategoryId: number | null;
  selectedCategoryName: string | null;
  setSelectedCategory: (id: number | null, name: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;

  // Authentication Popup
  isLoginOpen: boolean;
  setLoginOpen: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  token: string | null;
  setLoggedIn: (token: string) => void;
  setLoggedOut: () => void;

  // Company Brand Settings (fetched from config)
  companyLogo: string | null;
  companyFavIcon: string | null;
  setCompanyConfig: (logo: string | null, favicon: string | null) => void;

  // Customer login methods config (fetched from backend /config)
  customerLogin: CustomerLogin | null;
  setCustomerLogin: (data: CustomerLogin | null) => void;

  // Logged-in customer identity (name + avatar)
  customerName: string | null;
  customerImage: string | null;
  setCustomerInfo: (name: string | null, image: string | null) => void;

  // ── Global cache: config + categories ─────────────────────────────────────
  // Populated once by the first component that fetches them.
  // Every other component reads from the store instead of firing a new HTTP
  // request — eliminating the 7+ duplicate getConfig() calls per page load.
  siteConfig: any | null;
  configLoaded: boolean;
  setSiteConfig: (config: any) => void;

  categories: Category[];
  categoriesLoaded: boolean;
  setCategories: (cats: Category[]) => void;
  // ──────────────────────────────────────────────────────────────────────────
}

export const useAppStore = create<AppStore>((set, get) => ({
  cart: [],
  isCartOpen: false,
  addToCart: (product) => {
    const cart = get().cart;
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      set({
        cart: cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ cart: [...cart, { product, quantity: 1 }] });
    }
  },
  removeFromCart: (productId) => {
    set({
      cart: get().cart.filter((item) => item.product.id !== productId),
    });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set({
      cart: get().cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },
  toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
  clearCart: () => set({ cart: [] }),
  getCartSubtotal: () => {
    return get().cart.reduce((sum, item) => {
      const price = item.product.unit_price;
      const discount = item.product.discount || 0;
      const finalPrice = item.product.discount_type === 'amount' || item.product.discount_type === 'flat'
        ? Math.max(0, price - discount)
        : Math.max(0, price - (price * discount) / 100);
      return sum + finalPrice * item.quantity;
    }, 0);
  },
  getCartItemCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Navigation & Filtering
  selectedCategoryId: null,
  selectedCategoryName: null,
  setSelectedCategory: (id, name) => set({ selectedCategoryId: id, selectedCategoryName: name }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSidebarOpen: false,
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),

  // Authentication
  isLoginOpen: false,
  setLoginOpen: (isOpen) => set({ isLoginOpen: isOpen }),
  isLoggedIn: false,
  token: typeof window !== 'undefined' ? localStorage.getItem('shopsphere_token') : null,
  setLoggedIn: (token) => {
    if (typeof window !== 'undefined') localStorage.setItem('shopsphere_token', token);
    set({ isLoggedIn: true, token, isLoginOpen: false });
  },
  setLoggedOut: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('shopsphere_token');
    set({ isLoggedIn: false, token: null });
  },

  // Company Brand Settings
  companyLogo: null,
  companyFavIcon: null,
  setCompanyConfig: (logo, favicon) => set({ companyLogo: logo, companyFavIcon: favicon }),

  // Customer login methods config
  customerLogin: null,
  setCustomerLogin: (data) => set({ customerLogin: data }),

  // Logged-in customer identity
  customerName: null,
  customerImage: null,
  setCustomerInfo: (name, image) => set({ customerName: name, customerImage: image }),

  // Global config + categories cache
  siteConfig: null,
  configLoaded: false,
  setSiteConfig: (config) => set({ siteConfig: config, configLoaded: true }),

  categories: [],
  categoriesLoaded: false,
  setCategories: (cats) => set({ categories: cats, categoriesLoaded: true }),
}));
