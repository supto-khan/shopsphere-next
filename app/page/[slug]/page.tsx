'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';

export default function BusinessPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    api.getBusinessPages()
      .then((pages) => {
        const match = pages.find((p) => p.slug === slug);
        if (match) {
          setPageData(match);
        } else {
          setError('Page not found');
        }
      })
      .catch((err) => {
        setError('Failed to load page content');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-gray-50/50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-primary-600 mb-3" size={28} />
            <p className="text-xs text-neutral-gray-500 font-semibold">Loading page...</p>
          </div>
        ) : error ? (
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
            <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 sm:p-10 shadow-md">
              {!pageData.banner_full_url?.path && (
                <h1 className="text-xl sm:text-2xl font-black text-neutral-gray-900 tracking-tight mb-6 pb-4 border-b border-neutral-gray-200/60 text-capitalize">
                  {pageData.title}
                </h1>
              )}
              <div 
                className="text-xs font-semibold text-neutral-gray-700 leading-relaxed space-y-4 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: pageData.description }}
              />
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
