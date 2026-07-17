'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { api, Blog, BACKEND_URL } from '@/lib/api';
import Footer from '@/components/Footer';

// Helper to format image URLs
const getImageUrl = (imgObj: any) => {
  if (imgObj && imgObj.path) {
    if (imgObj.path.startsWith('http')) {
      return imgObj.path;
    }
    return `${BACKEND_URL}/${imgObj.path}`;
  }
  return '/placeholder.jpg';
};

function BlogDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const source = searchParams.get('source') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    blogData: Blog;
    popularBlogList: Blog[];
    articleLinks: { id: string; text: string }[];
    updatedDescription: string;
    downloadAppStatus?: number | boolean;
    appTitleData?: any;
  } | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    api.getBlogDetails(slug, source)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load blog details', err);
        setError('Blog details not found or failed to load.');
        setLoading(false);
      });
  }, [slug, source]);

  if (loading) {
    return (
      <div className="w-full flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <span className="text-4xl mb-4">⚠️</span>
          <h3 className="text-lg font-bold text-neutral-gray-900 mb-2">Blog Not Found</h3>
          <p className="text-sm text-neutral-gray-600 mb-4">{error}</p>
          <Link href="/blog" className="px-4 py-2 bg-primary-600 text-neutral-white font-semibold rounded hover:bg-primary-700 transition">
            Back to Blogs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { blogData, popularBlogList, articleLinks, updatedDescription, downloadAppStatus } = data;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(blogData.title)}&url=${encodeURIComponent(pageUrl)}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(blogData.title)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(blogData.title + ' ' + pageUrl)}`
  };

  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-white">
      {/* Blog Root Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Main Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: In-Article Anchor Navigation */}
          {articleLinks && articleLinks.length > 0 && (
            <div className="lg:col-span-3 lg:sticky lg:top-6">
              <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-xl p-5 shadow-sm">
                <h5 className="font-bold text-neutral-gray-900 mb-4 pb-2 border-b border-neutral-gray-50">
                  In this article
                </h5>
                <ul className="space-y-3">
                  {articleLinks.map((link) => (
                    <li key={link.id}>
                      <a
                        href={`#${link.id}`}
                        className="text-sm text-neutral-gray-600 hover:text-primary-600 transition block truncate"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Middle Column: Blog Details */}
          <div className={`${articleLinks && articleLinks.length > 0 ? 'lg:col-span-6' : 'lg:col-span-9'}`}>
            <div className="mb-6">
              {/* Draft Banner */}
              {source === 'draft' && (
                <div className="flex justify-center mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 border border-danger bg-danger/5 text-danger rounded-lg text-sm font-semibold max-w-lg text-center">
                    <span>⚠️</span>
                    <span>This is a draft copy. It has not been published yet.</span>
                  </div>
                </div>
              )}

              {/* Category Badge */}
              {blogData.category && (
                <div className="text-center mb-3">
                  <span className="inline-block bg-info border border-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded uppercase tracking-wider">
                    {blogData.category.name}
                  </span>
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-gray-900 mb-4 text-center leading-tight">
                {blogData.title}
              </h1>

              {/* Writer and Meta Info */}
              <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-neutral-gray-600">
                {blogData.writer && (
                  <span className="flex items-center gap-1.5 border-r border-neutral-gray-200 pr-4">
                    <span>By</span>
                    <Link href={`/blog?writer=${encodeURIComponent(blogData.writer)}`} className="font-bold text-neutral-gray-900 hover:text-primary-600 transition">
                      {blogData.writer}
                    </Link>
                  </span>
                )}
                <span className="border-r border-neutral-gray-200 pr-4">
                  {blogData.click_count || 0} views
                </span>
                <span>
                  {new Date(blogData.publish_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Banner Image */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-8 shadow-sm">
              <img
                src={getImageUrl(blogData.thumbnail_full_url)}
                alt={blogData.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Rendered HTML content */}
            <article
              className="prose max-w-none text-neutral-gray-900 line-height-relaxed mb-12"
              dangerouslySetInnerHTML={{ __html: updatedDescription }}
            />
          </div>

          {/* Right Column: Sharing & App Promo */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 hidden lg:flex flex-col gap-6">
            {/* Share Options */}
            <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-xl p-5 shadow-sm text-center">
              <h5 className="font-bold text-neutral-gray-900 mb-4">Share Now</h5>
              <div className="flex justify-center gap-3">
                <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition">
                  <img src="/assets/front-end/img/blogs/facebook.svg" width="32" height="32" alt="Facebook" className="w-8 h-8 rounded-full" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </a>
                <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition">
                  <img src="/assets/front-end/img/blogs/twitter.svg" width="32" height="32" alt="Twitter" className="w-8 h-8 rounded-full" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </a>
                <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition">
                  <img src="/assets/front-end/img/blogs/linkedin.svg" width="32" height="32" alt="LinkedIn" className="w-8 h-8 rounded-full" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </a>
                <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition">
                  <img src="/assets/front-end/img/blogs/whatsapp.svg" width="32" height="32" alt="WhatsApp" className="w-8 h-8 rounded-full" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Area (Mobile Share & Popular Articles) */}
        <div className="mt-8 border-t border-neutral-gray-50 pt-8">
          {/* Mobile Social Share Bar */}
          <div className="lg:hidden text-center mb-8 pb-8 border-b border-neutral-gray-50">
            <h4 className="text-sm font-bold text-neutral-gray-900 mb-3">Share this article</h4>
            <div className="flex justify-center gap-4">
              <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-2xl">📘</a>
              <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-2xl">🐦</a>
              <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-2xl">💼</a>
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-2xl">💬</a>
            </div>
          </div>

          {/* Popular Articles Slider/Grid */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-neutral-gray-900">
                Popular Articles
              </h3>
              <Link
                href="/blog/popular"
                className="text-sm font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1 transition"
              >
                <span>See more</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularBlogList.map((blog: Blog) => (
                <div
                  key={blog.id}
                  className="bg-neutral-white border border-neutral-gray-200/50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 flex flex-col"
                >
                  <Link href={`/blog/${blog.slug}`} className="block relative w-full aspect-video overflow-hidden">
                    <img
                      src={getImageUrl(blog.thumbnail_full_url)}
                      alt={blog.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    />
                  </Link>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-neutral-gray-600 mb-1">
                        {new Date(blog.publish_date).toLocaleDateString()}
                      </div>
                      <Link href={`/blog/${blog.slug}`}>
                        <h4 className="text-sm font-bold text-neutral-gray-900 hover:text-primary-600 transition line-clamp-2">
                          {blog.title}
                        </h4>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function BlogDetailsPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center min-h-screen py-20 bg-neutral-white">
        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <BlogDetailsContent />
    </Suspense>
  );
}
