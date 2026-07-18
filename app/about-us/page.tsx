import React from 'react';
import { api } from '@/lib/api';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function AboutUsPage() {
  let pageData: any = null;
  let error: string | null = null;

  try {
    const pages = await api.getBusinessPages();
    const match = pages.find((p) => p.slug === 'about-us' || p.slug === 'about_us');
    if (match) {
      pageData = match;
    } else {
      error = 'About Us page not found';
    }
  } catch (err) {
    error = 'Failed to load page content';
  }

  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-gray-50/50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {error ? (
          <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-12 text-center shadow-sm">
            <p className="text-sm font-bold text-red-500">{error}</p>
          </div>
        ) : pageData ? (
          <div className="space-y-6">
            {/* Banner Section */}
            {pageData.banner_full_url?.path && (
              <div 
                className="w-full h-48 sm:h-64 rounded-3xl overflow-hidden bg-cover bg-center relative flex items-center justify-center border border-neutral-gray-200/40 shadow-sm"
                style={{ backgroundImage: `url(${pageData.banner_full_url.path})` }}
              >
                <div className="absolute inset-0 bg-neutral-black/35 backdrop-blur-[2px]" />
                <h1 className="relative text-2xl sm:text-3xl font-black text-neutral-white tracking-tight drop-shadow-md text-capitalize text-center px-4">
                  {pageData.title}
                </h1>
              </div>
            )}

            {/* Content Section */}
            <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 sm:p-10 shadow-sm">
              <div 
                className="prose prose-sm prose-neutral max-w-none text-xs sm:text-sm font-medium text-neutral-gray-600 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: pageData.value }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-12 text-center shadow-sm">
            <p className="text-sm font-bold text-neutral-gray-500">No content available</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
