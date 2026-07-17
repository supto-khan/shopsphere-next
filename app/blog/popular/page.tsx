'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, Blog, BlogCategory, BACKEND_URL } from '@/lib/api';
import Footer from '@/components/Footer';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

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

function PopularBlogList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    popularBlogList: any;
    blogCategoryList: BlogCategory[];
  } | null>(null);

  const [searchInput, setSearchInput] = useState(search);
  const categoryContainerRef = useRef<HTMLUListElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  const checkOverflow = () => {
    if (categoryContainerRef.current) {
      const { scrollWidth, clientWidth } = categoryContainerRef.current;
      setShowArrows(scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [data]);

  useEffect(() => {
    setLoading(true);
    api.getPopularBlogs({ search, category, page })
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load popular blogs', err);
        setLoading(false);
      });
  }, [search, category, page]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/blog/popular?${params.toString()}`);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.push(`/blog/popular?${params.toString()}`);
  };

  const handleCategorySelect = (catName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catName) {
      params.set('category', catName);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    router.push(`/blog/popular?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/blog/popular?${params.toString()}`);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryContainerRef.current) {
      const scrollAmount = 200;
      categoryContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading && !data) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen py-20 bg-neutral-white">
        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const blogCategoryList = data?.blogCategoryList || [];
  const popularBlogList = data?.popularBlogList?.data || [];
  const pagination = data?.popularBlogList;

  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-white">
      {/* Blog Root Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Area */}
        <div className="hidden sm:block relative overflow-hidden rounded-2xl bg-primary-50 border border-primary-100/50 mb-8 p-12 text-center">
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          <h1 className="relative text-4xl font-bold text-primary-900 mb-3">
            Popular Blogs
          </h1>
        </div>

        <div className="block sm:hidden text-center mb-6">
          <h2 className="text-xl font-bold text-neutral-gray-900">
            Popular Blogs
          </h2>
        </div>

        {/* Search Input Bar */}
        <div className="flex flex-col items-center justify-center mb-8 max-w-md mx-auto">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Blog..."
              className="w-full pl-4 pr-10 py-3 bg-neutral-white border border-neutral-gray-200 rounded-full text-sm text-neutral-gray-900 focus:outline-none focus:border-primary-400 shadow-sm"
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-gray-600 hover:text-primary-600 cursor-pointer"
            >
              🔍
            </button>
          </form>
          {search && (
            <div 
              onClick={handleClearSearch}
              className="flex items-center gap-1 mt-2 text-xs text-danger font-medium cursor-pointer hover:underline"
            >
              <span>Clear Search</span>
              <span>&times;</span>
            </div>
          )}
        </div>

        {/* Categories Row */}
        <div className="relative mb-8 border-b border-neutral-gray-50 pb-6">
          <div className="flex items-center">
            {showArrows && (
              <button 
                onClick={() => scrollCategories('left')}
                className="p-1.5 rounded-full border border-neutral-gray-200 bg-neutral-white hover:bg-neutral-gray-50 text-neutral-gray-600 transition shadow-sm mr-2 cursor-pointer flex items-center justify-center"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            
            <ul 
              ref={categoryContainerRef}
              className="flex gap-2 overflow-x-auto scrollbar-none py-1 flex-1 select-none"
            >
              <li>
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap cursor-pointer ${
                    category === ''
                      ? 'bg-primary-600 border-primary-600 text-neutral-white shadow-sm'
                      : 'bg-neutral-white border-neutral-gray-200 text-neutral-gray-600 hover:border-neutral-gray-300'
                  }`}
                >
                  All
                </button>
              </li>
              {blogCategoryList.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`px-4 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap cursor-pointer ${
                      category === cat.name
                        ? 'bg-primary-600 border-primary-600 text-neutral-white shadow-sm'
                        : 'bg-neutral-white border-neutral-gray-200 text-neutral-gray-600 hover:border-neutral-gray-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>

            {showArrows && (
              <button 
                onClick={() => scrollCategories('right')}
                className="p-1.5 rounded-full border border-neutral-gray-200 bg-neutral-white hover:bg-neutral-gray-50 text-neutral-gray-600 transition shadow-sm ml-2 cursor-pointer flex items-center justify-center"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
          {search && (
            <div className="mt-4 text-sm text-neutral-gray-600 font-medium">
              <span className="font-semibold text-neutral-gray-900 mr-1">{popularBlogList.length}</span>
              Search Result Found
            </div>
          )}
        </div>

        {/* Popular Blogs Grid */}
        {popularBlogList.length === 0 ? (
          <div className="text-center py-20 bg-neutral-white border border-neutral-gray-50 rounded-2xl p-8">
            <span className="text-5xl block mb-4">📝</span>
            <h3 className="text-lg font-bold text-neutral-gray-950 mb-2">No Result Found</h3>
            <p className="text-sm text-neutral-gray-600">
              Try adjusting your search keywords or category filters to find what you are looking for.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
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
                    {blog.category && (
                      <span className="absolute top-4 left-4 bg-primary-600 text-neutral-white text-xs font-semibold px-3 py-1.5 rounded-md uppercase tracking-wider">
                        {blog.category.name}
                      </span>
                    )}
                  </Link>
                  
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs text-neutral-gray-600 mb-2 flex items-center gap-2">
                        {blog.writer && (
                          <span className="font-medium text-neutral-gray-900">By {blog.writer}</span>
                        )}
                        <span>•</span>
                        <span>{new Date(blog.publish_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span>{blog.click_count || 0} views</span>
                      </div>
                      <Link href={`/blog/${blog.slug}`}>
                        <h3 className="text-base font-bold text-neutral-gray-900 hover:text-primary-600 transition mb-2 line-clamp-2">
                          {blog.title}
                        </h3>
                      </Link>
                      <p 
                        className="text-neutral-gray-600 text-sm mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: blog.description.replace(/<[^>]*>/g, '') }}
                      />
                    </div>
                    <Link 
                      href={`/blog/${blog.slug}`} 
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-800 transition"
                    >
                      <span>Read More</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex justify-center items-center gap-2 py-6 border-t border-neutral-gray-50">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-3.5 py-2 rounded-lg border border-neutral-gray-200 text-sm font-medium hover:bg-neutral-gray-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  &larr; Prev
                </button>
                
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold border transition cursor-pointer ${
                      page === p
                        ? 'bg-primary-600 border-primary-600 text-neutral-white shadow-sm'
                        : 'bg-neutral-white border-neutral-gray-200 hover:bg-neutral-gray-50 text-neutral-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  disabled={page === pagination.last_page}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-3.5 py-2 rounded-lg border border-neutral-gray-200 text-sm font-medium hover:bg-neutral-gray-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function PopularBlogPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center min-h-screen py-20 bg-neutral-white">
        <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <PopularBlogList />
    </Suspense>
  );
}
