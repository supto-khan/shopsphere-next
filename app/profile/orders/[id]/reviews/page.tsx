'use client';

import React, { Suspense, useState } from 'react';
import OrderSubShell, { OrderShellContext } from '@/components/OrderSubShell';
import { api } from '@/lib/api';
import { resolveProductImage, resolveStorageImage, parseProduct, formatOrderDateTime } from '@/lib/order-utils';
import { Loader2, ShoppingBag, Star, X, ImagePlus, MessageSquare } from 'lucide-react';

function Thumb({ product, className = '' }: { product?: any; className?: string }) {
  const src = resolveProductImage(product);
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return <div className={`w-full h-full flex items-center justify-center text-primary-600 bg-primary-50 ${className}`}><ShoppingBag size={22} /></div>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={product?.name || 'product'} className={`w-full h-full object-cover ${className}`} onError={() => setErrored(true)} />;
}

interface EditState {
  productId: number;
  name: string;
  rating: number;
  comment: string;
}

function ReviewsContent({ order, items, orderId, reload }: OrderShellContext) {
  const [edit, setEdit] = useState<EditState | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const isReviewable = order?.order_type === 'default_type' && order?.order_status === 'delivered';

  const cards = (items || [])
    .map((detail) => {
      const product = detail?.productAllStatus || parseProduct(detail?.product_details);
      if (!product) return null;
      const hasReview = !!detail?.reviewData;
      if (!hasReview && !isReviewable) return null; // nothing to show for this item
      return { detail, product, hasReview };
    })
    .filter(Boolean) as { detail: any; product: any; hasReview: boolean }[];

  const openEditor = (detail: any, product: any) => {
    setFiles([]);
    setEdit({
      productId: detail.product_id || product.id,
      name: product?.name || `#${detail.product_id}`,
      rating: detail?.reviewData?.rating || 5,
      comment: detail?.reviewData?.comment || '',
    });
  };

  const submit = async () => {
    if (!edit) return;
    setSubmitting(true);
    try {
      await api.submitProductReview({
        product_id: edit.productId,
        order_id: orderId,
        comment: edit.comment,
        rating: edit.rating,
        files,
      });
      setEdit(null);
      await reload();
    } catch (err) {
      console.error('Product review failed', err);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cards.length) {
    return (
      <div className="mt-3 bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-10 text-center shadow-xl shadow-neutral-gray-100/10">
        <MessageSquare size={36} className="mx-auto text-neutral-400 mb-3" />
        <p className="text-xs font-semibold text-neutral-500">No reviews found for this order!</p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-4">
      {cards.map(({ detail, product, hasReview }, i) => {
        const review = detail?.reviewData;
        const attachments: any[] = review?.attachment_full_url || [];
        return (
          <div key={detail.id ?? i} className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 shadow-xl shadow-neutral-gray-100/10 hover:shadow-2xl hover:shadow-neutral-gray-100/20 transition-all duration-300">
            <div className="flex gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-neutral-gray-200/60 shrink-0 bg-neutral-gray-50 flex items-center justify-center">
                <Thumb product={product} />
              </div>
              <div className="flex-1 min-w-0">
                <h6 className="text-xs font-extrabold text-neutral-gray-900 capitalize line-clamp-2 leading-relaxed">{product?.name || `#${detail.product_id}`}</h6>
                {detail?.variant && (
                  <div className="text-[10px] font-extrabold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100 inline-block mt-1">
                    Variant: {detail.variant}
                  </div>
                )}
                <div>
                  <button
                    onClick={() => openEditor(detail, product)}
                    className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-[10px] font-bold shadow-md shadow-primary-600/10 cursor-pointer active:scale-95 transition-all"
                  >
                    <Star size={11} className="fill-neutral-white" />
                    <span>{hasReview ? 'Update Review' : 'Add Review'}</span>
                  </button>
                </div>
              </div>
            </div>

            {hasReview && (
              <div className="mt-4 pt-4 border-t border-neutral-gray-100">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <h6 className="flex items-center gap-1.5 font-extrabold text-xs text-neutral-gray-900">
                    <Star size={13} className="fill-primary-600 text-primary-600" />
                    <span>My Review</span>
                    <span className="text-[10px] font-extrabold text-neutral-400">({Number(review.rating).toFixed(1)} / 5.0)</span>
                  </h6>
                  {(review.created_at || review.updated_at) && (
                    <span className="text-[10px] font-bold text-neutral-400">{formatOrderDateTime(review.created_at || review.updated_at)}</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-neutral-600 leading-relaxed bg-neutral-gray-50/50 p-4 rounded-2xl border border-neutral-gray-200/20">{review.comment}</p>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {attachments.map((photo, k) => {
                      const src = resolveStorageImage(photo);
                      if (!src) return null;
                      // eslint-disable-next-line @next/next/no-img-element
                      return <img key={k} src={src} alt="review" className="w-16 h-16 object-cover rounded-xl border border-neutral-gray-200/60 shadow-sm" />;
                    })}
                  </div>
                )}

                {review.reply?.reply_text && (
                  <div className="mt-3 ml-4 border-l-2 border-primary-600 bg-primary-50 rounded-r-2xl p-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-neutral-900">Reply from Seller</span>
                    </div>
                    <p className="text-xs font-semibold text-neutral-600 leading-relaxed">{review.reply.reply_text}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {edit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setEdit(null)}>
          <div className="bg-neutral-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-neutral-gray-200/30 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-gray-100 bg-neutral-gray-50/20">
              <h3 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">Submit Product Review</h3>
              <button onClick={() => setEdit(null)} className="w-8 h-8 rounded-full hover:bg-neutral-gray-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"><X size={16} /></button>
            </div>
            <div className="p-6">
              <p className="text-xs font-extrabold text-neutral-400 truncate mb-4 uppercase tracking-wider">{edit.name}</p>
              
              <h5 className="text-center text-xs font-bold text-neutral-600 mb-4">Rate this product</h5>
              <div className="flex items-center justify-center gap-2 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} type="button" onClick={() => setEdit({ ...edit, rating: i })} className="cursor-pointer hover:scale-110 transition-transform">
                    <Star size={32} className={i <= edit.rating ? 'fill-primary-600 text-primary-600' : 'text-neutral-gray-200'} />
                  </button>
                ))}
              </div>
              <div className="text-center text-primary-600 text-xs font-extrabold mb-5 uppercase tracking-wider">Rating: {edit.rating} / 5</div>
              
              <h6 className="text-xs font-bold text-neutral-500 mb-2">Write your review</h6>
              <textarea
                rows={4}
                value={edit.comment}
                onChange={(e) => setEdit({ ...edit, comment: e.target.value })}
                placeholder="What did you like or dislike? How is the quality of this item?"
                className="w-full border border-neutral-gray-200/60 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-600/30 bg-neutral-gray-50/30"
              />
              
              <div className="mt-4 flex items-center justify-between">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-gray-200 text-[10px] font-extrabold text-neutral-500 cursor-pointer hover:bg-neutral-gray-50 transition-colors">
                  <ImagePlus size={14} /> Add Photos
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                </label>
                {files.length > 0 && <div className="text-[10px] font-bold text-neutral-400">{files.length} photo(s) selected</div>}
              </div>
              
              <div className="flex justify-end mt-5 border-t border-neutral-gray-100 pt-4">
                <button onClick={submit} disabled={submitting || !edit.comment.trim()}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60 transition-colors shadow-md shadow-primary-600/10">
                  {submitting && <Loader2 size={13} className="animate-spin" />} Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<main className="flex-1 min-w-0 p-6 flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={28} /></main>}>
      <OrderSubShell activeTab="reviews">
        {(ctx) => <ReviewsContent {...ctx} />}
      </OrderSubShell>
    </Suspense>
  );
}
