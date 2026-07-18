'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { api, Product } from '@/lib/api';
import { Menu, Search, MapPin, ChevronDown, User, LogOut, Loader2, LayoutDashboard } from 'lucide-react';
import { normalizeImage } from '@/lib/profile-utils';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const {
    searchQuery,
    setSearchQuery,
    setLoginOpen,
    isLoggedIn,
    setLoggedOut,
    setLoggedIn,
    customerName,
    customerImage,
    setCustomerInfo,
    setSelectedCategory,
    companyLogo,
    companyFavIcon,
    setCompanyConfig,
    setCustomerLogin,
    toggleSidebar,
    setSiteConfig,
    configLoaded,
  } = useAppStore();

  useEffect(() => {
    if (isLoggedIn && !customerName) {
      api.getCustomerInfo()
        .then((data) => {
          const img = normalizeImage(data.image_full_url || data.image);
          setCustomerInfo(`${data.f_name || ''} ${data.l_name || ''}`.trim() || null, img);
        })
        .catch((err) => console.error('Failed to load profile info in header', err));
    }
  }, [isLoggedIn, customerName, setCustomerInfo]);

  const [inputVal, setInputVal] = useState(searchQuery || '');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<any[]>([
    { code: 'en', name: 'English' },
    { code: 'bn', name: 'Bangla' }
  ]);
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [location, setLocation] = useState('Dhaka');

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const lastSearchRef = useRef('');

  // Keep search input in sync with global search state
  useEffect(() => {
    setInputVal(searchQuery || '');
    if (!searchQuery) {
      lastSearchRef.current = '';
    }
  }, [searchQuery]);

  // Rehydrate auth state from localStorage so login persists across page reloads
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('shopsphere_token') : null;
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoggedIn(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search suggestions (sped up to 100ms)
  useEffect(() => {
    if (inputVal.trim().length < 2 || inputVal === lastSearchRef.current) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchSuggestions(inputVal);
        setSuggestions(data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(delay);
  }, [inputVal]);

  // Click outside listener for popups
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch company logo, favicon, and active languages settings from Laravel backend.
  // The full config response is also saved to the Zustand store so every other
  // component (Footer, CartDrawer, Sidebar, etc.) can read it without an API call.
  useEffect(() => {
    async function loadConfig() {
      try {
        const config = await api.getConfig();
        if (config) {
          // ── Save full config to global store ──────────────────────────────
          setSiteConfig(config);

          let logoUrl = null;
          let favIconUrl = null;

          if (config.company_logo && typeof config.company_logo === 'object' && config.company_logo.path) {
            logoUrl = config.company_logo.path.replace(/^https?:\/\/[^\/]+/, '');
          }
          if (config.company_fav_icon && typeof config.company_fav_icon === 'object' && config.company_fav_icon.path) {
            favIconUrl = config.company_fav_icon.path.replace(/^https?:\/\/[^\/]+/, '');
          }

          setCompanyConfig(logoUrl, favIconUrl);

          if (config.customer_login) {
            setCustomerLogin(config.customer_login);
          }

          // Extract active languages
          const langData = config.language || config.languages;
          if (langData && Array.isArray(langData) && langData.length > 0) {
            const activeLangs = langData.filter(
              (l: any) => l.status === true || l.status === 1 || l.status === '1' || l.status === 'true'
            );
            if (activeLangs.length > 0) {
              setLanguages(activeLangs);
              const defaultLang = activeLangs.find(
                (l: any) => l.default === true || l.default === 1 || l.default === '1' || l.default === 'true'
              ) || activeLangs[0];
              if (defaultLang) {
                setSelectedLang(defaultLang.code);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load system config', err);
      }
    }
    // Only fetch if not already in store (avoids re-fetch on SPA navigation)
    if (!configLoaded) loadConfig();
  }, [setSiteConfig, setCompanyConfig, setCustomerLogin, configLoaded]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lastSearchRef.current = inputVal;
    setSearchQuery(inputVal);
    setSelectedCategory(null, null); // Clear category filter when searching
    setSuggestions([]);
    router.push(`/search?q=${encodeURIComponent(inputVal)}`);
  };

  const selectSuggestion = (prod: Product) => {
    lastSearchRef.current = prod.name;
    setInputVal(prod.name);
    setSearchQuery(prod.name);
    setSelectedCategory(null, null);
    setSuggestions([]);
    router.push(`/search?q=${encodeURIComponent(prod.name)}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-white/80 backdrop-blur-md border-b border-neutral-gray-200/50 shadow-sm px-4 md:px-6 py-3 md:py-3.5 flex flex-col gap-2.5 md:gap-0">
      {/* Top row container */}
      <div className="flex items-center justify-between w-full">
        {/* Left section: Hamburger + Brand */}
        <div className="flex items-center space-x-4 shrink-0">
          {isHomePage && (
            <button
              onClick={toggleSidebar}
              className="text-neutral-gray-900 hover:text-primary-600 transition-colors md:hidden cursor-pointer"
            >
              <Menu size={22} />
            </button>
          )}
          <div
            onClick={() => { setSelectedCategory(null, null); setSearchQuery(''); setInputVal(''); lastSearchRef.current = ''; router.push('/'); }}
            className="flex items-center cursor-pointer select-none"
          >
            <img
              src={companyLogo || '/shopsphere.webp'}
              alt="ShopSphere Logo"
              className="h-10 w-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/shopsphere.webp';
              }}
            />
          </div>
        </div>

        {/* Middle section: Search (Desktop only) */}
        <div className="flex-1 max-w-2xl mx-8 hidden md:flex items-center space-x-3 relative">
          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder="Search for products (e.g. eggs, milk, potato)..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full pl-4 pr-12 py-2.5 border border-neutral-gray-200/80 rounded-2xl text-neutral-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-xs font-semibold bg-neutral-gray-50/30"
            />
            <button
              type="submit"
              className="absolute right-4 text-neutral-gray-500 hover:text-primary-600 transition-colors cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </form>

          {/* Search Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 top-full mt-2 bg-neutral-white border border-neutral-gray-200/50 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
            >
              {suggestions.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => selectSuggestion(prod)}
                  className="flex items-center space-x-3 px-4 py-2.5 hover:bg-primary-50 rounded-xl cursor-pointer transition-colors text-xs font-bold text-neutral-gray-700"
                >
                  <Search size={13} className="text-neutral-gray-400 shrink-0" />
                  <span className="truncate">{prod.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right section: Language switcher + Login/Profile */}
        <div className="flex items-center space-x-4 shrink-0">
          {/* Language Switcher Dropdown */}
          {languages.length > 0 && (
            <div ref={langDropdownRef} className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-2 border border-neutral-gray-200/60 rounded-xl text-[10px] font-extrabold text-neutral-gray-700 hover:bg-neutral-gray-50 hover:text-primary-600 transition-all cursor-pointer shadow-sm select-none"
              >
                <span className="uppercase">{selectedLang}</span>
                <ChevronDown size={12} className="text-neutral-500 transition-transform duration-200" style={{ transform: langDropdownOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-neutral-white border border-neutral-gray-200/50 rounded-2xl shadow-2xl z-50 py-1.5 overflow-hidden animate-fade-in">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setSelectedLang(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[10px] font-bold transition-colors ${
                        selectedLang === l.code ? 'text-primary-600 bg-primary-50/60' : 'text-neutral-gray-700 hover:bg-neutral-gray-50'
                      }`}
                    >
                      {l.name || l.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Login / Profile */}
          {isLoggedIn ? (
            <div ref={profileDropdownRef} className="relative">
              <button
                onClick={() => setProfileDropdownOpen((v) => !v)}
                className="w-9 h-9 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-600 font-extrabold text-xs hover:bg-primary-100/80 transition-colors shadow-sm cursor-pointer overflow-hidden"
                title="My Account"
              >
                {customerImage ? (
                  <img src={customerImage} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  (customerName || 'U').charAt(0).toUpperCase()
                )}
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-neutral-white border border-neutral-gray-200/50 rounded-2xl shadow-2xl z-50 py-1.5 overflow-hidden animate-fade-in">
                  <button
                    onClick={() => { setProfileDropdownOpen(false); router.push('/profile'); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-neutral-700 hover:bg-primary-50 transition-colors flex items-center space-x-2 cursor-pointer"
                  >
                    <LayoutDashboard size={15} className="text-primary-600" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => { setProfileDropdownOpen(false); setLoggedOut(); }}
                    className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center space-x-2 border-t cursor-pointer border-neutral-gray-100"
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setLoginOpen(true)}
              className="flex items-center space-x-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/15 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <User size={14} />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Row (Mobile only) */}
      <div className="w-full md:hidden relative">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Search for products (e.g. eggs, milk, potato)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full pl-4 pr-12 py-2 border border-neutral-gray-200/80 rounded-2xl text-neutral-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-xs font-semibold bg-neutral-gray-50/30"
          />
          <button
            type="submit"
            className="absolute right-4 text-neutral-gray-500 hover:text-primary-600 transition-colors cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </button>
        </form>

        {/* Mobile Search Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute left-0 right-0 top-full mt-2 bg-neutral-white border border-neutral-gray-200/50 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5"
          >
            {suggestions.map((prod) => (
              <div
                key={prod.id}
                onClick={() => selectSuggestion(prod)}
                className="flex items-center space-x-3 px-4 py-2.5 hover:bg-primary-50 rounded-xl cursor-pointer transition-colors text-xs font-bold text-neutral-gray-700"
              >
                <Search size={13} className="text-neutral-gray-400 shrink-0" />
                <span className="truncate">{prod.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
