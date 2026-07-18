'use client';

import { useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Category } from '@/lib/api';

interface StoreProviderInitProps {
  initialConfig?: any;
  initialCategories?: Category[];
}

export default function StoreProviderInit({
  initialConfig,
  initialCategories,
}: StoreProviderInitProps) {
  const initialized = useRef(false);
  const { setSiteConfig, setCategories, setCompanyConfig, setCustomerLogin } = useAppStore();

  if (!initialized.current) {
    if (initialConfig) {
      setSiteConfig(initialConfig);

      // Parse and sync brand configs so Header and components show them immediately
      let logoUrl = null;
      let favIconUrl = null;

      if (initialConfig.company_logo && typeof initialConfig.company_logo === 'object' && initialConfig.company_logo.path) {
        logoUrl = initialConfig.company_logo.path.replace(/^https?:\/\/[^\/]+/, '');
      }
      if (initialConfig.company_fav_icon && typeof initialConfig.company_fav_icon === 'object' && initialConfig.company_fav_icon.path) {
        favIconUrl = initialConfig.company_fav_icon.path.replace(/^https?:\/\/[^\/]+/, '');
      }

      setCompanyConfig(logoUrl, favIconUrl);

      if (initialConfig.customer_login) {
        setCustomerLogin(initialConfig.customer_login);
      }
    }
    if (initialCategories) {
      setCategories(initialCategories);
    }
    initialized.current = true;
  }

  return null;
}
