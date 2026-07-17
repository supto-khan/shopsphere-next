'use client';

import React, { Suspense, useMemo, useState } from 'react';
import OrderSubShell, { OrderShellContext } from '@/components/OrderSubShell';
import StarRating from '@/components/StarRating';
import { api } from '@/lib/api';
import { resolveStorageImage, formatOrderDateTime } from '@/lib/order-utils';
import { Loader2, Truck, UserCircle, Star, X, MessageCircle } from 'lucide-react';

const ratingWords: Record<number, string> = { 1: 'Poor', 2: 'Average', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

function Avatar({ url, className = '' }: { url?: any; className?: string }) {
  const src = resolveStorageImage(url);
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return <div className={`w-full h-full flex items-center justify-center text-primary-600 bg-primary-50 ${className}`}><UserCircle size={36} /></div>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="delivery man" className={`w-full h-full object-cover ${className}`} onError={() => setErrored(true)} />;
}

function DeliveryContent({ order, items, orderId, reload }: OrderShellContext) {
  const deliveryMan = order?.deliveryMan;
  const review = order?.deliveryManReview;
  const verificationImages: any[] = useMemo(
    () => (items || []).flatMap((it) => it?.verificationImages || []),
    [items]
  );

  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState<number>(review?.rating || 5);
  const [comment, setComment] = useState<string>(review?.comment || '');
  const [submitting, setSubmitting] = useState(false);

  const canReview = order?.payment_status === 'paid' && order?.order_type === 'default_type'
    && order?.order_status === 'delivered' && order?.delivery_man_id;

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.submitDeliverymanReview({ order_id: orderId, comment, rating });
      setShowReview(false);
      await reload();
    } catch (err) {
      console.error('Delivery man review failed', err);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Self delivery ---
  if (order?.delivery_type === 'self_delivery' && deliveryMan) {
    const avg = deliveryMan?.rating?.[0]?.average || 0;
    return (
      <div className="mt-3 space-y-4">
        <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 shadow-xl shadow-neutral-gray-100/10 flex flex-wrap items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary-200 shrink-0 bg-primary-50 p-0.5">
            <Avatar url={deliveryMan?.image_full_url} className="rounded-full" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h6 className="text-sm font-extrabold text-neutral-gray-900 capitalize mb-1">
                  {deliveryMan?.f_name} {deliveryMan?.l_name}
                </h6>
                <div className="flex items-center gap-1.5">
                  <StarRating rating={avg} />
                  {avg > 0 && <span className="text-[10px] font-extrabold text-neutral-gray-400">({Number(avg).toFixed(1)})</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <button type="button" disabled title="Chat is available in the full app"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-gray-50 border border-neutral-gray-200/60 text-neutral-400 text-xs font-bold disabled:opacity-60">
                  <MessageCircle size={14} /><span className="hidden sm:inline">Chat</span>
                </button>
                {canReview && (
                  <button type="button" onClick={() => setShowReview(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-800 text-neutral-white text-xs font-bold cursor-pointer transition-colors shadow-md shadow-primary-600/10 hover:-translate-y-0.5 active:translate-y-0 active:scale-95">
                    <Star size={14} className="fill-neutral-white" />
                    <span>{review?.comment || review?.rating ? 'Update Review' : 'Add Review'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {review && (
          <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 shadow-xl shadow-neutral-gray-100/10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-neutral-gray-100">
              <h6 className="flex items-center gap-1.5 font-extrabold text-xs text-neutral-gray-900">
                <Star size={14} className="fill-primary-600 text-primary-600" />
                <span>Delivery Quality Score: {Number(review.rating).toFixed(1)} / 5.0</span>
              </h6>
              {review.updated_at && <span className="text-[10px] font-bold text-neutral-400">{formatOrderDateTime(review.updated_at)}</span>}
            </div>
            <p className="text-xs font-semibold text-neutral-600 leading-relaxed bg-neutral-gray-50/50 p-4 rounded-2xl border border-neutral-gray-200/20">{review.comment}</p>
          </div>
        )}

        {verificationImages.length > 0 && (
          <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 shadow-xl shadow-neutral-gray-100/10">
            <h6 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider mb-4">
              Proof of Delivery Pictures
            </h6>
            <div className="flex flex-wrap gap-3">
              {verificationImages.map((img, i) => {
                const src = resolveStorageImage(img?.image_full_url);
                if (!src) return null;
                // eslint-disable-next-line @next/next/no-img-element
                return <img key={i} src={src} alt="verification" className="w-24 h-24 object-cover rounded-2xl border border-neutral-gray-200/60 shadow-sm hover:scale-105 transition-transform duration-300" />;
              })}
            </div>
          </div>
        )}

        {showReview && (
          <ReviewModal
            title="Submit Delivery Review"
            rating={rating}
            comment={comment}
            submitting={submitting}
            onRating={setRating}
            onComment={setComment}
            onClose={() => setShowReview(false)}
            onSubmit={submit}
          />
        )}
      </div>
    );
  }

  // --- Third party delivery ---
  if (order?.delivery_type === 'third_party_delivery') {
    return (
      <div className="mt-3 bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-6 shadow-xl shadow-neutral-gray-100/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100 shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wide">Delivery service name</div>
              <div className="text-xs font-bold text-neutral-800 mt-0.5">{order?.delivery_service_name || '--'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100 shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <div className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wide">Tracking ID</div>
              <div className="text-xs font-bold text-neutral-800 mt-0.5">{order?.third_party_delivery_tracking_id || '--'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- No delivery man assigned ---
  let message = 'No delivery partner assigned yet!';
  if (order?.order_type === 'POS') {
    message = 'This order is a POS order. Delivery partner is not assigned to POS orders.';
  } else if (order?.product_type_check === 'digital') {
    message = 'This order contains digital products. Physical delivery tracking is not applicable!';
  }
  return (
    <div className="mt-3 bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-10 text-center shadow-xl shadow-neutral-gray-100/10">
      <Truck size={36} className="mx-auto text-neutral-400 mb-3" />
      <p className="text-xs font-semibold text-neutral-500 max-w-md mx-auto leading-relaxed">{message}</p>
    </div>
  );
}

function ReviewModal({ title, rating, comment, submitting, onRating, onComment, onClose, onSubmit }: {
  title: string; rating: number; comment: string; submitting: boolean;
  onRating: (n: number) => void; onComment: (s: string) => void; onClose: () => void; onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-neutral-gray-200/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-gray-100 bg-neutral-gray-50/20">
          <h3 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-neutral-gray-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"><X size={16} /></button>
        </div>
        <div className="p-6">
          <h5 className="text-center text-xs font-bold text-neutral-600 mb-4">Rate the delivery quality</h5>
          <div className="flex items-center justify-center gap-2 mb-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" onClick={() => onRating(i)} className="cursor-pointer hover:scale-110 transition-transform">
                <Star size={32} className={i <= rating ? 'fill-primary-600 text-primary-600' : 'text-neutral-gray-200'} />
              </button>
            ))}
          </div>
          <div className="text-center text-primary-600 text-xs font-extrabold mb-5 uppercase tracking-wider">{ratingWords[rating] || 'Poor'}</div>
          <h6 className="text-xs font-bold text-neutral-500 mb-2">Have thoughts to share?</h6>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => onComment(e.target.value)}
            placeholder="Helpful partner, fast shipping, or great communication..."
            className="w-full border border-neutral-gray-200/60 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-600/30 bg-neutral-gray-50/30"
          />
          <div className="flex justify-end mt-4">
            <button onClick={onSubmit} disabled={submitting || !comment.trim()}
              className="inline-flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-60 transition-colors shadow-md shadow-primary-600/10">
              {submitting && <Loader2 size={13} className="animate-spin" />} Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryManInfoPage() {
  return (
    <Suspense fallback={<main className="flex-1 min-w-0 p-6 flex items-center justify-center bg-neutral-white"><Loader2 className="animate-spin text-primary-600" size={28} /></main>}>
      <OrderSubShell activeTab="delivery">
        {(ctx) => <DeliveryContent {...ctx} />}
      </OrderSubShell>
    </Suspense>
  );
}
