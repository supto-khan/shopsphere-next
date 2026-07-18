"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import ChatModal from "@/components/ChatModal";
import { api, Product } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { resolveImage } from "@/lib/image";
import {
  ChevronRight,
  ChevronLeft,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  MessageCircle,
  Share2,
  Package,
  Monitor,
  X,
} from "lucide-react";

/* ======================================================================== */
/* Helpers                                                                  */
/* ======================================================================== */

/** Resolve a backend image URL to the Next.js proxy path. */
function toProxyUrl(url?: any): string {
  return resolveImage(url, "/placeholder.webp");
}

/** Extract a usable image URL from either a string or a full_url object. */
function galleryImage(item: any): string {
  if (!item) return "/placeholder.webp";
  if (typeof item === "string") return toProxyUrl(item);
  return toProxyUrl(item?.path ?? item?.image_name ?? "");
}

/** Parse colors from either a JSON string or an array. */
function parseColors(colors: any): string[] {
  if (Array.isArray(colors)) return colors;
  if (typeof colors === "string" && colors.length) {
    try {
      const p = JSON.parse(colors);
      return Array.isArray(p) ? p : [];
    } catch {
      return [];
    }
  }
  return [];
}

/** Parse choice_options. */
function parseChoiceOptions(options: any): any[] {
  if (Array.isArray(options)) return options;
  return [];
}

/** Format a date as 'M-d-Y' to match the Blade template. */
function formatReviewDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr.replace(" ", "T"));
  if (isNaN(d.getTime())) return "";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getMonth()]}-${String(d.getDate()).padStart(2, "0")}-${d.getFullYear()}`;
}

/** Calculate discounted price. */
function getDiscountedPrice(unitPrice: number, discount: number, discountType: string): number {
  if (discountType === "amount" || discountType === "flat") return Math.max(0, unitPrice - discount);
  return Math.max(0, unitPrice - (unitPrice * discount) / 100);
}

/** Format discount string. */
function formatDiscountBadge(discount: number, discountType: string, currency: string): string {
  if (discountType === "percent") return `-${Math.round(discount)}%`;
  return `-${currency}${discount}`;
}

const CURRENCY = "৳";
const RATING_LABELS = ["Excellent", "Good", "Average", "Below Average", "Poor"];

/* ======================================================================== */
/* Skeleton                                                                 */
/* ======================================================================== */

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
      <div className="lg:col-span-9 space-y-6">
        <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 space-y-3">
              <div className="w-full aspect-square bg-neutral-gray-200 rounded-xl" />
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-16 h-16 bg-neutral-gray-200 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="md:col-span-7 space-y-4">
              <div className="h-7 bg-neutral-gray-200 rounded w-3/4" />
              <div className="h-4 bg-neutral-gray-200 rounded w-1/2" />
              <div className="h-8 bg-neutral-gray-200 rounded w-40" />
              <div className="h-10 bg-neutral-gray-200 rounded w-full" />
              <div className="h-12 bg-neutral-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
        <div className="h-40 bg-neutral-gray-200 rounded-xl" />
      </div>
      <div className="lg:col-span-3 space-y-4">
        <div className="h-48 bg-neutral-gray-200 rounded-xl" />
        <div className="h-64 bg-neutral-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

/* ======================================================================== */
/* Compact Seller Product Card (_seller-products-product-details)           */
/* ======================================================================== */

function SellerProductCard({ product: p }: { product: Product }) {
  const unitPrice = Number(p.unit_price) || 0;
  const discount = Number(p.discount) || 0;
  const hasDiscount = discount > 0;
  const finalPrice = getDiscountedPrice(unitPrice, discount, p.discount_type);

  let avgRating = 0,
    reviewCount = 0;
  const reviews: any[] = (p as any).reviews || [];
  const ratingArr: any[] = (p as any).rating || [];
  if (ratingArr.length > 0) {
    avgRating = Number(ratingArr[0]?.average) || 0;
    reviewCount = ratingArr.reduce((s: number, r: any) => s + (Number(r?.count) || 0), 0);
  } else if (reviews.length > 0) {
    avgRating = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length;
    reviewCount = reviews.length;
  }

  const fullUrlObj = (p as any).thumbnail_full_url;
  let imageSrc = "/placeholder.webp";
  if (fullUrlObj?.path && !fullUrlObj.path.includes("def.png"))
    imageSrc = toProxyUrl(fullUrlObj.path);
  else if (p.thumbnail && !p.thumbnail.includes("def.png"))
    imageSrc = toProxyUrl(`/storage/product/thumbnail/${p.thumbnail}`);

  return (
    <Link
      href={`/product/${p.slug}`}
      className="flex gap-4 p-3 bg-neutral-white border border-neutral-gray-200/50 rounded-2xl hover:shadow-xl hover:shadow-neutral-gray-100/35 hover:-translate-y-0.5 transition-all duration-300 group relative cursor-pointer shadow-sm"
    >
      {hasDiscount && (
        <span className="absolute top-2 left-2 z-10 bg-primary-600 text-neutral-white text-[9px] font-extrabold px-2 py-0.5 rounded-xl shadow-sm">
          {formatDiscountBadge(discount, p.discount_type, CURRENCY)}
        </span>
      )}
      <div className="w-[85px] h-[85px] shrink-0 flex items-center justify-center bg-neutral-gray-55/50 rounded-xl overflow-hidden border border-neutral-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={p.name || ""}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="text-xs font-bold text-neutral-800 line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors leading-relaxed">
          {p.name}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          {hasDiscount && (
            <del className="text-[10px] font-bold text-neutral-400">
              {CURRENCY}
              {unitPrice}
            </del>
          )}
          <span className="text-xs font-extrabold text-neutral-900">
            {CURRENCY}
            {finalPrice}
          </span>
        </div>
        {avgRating > 0 && (
          <div className="flex items-center gap-1">
            <StarRating rating={avgRating} size={11} showValue={false} />
            <span className="text-[9px] font-bold text-neutral-400">({reviewCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}

/* ======================================================================== */
/* Similar Product Card (_inline-single-product-without-eye)                */
/* ======================================================================== */

function SimilarProductCard({ product: p }: { product: Product }) {
  const unitPrice = Number(p.unit_price) || 0;
  const discount = Number(p.discount) || 0;
  const hasDiscount = discount > 0;
  const finalPrice = getDiscountedPrice(unitPrice, discount, p.discount_type);
  const isPhysical = (p as any).product_type === "physical";
  const outOfStock = isPhysical && (Number(p.current_stock) || 0) <= 0;

  let avgRating = 0,
    reviewCount = 0;
  const reviews: any[] = (p as any).reviews || [];
  const ratingArr: any[] = (p as any).rating || [];
  if (ratingArr.length > 0) {
    avgRating = Number(ratingArr[0]?.average) || 0;
    reviewCount = ratingArr.reduce((s: number, r: any) => s + (Number(r?.count) || 0), 0);
  } else if (reviews.length > 0) {
    avgRating = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length;
    reviewCount = reviews.length;
  }

  const fullUrlObj = (p as any).thumbnail_full_url;
  let imageSrc = "/placeholder.webp";
  if (fullUrlObj?.path && !fullUrlObj.path.includes("def.png"))
    imageSrc = toProxyUrl(fullUrlObj.path);
  else if (p.thumbnail && !p.thumbnail.includes("def.png"))
    imageSrc = toProxyUrl(`/storage/product/thumbnail/${p.thumbnail}`);

  return (
    <Link
      href={`/product/${p.slug}`}
      className="block border border-neutral-gray-200/50 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-neutral-gray-100/35 hover:-translate-y-1 transition-all duration-300 bg-neutral-white cursor-pointer shadow-sm group"
    >
      <div className="relative flex items-center justify-center bg-neutral-gray-50/50 aspect-square overflow-hidden">
        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-primary-600 text-neutral-white text-[9px] font-extrabold px-2 py-0.5 rounded-xl shadow-sm">
            {formatDiscountBadge(discount, p.discount_type, CURRENCY)}
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={p.name || ""}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-350"
        />
        {outOfStock && (
          <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-red-650 text-neutral-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-xl uppercase tracking-wider shadow-sm">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-4 text-center space-y-1.5">
        {avgRating > 0 && (
          <div className="flex items-center justify-center gap-1.5">
            <StarRating rating={avgRating} size={11} showValue={false} />
            <span className="text-[10px] font-bold text-neutral-400">({reviewCount})</span>
          </div>
        )}
        <div className="text-xs font-bold text-neutral-800 line-clamp-2 min-h-[36px] group-hover:text-primary-600 transition-colors leading-relaxed">
          {p.name}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1.5 border-t border-neutral-gray-50">
          {hasDiscount && (
            <del className="text-[10px] font-bold text-neutral-400">
              {CURRENCY}
              {unitPrice}
            </del>
          )}
          <span className="text-xs font-extrabold text-neutral-900">
            {CURRENCY}
            {finalPrice}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ======================================================================== */
/* Shop Icon SVG                                                            */
/* ======================================================================== */

function ShopIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary-600"
    >
      <path d="M3 9l1-5h16l1 5" />
      <path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

/* ======================================================================== */
/* Main Product Detail Page                                                 */
/* ======================================================================== */

export default function ProductDetailPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { addToCart, toggleCart, isLoggedIn, setLoginOpen } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState<any>(null);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [tab, setTab] = useState<"overview" | "reviews">("overview");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [restockRequested, setRestockRequested] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reviewsLimit, setReviewsLimit] = useState(3);
  const [imageModalSrc, setImageModalSrc] = useState<string | null>(null);

  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [sellerInfo, setSellerInfo] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  const [showSticky, setShowSticky] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);
  const thumbContainerRef = useRef<HTMLDivElement>(null);

  /* ----- Data fetching -------------------------------------------------- */

  useEffect(() => {
    if (!slug) return;
    let active = true;

    // Reset UI state on slug change
    setLoading(true);
    setNotFound(false);
    setProduct(null);
    setRelatedProducts([]);
    setStoreProducts([]);
    setSellerInfo(null);
    setConfig(null);
    setActiveImage(0);
    setShowFullDesc(false);
    setReviewsLimit(3);
    setTab("overview");

    async function loadProductPage() {
      // ── Step 1: fetch product details + config in parallel ─────────────────
      // getConfig() is cached so it resolves instantly on repeat visits.
      const [productRes, configRes] = await Promise.allSettled([
        api.getProductDetails(slug as string),
        api.getConfig(),
      ]);

      if (!active) return;

      // Handle config (non-critical — used for in-house shop slug)
      const configData = configRes.status === "fulfilled" ? configRes.value : null;
      if (active) setConfig(configData);

      // Handle product details
      if (productRes.status === "rejected" || !productRes.value || Object.keys(productRes.value).length === 0) {
        if (active) { setNotFound(true); setLoading(false); }
        return;
      }

      const data = productRes.value;

      // Apply product data to state
      if (active) {
        setProduct(data);
        const colors = parseColors(data.colors);
        setSelectedColor(colors.length ? colors[0] : null);
        const choices = parseChoiceOptions(data.choice_options);
        const initial: Record<string, string> = {};
        choices.forEach((c: any) => {
          if (Array.isArray(c.options) && c.options.length) initial[c.name] = c.options[0];
        });
        setSelectedChoices(initial);
        setQty(Number(data.minimum_order_qty) || 1);
        setWishlisted(Number(data.wish_list_count) > 0 && data.wish_list_count !== undefined);
        setLoading(false);
      }

      // ── Step 2: fire all secondary fetches in parallel ─────────────────────
      // Now we have both product and config, so we can resolve the store slug.
      const isSeller = data.added_by === "seller";
      const sellerSlug = isSeller ? data?.seller?.shop?.slug : null;
      const storeSlug = sellerSlug || configData?.in_house_shop?.slug;

      const secondaryFetches: Promise<any>[] = [
        api.getRelatedProducts(slug as string).catch(() => []),
      ];
      if (storeSlug) {
        secondaryFetches.push(api.getVendorProducts(storeSlug).catch(() => []));
        secondaryFetches.push(api.getSellerInfo(storeSlug).catch(() => null));
      }

      const [relatedRes, vendorRes, sellerRes] = await Promise.allSettled(secondaryFetches);

      if (!active) return;

      if (relatedRes?.status === "fulfilled") setRelatedProducts(Array.isArray(relatedRes.value) ? relatedRes.value : []);
      if (vendorRes?.status === "fulfilled") setStoreProducts(Array.isArray(vendorRes.value) ? vendorRes.value : []);
      if (sellerRes?.status === "fulfilled" && sellerRes.value) setSellerInfo(sellerRes.value);
    }

    loadProductPage();
    return () => { active = false; };
  }, [slug]);

  // Sticky bar: show when main details scroll out of view
  useEffect(() => {
    const onScroll = () => {
      if (!detailsRef.current) return;
      setShowSticky(detailsRef.current.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ----- Loading / not found -------------------------------------------- */

  if (loading) {
    return (
      <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-neutral-gray-600 font-semibold mb-2">Product not found</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-lg text-sm font-semibold cursor-pointer"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ----- Derived data --------------------------------------------------- */

  const hasColorImages =
    product.product_type === "physical" &&
    Array.isArray(product.color_images_full_url) &&
    product.color_images_full_url.length > 0;
  const imageSources: any[] = hasColorImages
    ? product.color_images_full_url
    : Array.isArray(product.images_full_url) && product.images_full_url.length > 0
      ? product.images_full_url
      : product.thumbnail
        ? [product.thumbnail]
        : [];
  const images: string[] =
    imageSources.length > 0 ? imageSources.map(galleryImage) : ["/placeholder.webp"];

  const colors = parseColors(product.colors);
  const choiceOptions = parseChoiceOptions(product.choice_options);
  const discount = Number(product.discount) || 0;
  const hasDiscount = discount > 0;
  const unitPrice = Number(product.unit_price) || 0;
  const finalUnit = getDiscountedPrice(unitPrice, discount, product.discount_type);
  const totalPrice = finalUnit * qty;

  const reviews: any[] = Array.isArray(product.reviews) ? product.reviews : [];
  const avgRating = Number(product.average_review) || 0;
  const reviewsCount = Number(product.reviews_count) || reviews.length;
  const minQty = Number(product.minimum_order_qty) || 1;
  const maxQty = product.product_type === "physical" ? Number(product.current_stock) || 100 : 100;

  const isDigital = product.product_type === "digital";
  const digitalExtensions: Record<string, any[]> =
    isDigital && product.digital_product_extensions ? product.digital_product_extensions : {};
  const publishingHouses: string[] = product.digital_product_publishing_house_names || [];
  const authors: string[] = product.digital_product_authors_names || [];

  const sellerShop = product.seller?.shop;
  const isSeller = product.added_by === "seller" && !!sellerShop;
  const shopName = isSeller ? sellerShop.name : config?.in_house_shop?.name || "In-house Shop";

  const sellerImageStatus = sellerShop?.image_full_url?.status;
  const inHouseImageStatus = config?.in_house_shop?.image_full_url?.status;
  const shopImage = isSeller
    ? sellerImageStatus === 200 && sellerShop?.image_full_url?.path
      ? toProxyUrl(sellerShop.image_full_url.path)
      : "/assets/front-end/img/placeholder/shop.png"
    : inHouseImageStatus === 200 && config?.in_house_shop?.image_full_url?.path
      ? toProxyUrl(config.in_house_shop.image_full_url.path)
      : "/assets/front-end/img/placeholder/shop.png";
  const sellerId = isSeller && sellerShop?.id ? Number(sellerShop.id) : 0;

  const outOfStock =
    product.product_type === "physical" && (Number(product.current_stock) || 0) <= 0;
  const orderCount = Number(product.order_count ?? product.order_details_count ?? 0);
  const wishlistCount = Number(product.wish_list_count ?? 0);

  const isTemporaryClose = isSeller
    ? sellerShop?.temporary_close === 1
    : config?.temporary_close === 1;
  const isVacationMode = isSeller
    ? sellerShop?.vacation_status === 1
    : config?.vacation_status === 1;
  const shopClosed = isTemporaryClose || isVacationMode;
  const shopSlug = isSeller ? sellerShop?.slug : config?.in_house_shop?.slug;

  const breakdown = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const s = Math.round(Number(r.rating) || 0);
    if (s >= 1 && s <= 5) breakdown[5 - s]++;
  });

  /* ----- Handlers ------------------------------------------------------- */

  const addToCartHandler = () => {
    addToCart({
      ...product,
      id: product.id,
      unit_price: product.unit_price,
      discount: product.discount,
      discount_type: product.discount_type,
    } as any);
  };

  const buyNowHandler = () => {
    addToCartHandler();
    toggleCart();
  };

  const toggleWishlist = async () => {
    if (wishlistBusy) return;
    setWishlistBusy(true);
    try {
      if (wishlisted) {
        await api.removeFromWishlist(product.id);
        setWishlisted(false);
      } else {
        await api.addToWishlist(product.id);
        setWishlisted(true);
      }
    } catch (err) {
      // Wishlist toggle failed
    } finally {
      setWishlistBusy(false);
    }
  };

  const requestRestock = async () => {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    try {
      await api.requestRestock(product.id);
      setRestockRequested(true);
    } catch (err) {
      // Restock request failed
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    const idx = colors.indexOf(color);
    if (idx !== -1 && idx < images.length) {
      setActiveImage(idx);
      if (thumbContainerRef.current) {
        const el = thumbContainerRef.current.children[idx] as HTMLElement | undefined;
        el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareLinks = [
    {
      name: "Facebook",
      color: "bg-[#1877F2]",
      href: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Twitter",
      color: "bg-[#1DA1F2]",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "LinkedIn",
      color: "bg-[#0A66C2]",
      href: `https://linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "WhatsApp",
      color: "bg-[#25D366]",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`,
    },
  ];

  const scrollThumbs = (dir: "prev" | "next") => {
    thumbContainerRef.current?.scrollBy({ left: dir === "next" ? 80 : -80, behavior: "smooth" });
  };

  /* ----- Render --------------------------------------------------------- */

  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center space-x-2 text-xs text-neutral-gray-600 mb-4">
          <Link
            href="/"
            className="hover:text-primary-600 hover:underline cursor-pointer transition-colors"
          >
            Home
          </Link>
          <ChevronRight size={12} />
          <span
            className="text-primary-600 truncate max-w-[200px] md:max-w-xs"
            title={product.name}
          >
            {product.name}
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" ref={detailsRef}>
          {/* ============================================================= */}
          {/* LEFT COLUMN (9 cols)                                          */}
          {/* ============================================================= */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            {/* ---- Main product card ---- */}
            <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 shadow-xl shadow-neutral-gray-100/10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Gallery (5/12) */}
                <div className="md:col-span-5">
                  <div className="relative">
                    {/* Main image */}
                    <div className="relative border border-neutral-gray-200/60 rounded-2xl overflow-hidden aspect-square bg-neutral-gray-50 flex items-center justify-center shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={images[activeImage]}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                      {hasDiscount && (
                        <span className="absolute top-3 left-3 bg-primary-600 text-neutral-white text-xs font-bold px-2.5 py-1 rounded-xl z-10 shadow-sm shadow-primary-600/10">
                          {formatDiscountBadge(discount, product.discount_type, CURRENCY)}
                        </span>
                      )}
                    </div>

                    {/* Gallery side icons */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col gap-3">
                      {/* Product type badge */}
                      <div
                        className="w-9 h-9 rounded-xl bg-neutral-white border border-neutral-gray-200/60 flex items-center justify-center shadow-sm"
                        title={isDigital ? "Digital Product" : "Physical Product"}
                      >
                        {isDigital ? (
                          <Monitor size={15} className="text-neutral-gray-500" />
                        ) : (
                          <Package size={15} className="text-neutral-gray-500" />
                        )}
                      </div>

                      {/* Mobile-only wishlist */}
                      <button
                        type="button"
                        onClick={toggleWishlist}
                        disabled={wishlistBusy}
                        className="w-9 h-9 rounded-xl bg-neutral-white border border-neutral-gray-200/60 flex sm:hidden items-center justify-center shadow-sm disabled:opacity-50 cursor-pointer"
                        aria-label="Toggle wishlist"
                      >
                        <Heart
                          size={15}
                          className={`text-primary-600 ${wishlisted ? "fill-primary-600" : ""}`}
                        />
                      </button>

                      {/* Share */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShareOpen((s) => !s)}
                          className="w-9 h-9 rounded-xl bg-neutral-white border border-neutral-gray-200/60 flex items-center justify-center shadow-sm text-primary-600 hover:bg-primary-50 cursor-pointer"
                          aria-label="Share"
                        >
                          <Share2 size={15} />
                        </button>
                        {shareOpen && (
                          <div className="absolute right-0 top-11 z-20 bg-neutral-white border border-neutral-gray-200/50 rounded-2xl shadow-xl p-2 flex flex-col gap-1.5 w-36 animate-fade-in">
                            {shareLinks.map((s) => (
                              <a
                                key={s.name}
                                href={s.href}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => setShareOpen(false)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-neutral-600 hover:bg-primary-50 hover:text-primary-600 cursor-pointer transition-colors"
                              >
                                <span
                                  className={`w-5 h-5 rounded-full ${s.color} flex items-center justify-center`}
                                >
                                  <Share2 size={10} className="text-neutral-white" />
                                </span>
                                {s.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                      <div className="mt-3 relative select-none">
                        <div className="relative">
                          <div
                            ref={thumbContainerRef}
                            className="flex gap-2 overflow-x-auto scrollbar-none scroll-smooth"
                          >
                            {images.map((src, i) => (
                              <button
                                key={i}
                                onClick={() => setActiveImage(i)}
                                className={`w-16 h-16 shrink-0 rounded-2xl border overflow-hidden transition-all cursor-pointer bg-neutral-gray-50 flex items-center justify-center ${i === activeImage ? "border-primary-600 ring-2 ring-primary-200 shadow-sm" : "border-neutral-gray-200/60"}`}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt="" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                          {images.length > 4 && (
                            <>
                              <button
                                onClick={() => scrollThumbs("prev")}
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-white/95 border border-neutral-gray-200 flex items-center justify-center shadow-sm z-10 cursor-pointer"
                              >
                                <ChevronLeft size={13} />
                              </button>
                              <button
                                onClick={() => scrollThumbs("next")}
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-white/95 border border-neutral-gray-200 flex items-center justify-center shadow-sm z-10 cursor-pointer"
                              >
                                <ChevronRight size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details (7/12) */}
                <div className="md:col-span-7">
                  <div className="flex flex-col gap-4">
                    <h1 className="text-lg font-extrabold text-neutral-gray-900 leading-snug tracking-tight">
                      {product.name}
                    </h1>

                    {/* Rating / reviews / orders / wishlist */}
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-neutral-500">
                      {avgRating > 0 && (
                        <>
                          <div className="flex items-center gap-1 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100">
                            <StarRating rating={avgRating} size={13} showValue={false} />
                            <span className="text-primary-800 text-[10px] font-extrabold">
                              ({avgRating.toFixed(1)})
                            </span>
                          </div>
                          <button
                            onClick={() => setTab("reviews")}
                            className="hover:text-primary-850 cursor-pointer transition-colors"
                          >
                            <span className="text-primary-800 font-extrabold">{reviewsCount}</span>{" "}
                            reviews
                          </button>
                          <span className="w-px h-3 bg-neutral-gray-200/80" />
                        </>
                      )}
                      <span>
                        <span className="text-primary-800 font-extrabold">{orderCount}</span> orders
                      </span>
                      <span className="w-px h-3 bg-neutral-gray-200/80" />
                      <span>
                        <span className="text-primary-800 font-extrabold">{wishlistCount}</span>{" "}
                        wishlisted
                      </span>
                    </div>

                    {/* Digital: authors / publishing house */}
                    {isDigital && (publishingHouses.length > 0 || authors.length > 0) && (
                      <div className="space-y-1.5 text-xs font-semibold text-neutral-600">
                        {publishingHouses.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-400 capitalize">Publishing House :</span>
                            <span className="font-extrabold text-neutral-900">
                              {publishingHouses.join(", ")}
                            </span>
                          </div>
                        )}
                        {authors.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-400 capitalize">Author :</span>
                            <span className="font-extrabold text-neutral-900">
                              {authors.join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 pb-2 border-b border-neutral-gray-100">
                      {hasDiscount && (
                        <del className="text-neutral-gray-400 text-xs font-bold">
                          {CURRENCY}
                          {unitPrice.toLocaleString()}
                        </del>
                      )}
                      <span className="text-xl font-extrabold text-primary-600">
                        {CURRENCY}
                        {finalUnit.toLocaleString()}
                      </span>
                    </div>

                    {/* Colors */}
                    {colors.length > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-neutral-400 w-20 shrink-0">
                          Color
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {colors.map((c: string) => (
                            <button
                              key={c}
                              onClick={() => handleColorSelect(c)}
                              title={c}
                              className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${selectedColor === c ? "border-primary-600 scale-110 shadow-md ring-2 ring-primary-100" : "border-neutral-200"}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Digital extensions */}
                    {Object.keys(digitalExtensions).map((extKey) => {
                      const group: any[] = digitalExtensions[extKey] || [];
                      if (!group.length) return null;
                      const stateKey = `ext-${extKey}`;
                      return (
                        <div key={extKey} className="flex items-center gap-3 flex-nowrap">
                          <span className="text-xs font-bold text-neutral-400 capitalize w-20 shrink-0">
                            {extKey}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {group.map((ext: string) => (
                              <button
                                key={ext}
                                onClick={() =>
                                  setSelectedChoices((prev) => ({ ...prev, [stateKey]: ext }))
                                }
                                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${selectedChoices[stateKey] === ext ? "border-primary-600 bg-primary-50 text-primary-700" : "border-neutral-250 text-neutral-700 hover:border-primary-200"}`}
                              >
                                {ext}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Choice / variation options */}
                    {choiceOptions.map((choice: any) => (
                      <div key={choice.name} className="flex items-center gap-3 flex-nowrap">
                        <span className="text-xs font-bold text-neutral-400 capitalize w-20 shrink-0">
                          {choice.title}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(choice.options) &&
                            choice.options.map((option: string) => (
                              <button
                                key={option}
                                onClick={() =>
                                  setSelectedChoices((prev) => ({ ...prev, [choice.name]: option }))
                                }
                                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${selectedChoices[choice.name] === option ? "border-primary-600 bg-primary-50 text-primary-700" : "border-neutral-250 text-neutral-700 hover:border-primary-200"}`}
                              >
                                {option}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}

                    {/* Quantity + Total price */}
                    <div className="flex flex-col gap-4 py-2 border-t border-neutral-gray-100">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-neutral-400 w-20 shrink-0">
                          Quantity
                        </span>
                        <div className="flex items-center border border-neutral-gray-200 rounded-xl overflow-hidden w-[120px] h-9.5 bg-neutral-gray-50/50">
                          <button
                            onClick={() => setQty((q) => Math.max(minQty, q - 1))}
                            disabled={qty <= minQty}
                            aria-label="Decrease quantity"
                            className="w-8.5 h-full flex items-center justify-center text-primary-600 hover:bg-neutral-gray-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="flex-1 text-center text-xs font-bold text-neutral-800">
                            {qty}
                          </span>
                          <button
                            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                            disabled={qty >= maxQty}
                            aria-label="Increase quantity"
                            className="w-8.5 h-full flex items-center justify-center text-primary-600 hover:bg-neutral-gray-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs font-extrabold text-neutral-400 capitalize">
                          Subtotal Price:
                        </span>
                        <span className="text-base font-extrabold text-primary-600">
                          {CURRENCY}
                          {totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-gray-100">
                      {shopClosed ? (
                        <>
                          <button
                            className="px-5 py-3 bg-neutral-100 text-neutral-400 rounded-xl text-xs font-bold cursor-not-allowed border border-neutral-200/50"
                            disabled
                          >
                            Buy Now
                          </button>
                          <button
                            className="px-5 py-3 bg-neutral-100 text-neutral-400 rounded-xl text-xs font-bold cursor-not-allowed border border-neutral-200/50"
                            disabled
                          >
                            Add to Cart
                          </button>
                        </>
                      ) : outOfStock ? null : (
                        <>
                          <button
                            onClick={buyNowHandler}
                            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                          >
                            Buy Now
                          </button>
                          <button
                            onClick={addToCartHandler}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-primary-600/10 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                          >
                            <ShoppingCart size={14} /> Add to Cart
                          </button>
                        </>
                      )}

                      {!isDigital && outOfStock && (
                        <button
                          onClick={requestRestock}
                          disabled={restockRequested}
                          className="px-5 py-3 border border-primary-600 hover:bg-primary-50 text-primary-700 rounded-xl text-xs font-bold disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-sm"
                        >
                          {restockRequested ? "Request Sent" : "Request Restock"}
                        </button>
                      )}

                      {/* Wishlist with count */}
                      <button
                        onClick={toggleWishlist}
                        disabled={wishlistBusy}
                        className="p-3 border border-neutral-200/80 rounded-xl text-primary-600 hover:bg-primary-50/50 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
                        aria-label="Add to wishlist"
                      >
                        <Heart size={15} className={wishlisted ? "fill-primary-600" : ""} />
                        <span className="text-xs font-bold text-neutral-500">{wishlistCount}</span>
                      </button>
                    </div>

                    {/* Shop closed alert */}
                    {shopClosed && (
                      <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-150 rounded-2xl px-4 py-3">
                        ⚠️ This shop is temporarily closed or on vacation. Checkout is currently
                        disabled for products from this vendor.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ---- Tabs: Overview & Reviews ---- */}
            <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 shadow-xl shadow-neutral-gray-100/10">
              <div className="flex gap-1.5 p-1 bg-neutral-gray-50 border border-neutral-gray-200/50 rounded-2xl mb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-fit">
                <button
                  onClick={() => setTab("overview")}
                  className={`px-4 py-2 text-xs font-bold capitalize transition-all duration-300 rounded-xl cursor-pointer ${tab === "overview" ? "bg-neutral-white text-primary-600 shadow-sm border border-neutral-gray-200/40" : "text-neutral-gray-500 hover:text-primary-600"}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setTab("reviews")}
                  className={`px-4 py-2 text-xs font-bold capitalize transition-all duration-300 rounded-xl cursor-pointer ${tab === "reviews" ? "bg-neutral-white text-primary-600 shadow-sm border border-neutral-gray-200/40" : "text-neutral-gray-500 hover:text-primary-600"}`}
                >
                  Reviews
                </button>
              </div>

              {tab === "overview" ? (
                <div className="px-0 lg:px-3">
                  <div
                    className={`relative ${showFullDesc ? "" : "max-h-[525px] overflow-hidden"}`}
                  >
                    {/* YouTube video */}
                    {product.video_url && product.video_url.includes("youtube.com/embed/") && (
                      <div className="mb-4">
                        <iframe
                          width="420"
                          height="315"
                          src={product.video_url}
                          title="Product video"
                          frameBorder={0}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                          className="rounded-lg max-w-full"
                        />
                      </div>
                    )}

                    {/* Detail description */}
                    {product.details ? (
                      <>
                        <h4 className="text-base font-bold mb-3 px-1">Detail Description</h4>
                        <div
                          className="text-sm text-neutral-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: product.details }}
                        />
                      </>
                    ) : (
                      (!product.video_url || !product.video_url.includes("youtube.com/embed/")) && (
                        <div className="text-center py-8">
                          <p className="text-neutral-gray-600 text-sm capitalize">
                            Product details not found!
                          </p>
                        </div>
                      )
                    )}
                  </div>

                  {product.details && (
                    <div className="flex justify-center mt-3">
                      <button
                        onClick={() => setShowFullDesc((s) => !s)}
                        className="px-5 py-2 border border-primary-600 text-primary-600 rounded-lg text-sm font-semibold hover:bg-primary-50 capitalize cursor-pointer"
                      >
                        {showFullDesc ? "See less" : "See more"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Reviews tab */
                <div>
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 text-neutral-600">
                      <MessageCircle size={32} className="mx-auto mb-3 text-neutral-400" />
                      <p className="text-sm capitalize">No review given yet!</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Rating breakdown */}
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-neutral-gray-900 mb-2">
                            {avgRating.toFixed(1)}
                          </div>
                          <StarRating rating={avgRating} size={18} showValue={false} />
                          <div className="text-xs text-neutral-600 mt-2">
                            {reviewsCount} ratings
                          </div>
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          {RATING_LABELS.map((label, i) => {
                            const count = breakdown[i];
                            const pct = reviewsCount ? (count / reviewsCount) * 100 : 0;
                            return (
                              <div key={label} className="flex items-center gap-2 text-sm">
                                <span className="w-28 text-neutral-600">{label}</span>
                                <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary-600 rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="w-8 text-right text-neutral-600">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-b border-neutral-gray-200 pb-3">
                        <span className="font-semibold text-neutral-gray-900 capitalize">
                          Product review
                        </span>
                      </div>

                      {/* Review list */}
                      <div className="space-y-4">
                        {reviews.slice(0, reviewsLimit).map((review: any, i: number) => {
                          const customer = review.customer || review.user || {};
                          const name =
                            `${customer.f_name || ""} ${customer.l_name || ""}`.trim() ||
                            "Customer";
                          const avatarUrl = customer.image_full_url?.path
                            ? toProxyUrl(customer.image_full_url.path)
                            : null;
                          const attachments: any[] = review.attachment_full_url || [];
                          const reply = review.reply;

                          return (
                            <div key={review.id ?? i}>
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3">
                                {/* Reviewer */}
                                <div className="md:col-span-4 flex gap-3">
                                  <div
                                    className={`shrink-0 ${reply ? "border-l-2 border-primary-200 pl-3" : ""}`}
                                  >
                                    <div className="w-14 h-14 rounded-full overflow-hidden border border-neutral-gray-200 bg-neutral-gray-50">
                                      {avatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          src={avatarUrl}
                                          alt={name}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary-600 font-bold text-lg">
                                          {name.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-sm font-semibold text-neutral-900 block">
                                      {name}
                                    </span>
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <StarRating
                                        rating={Number(review.rating) || 0}
                                        size={12}
                                        showValue={false}
                                      />
                                      <span className="text-xs text-neutral-600">
                                        {review.rating || 0} / 5
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Comment + attachments */}
                                <div className="md:col-span-6">
                                  <p className="text-sm text-neutral-700 break-words">
                                    {review.comment || ""}
                                  </p>
                                  {attachments.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {attachments.map((att: any, ai: number) => {
                                        const src = toProxyUrl(att?.path || att);
                                        if (src === "/placeholder.webp") return null;
                                        return (
                                          <button
                                            key={ai}
                                            onClick={() => setImageModalSrc(src)}
                                            className="w-[70px] h-[70px] rounded border border-neutral-gray-200 overflow-hidden hover:ring-2 hover:ring-primary-200 transition-all cursor-pointer"
                                          >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={src}
                                              alt="Review attachment"
                                              className="w-full h-full object-cover"
                                            />
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Date */}
                                <div className="md:col-span-2 text-right">
                                  <span className="text-xs font-semibold text-neutral-600">
                                    {formatReviewDate(review.updated_at || review.created_at)}
                                  </span>
                                </div>
                              </div>

                              {/* Seller reply */}
                              {reply && (
                                <div className="ml-4 md:ml-8 mt-2 mb-4">
                                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                                    <div className="flex flex-wrap justify-between items-center mb-2">
                                      <div className="flex items-center gap-2">
                                        <MessageCircle size={14} className="text-primary-600" />
                                        <div className="font-bold text-sm">Reply by Seller</div>
                                      </div>
                                      <span className="text-xs text-neutral-gray-500">
                                        {formatReviewDate(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-neutral-700">{reply.reply_text}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {reviews.length > reviewsLimit && (
                        <div className="flex justify-center">
                          <button
                            onClick={() => setReviewsLimit((l) => l + 3)}
                            className="px-5 py-2 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-lg text-sm font-semibold cursor-pointer"
                          >
                            View more
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================= */}
          {/* RIGHT COLUMN (3 cols) — Sidebar                               */}
          {/* ============================================================= */}
          <aside className="lg:col-span-3 space-y-4">
            {config?.company_reliability && Array.isArray(config.company_reliability) && (
              <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-5 shadow-xl shadow-neutral-gray-100/10 space-y-4">
                {config.company_reliability
                  .filter((r: any) => r?.status === 1 && r?.title)
                  .map((r: any, i: number) => {
                    let reliabilityImg = "";
                    if (r.image && typeof r.image === "object" && r.image.image_name) {
                      reliabilityImg = `/storage/company-reliability/${r.image.image_name}`;
                    } else if (r.image && typeof r.image === "string") {
                      reliabilityImg = toProxyUrl(`/storage/company-reliability/${r.image}`);
                    } else {
                      reliabilityImg = `/assets/front-end/img/${r.item}.png`;
                    }
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 text-xs font-bold text-neutral-800"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={reliabilityImg} alt="" className="w-5 h-5 object-contain" />
                        <span className="capitalize leading-tight">{r.title}</span>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Seller / In-house shop card */}
            {config?.business_mode === "multi" && (
              <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-5 shadow-xl shadow-neutral-gray-100/10 hover:shadow-2xl hover:shadow-neutral-gray-100/20 transition-all duration-300">
                <Link
                  href={shopSlug ? `/shop/${shopSlug}` : "#"}
                  className="flex items-center gap-3 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-neutral-gray-200 bg-primary-50 shrink-0 flex items-center justify-center shadow-sm">
                    {shopImage !== "/placeholder.webp" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={shopImage} alt={shopName} className="w-full h-full object-cover" />
                    ) : (
                      <ShopIcon />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-extrabold text-neutral-900 truncate mb-1 group-hover:text-primary-600 transition-colors leading-snug">
                      Seller Info
                    </div>
                    {isTemporaryClose && (
                      <span className="text-[10px] bg-red-50 border border-red-100 text-red-650 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        Temporary OFF
                      </span>
                    )}
                    {!isTemporaryClose && isVacationMode && (
                      <span className="text-[10px] bg-red-50 border border-red-100 text-red-650 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                        Closed Now
                      </span>
                    )}
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-2 mt-4 border-t border-b border-neutral-gray-100 py-3 my-2 bg-neutral-gray-50/40 rounded-2xl px-2">
                  <div className="text-center border-r border-neutral-gray-200/80">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                      Reviews
                    </div>
                    <div className="font-extrabold text-neutral-850 text-sm mt-0.5">
                      {Number(sellerInfo?.total_review ?? 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide">
                      Products
                    </div>
                    <div className="font-extrabold text-neutral-850 text-sm mt-0.5">
                      {Number(sellerInfo?.total_product ?? 0)}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <ChatModal
                    type="seller"
                    id={sellerId}
                    title={shopName}
                    subtitle={isSeller ? "Vendor" : "In-house Shop"}
                    triggerLabel="Chat with Vendor"
                  />
                </div>
              </div>
            )}

            {/* More from the store */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-3.5 px-1">
                <h2 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                  {config?.business_mode === "multi" ? "More from the store" : "You may also like"}
                </h2>
                <Link
                  href={shopSlug ? `/shop/${shopSlug}` : "#"}
                  className="text-xs font-bold text-primary-600 flex items-center gap-0.5 cursor-pointer hover:text-primary-800 transition-colors"
                >
                  View all <ChevronRight size={13} />
                </Link>
              </div>
              {storeProducts.length === 0 ? (
                <p className="text-xs font-bold text-neutral-400 px-1">No other products.</p>
              ) : (
                <div className="space-y-3">
                  {storeProducts.slice(0, 5).map((p, i) => (
                    <SellerProductCard key={`${p.id}-${i}`} product={p} />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* =============================================================== */}
        {/* Similar Products Section                                        */}
        {/* =============================================================== */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-neutral-gray-100/10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wide">
                  Similar products
                </h2>
                {product?.category?.slug && (
                  <Link
                    href={`/search?category=${product.category.slug}`}
                    className="text-xs font-bold text-primary-600 flex items-center gap-0.5 capitalize cursor-pointer hover:text-primary-800 transition-colors"
                  >
                    View all <ChevronRight size={13} />
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {relatedProducts.slice(0, 12).map((p, i) => (
                  <SimilarProductCard key={`${p.id}-${i}`} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* Sticky Bottom Bar (_product-details-sticky)                       */}
      {/* ================================================================= */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-neutral-white border-t border-neutral-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 ${showSticky ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col lg:flex-row justify-between gap-3">
            {/* Left: product info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded border border-neutral-gray-200 overflow-hidden shrink-0 hidden sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900 truncate">{product.name}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs mt-0.5">
                  {hasDiscount && (
                    <del className="text-neutral-gray-400">
                      {CURRENCY}
                      {unitPrice}
                    </del>
                  )}
                  <span className="font-bold text-primary-600">
                    {CURRENCY}
                    {finalUnit.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="bg-primary-600 text-neutral-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {formatDiscountBadge(discount, product.discount_type, CURRENCY)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: qty + buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center border border-primary-200 rounded-lg overflow-hidden w-[130px] h-10">
                <button
                  onClick={() => setQty((q) => Math.max(minQty, q - 1))}
                  disabled={qty <= minQty}
                  className="w-8 h-full flex items-center justify-center text-primary-600 bg-neutral-gray-50 hover:bg-neutral-gray-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="flex-1 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  className="w-8 h-full flex items-center justify-center text-primary-600 bg-neutral-gray-50 hover:bg-neutral-gray-100 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              <span className="hidden lg:block text-xl font-bold text-primary-600 whitespace-nowrap select-none">
                {CURRENCY}
                {totalPrice.toLocaleString()}
              </span>

              {shopClosed ? (
                <div className="text-xs text-red-600 font-semibold bg-danger/10 rounded-lg px-3 py-2">
                  You cannot add product to cart from this shop for now
                </div>
              ) : outOfStock ? (
                <button
                  onClick={requestRestock}
                  disabled={restockRequested}
                  className="px-4 py-2.5 border border-primary-600 text-primary-700 rounded-lg text-sm font-semibold hover:bg-primary-50 disabled:opacity-60 whitespace-nowrap cursor-pointer disabled:cursor-not-allowed"
                >
                  {restockRequested ? "Request Sent" : "Request Restock"}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={buyNowHandler}
                    className="px-4 py-2.5 bg-neutral-gray-900 hover:bg-neutral-gray-600 text-neutral-white rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={addToCartHandler}
                    className="px-4 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Image preview modal (review attachments)                          */}
      {/* ================================================================= */}
      {imageModalSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 cursor-pointer"
          onClick={() => setImageModalSrc(null)}
        >
          <div
            className="relative max-w-2xl w-full cursor-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setImageModalSrc(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-neutral-white border border-neutral-gray-200 flex items-center justify-center shadow-lg z-10 cursor-pointer"
            >
              <X size={16} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageModalSrc} alt="Preview" className="w-full rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
