'use client';

/**
 * LazyModals — a client component that lazy-loads the heavy CartDrawer and
 * LoginModal only when they are needed. This pattern is required in Next.js 16
 * because `ssr: false` in `next/dynamic` is only valid in Client Components.
 *
 * Benefits:
 *  - CartDrawer (~11 KB) and LoginModal (~29 KB) are excluded from the initial
 *    HTML payload and are not parsed until the user triggers them.
 *  - The root layout.tsx can remain a Server Component.
 */

import dynamic from 'next/dynamic';

const CartDrawer = dynamic(() => import('@/components/CartDrawer'), { ssr: false });
const LoginModal  = dynamic(() => import('@/components/LoginModal'),  { ssr: false });

export default function LazyModals() {
  return (
    <>
      <CartDrawer />
      <LoginModal />
    </>
  );
}
