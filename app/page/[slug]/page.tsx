import React from 'react';
import { api } from '@/lib/api';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // Revalidate business pages every hour in the background

export async function generateStaticParams() {
  try {
    const pages = await api.getBusinessPages();
    return pages.map((p) => ({
      slug: p.slug,
    }));
  } catch (err) {
    console.error('Failed to generate static params for business pages', err);
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params;
  let pageData: any = null;
  let error: string | null = null;

  try {
    const pages = await api.getBusinessPages();
    const match = pages.find((p) => p.slug === slug);
    if (match) {
      pageData = match;
    } else {
      notFound();
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
            <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 sm:p-10 shadow-md">
              {!pageData.banner_full_url?.path && (
                <h1 className="text-xl sm:text-2xl font-black text-neutral-gray-900 tracking-tight mb-6 pb-4 border-b border-neutral-gray-200/60 text-capitalize">
                  {pageData.title}
                </h1>
              )}
              <div 
                className="text-xs font-semibold text-neutral-gray-700 leading-relaxed space-y-4 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: pageData.description || '' }}
              />
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
