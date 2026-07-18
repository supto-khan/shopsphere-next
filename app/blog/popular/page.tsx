import React, { Suspense } from 'react';
import Link from 'next/link';
import { getCachedPopularBlogs, getCachedConfig } from '@/lib/server-cache';
import Footer from '@/components/Footer';
import { Blog, BACKEND_URL } from '@/lib/api';

// Cache popular blogs for 30 minutes
export const revalidate = 1800;

const getImageUrl = (imgObj: any) => {
  if (imgObj && imgObj.path) {
    if (imgObj.path.startsWith('http')) {
      return imgObj.path;
    }
    return `${BACKEND_URL}/${imgObj.path}`;
  }
  return '/placeholder.webp';
};

interface PopularBlogPageProps {
  searchParams: {
    search?: string;
    category?: string;
    page?: string;
  };
}

import BlogFiltersClient from '../BlogFiltersClient';

export default async function PopularBlogPage({ searchParams }: PopularBlogPageProps) {
  const search = searchParams.search || '';
  const category = searchParams.category || '';
  const page = parseInt(searchParams.page || '1', 10);

  const [data, config] = await Promise.all([
    getCachedPopularBlogs().catch(() => null),
    getCachedConfig().catch(() => null),
  ]);

  // Handle local in-memory filtering since popularBlogs endpoint returns full list
  const rawList = data?.popularBlogList?.data || data?.popularBlogList || [];
  let blogs: Blog[] = Array.isArray(rawList) ? rawList : [];
  const blogCategoryList = data?.blogCategoryList || [];

  if (search) {
    const q = search.toLowerCase();
    blogs = blogs.filter((b) => b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q));
  }
  if (category) {
    blogs = blogs.filter((b) => b.category?.name === category);
  }

  // Handle basic page slicing
  const limit = 10;
  const total = blogs.length;
  const totalPages = Math.ceil(total / limit);
  const slicedBlogs = blogs.slice((page - 1) * limit, page * limit);

  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-white">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="hidden sm:block relative overflow-hidden rounded-2xl bg-primary-50 border border-primary-100/50 mb-8 p-12 text-center">
          <h1 className="relative text-4xl font-bold text-primary-900 mb-3 truncate">
            Popular Articles
          </h1>
          <p className="relative text-lg text-primary-800 max-w-2xl mx-auto line-clamp-2">
            Most read and viewed updates from our editorial team
          </p>
        </div>

        <div className="text-center mb-6 block sm:hidden">
          <h2 className="text-xl font-bold text-neutral-gray-900 truncate">
            Popular Articles
          </h2>
        </div>

        {/* Filters */}
        <Suspense fallback={
          <div className="h-14 bg-neutral-gray-50 border border-neutral-gray-150 animate-pulse rounded-full mb-8" />
        }>
          <BlogFiltersClient
            initialSearch={search}
            initialCategory={category}
            blogCategoryList={blogCategoryList}
          />
        </Suspense>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            {slicedBlogs.length === 0 ? (
              <div className="text-center py-20 bg-neutral-white border border-neutral-gray-55 rounded-2xl p-8">
                <span className="text-5xl block mb-4">📝</span>
                <h3 className="text-lg font-bold text-neutral-gray-900 mb-2">No Result Found</h3>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {slicedBlogs.map((blog: Blog) => (
                    <div
                      key={blog.id}
                      className="bg-neutral-white border border-neutral-gray-200/50 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 flex flex-col"
                    >
                      <Link href={`/blog/${blog.slug}`} className="block relative w-full aspect-video overflow-hidden">
                        <img
                          src={getImageUrl(blog.thumbnail_full_url)}
                          alt={blog.title}
                          className="w-full h-full object-cover hover:scale-105 transition duration-500"
                          loading="lazy"
                        />
                      </Link>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-xs text-neutral-gray-650 mb-2">
                            {new Date(blog.publish_date).toLocaleDateString()}
                          </div>
                          <Link href={`/blog/${blog.slug}`}>
                            <h4 className="text-base font-bold text-neutral-gray-900 hover:text-primary-600 transition line-clamp-2">
                              {blog.title}
                            </h4>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 py-6 border-t border-neutral-gray-50">
                    <Link
                      href={page > 1 ? `/blog/popular?page=${page - 1}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}` : '#'}
                      className={`px-3.5 py-2 rounded-lg border border-neutral-gray-200 text-sm font-medium hover:bg-neutral-gray-50 ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      &larr; Prev
                    </Link>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={`/blog/popular?page=${p}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}`}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold border transition flex items-center justify-center ${
                          page === p
                            ? 'bg-primary-600 border-primary-600 text-neutral-white shadow-sm'
                            : 'bg-neutral-white border-neutral-gray-200 hover:bg-neutral-gray-50 text-neutral-gray-600'
                        }`}
                      >
                        {p}
                      </Link>
                    ))}

                    <Link
                      href={page < totalPages ? `/blog/popular?page=${page + 1}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}` : '#'}
                      className={`px-3.5 py-2 rounded-lg border border-neutral-gray-200 text-sm font-medium hover:bg-neutral-gray-50 ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      Next &rarr;
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer config={config} />
    </div>
  );
}
