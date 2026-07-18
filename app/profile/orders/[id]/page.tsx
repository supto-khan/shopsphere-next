'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import OrderDetailsNav from '@/components/OrderDetailsNav';
import { OrderDetailSkeleton } from '@/components/profile-skeletons';
import { Loader2, User, ShoppingBag, Download, ArrowLeft, X, Star, Info } from 'lucide-react';

const CURRENCY = '৳';

function orderStatusClasses(status?: string): string {
  switch (status) {
    case 'delivered': return 'bg-success text-primary-800';
    case 'pending':
    case 'confirmed':
    case 'processing':
    case 'out_for_delivery': return 'bg-primary-50 text-primary-600';
    case 'canceled':
    case 'failed':
    case 'returned': return 'bg-danger text-red-600';
    default: return 'bg-neutral-gray-50 text-neutral-gray-600';
  }
}

function titleCase(value?: string | null): string {
  if (!value) return '';
  return String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function money(amount?: number | string): string {
  const n = Number(amount || 0);
  return `${CURRENCY}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Matches the Blade header date format: d M, Y h:i A
function formatOrderDateTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

// Mirror of App\Utils\OrderManager::getOrderTotalPriceSummary so the SPA shows
// the exact same figures the Blade template renders server-side.
function getOrderTotalPriceSummary(order: any, details: any[]) {
  let itemPrice = 0;
  let subTotal = 0;
  let itemDiscount = 0;
  let totalProductPrice = 0;
  let totalItemQuantity = 0;

  for (const detail of details) {
    const price = Number(detail.price) || 0;
    const qty = Number(detail.qty) || 0;
    itemPrice += price * qty;
    subTotal += price * qty;
    totalProductPrice += price * qty;
    itemDiscount += Number(detail.discount) || 0;
    totalItemQuantity += qty;
  }

  const total = itemPrice - itemDiscount;
  const shipping = Number(order?.shipping_cost) || 0;
  const discountAmount = Number(order?.discount_amount) || 0;

  let extraDiscount: number;
  if (order?.extra_discount_type === 'percent') {
    extraDiscount = ((totalProductPrice - itemDiscount - discountAmount) / 100) * (Number(order?.extra_discount) || 0);
  } else {
    extraDiscount = Number(order?.extra_discount) || 0;
  }

  const couponDiscount = discountAmount;
  const referAndEarnDiscount = Number(order?.refer_and_earn_discount) || 0;
  const isShippingFree = Number(order?.is_shipping_free) === 1;
  const taxTotal = Number(order?.total_tax_amount) || 0;

  const totalAmount = total + shipping - extraDiscount - couponDiscount - referAndEarnDiscount + taxTotal;

  let editedTotalPaidAmount = 0;
  if (Number(order?.edit_due_amount) > 0) {
    editedTotalPaidAmount = totalAmount - Number(order.edit_due_amount);
  } else if (Number(order?.edit_return_amount) > 0) {
    editedTotalPaidAmount = totalAmount + Number(order.edit_return_amount);
  }

  return {
    itemPrice,
    itemDiscount,
    extraDiscount,
    subTotal: subTotal - itemDiscount - (isShippingFree ? 0 : extraDiscount),
    couponDiscount,
    referAndEarnDiscount,
    taxTotal,
    tax_model: order?.tax_model,
    shippingTotal: shipping,
    totalItemQuantity,
    totalAmount,
    paidAmount: Number(order?.paid_amount) || 0,
    changeAmount: (Number(order?.paid_amount) || 0) - totalAmount,
    edited_total_paid_amount: editedTotalPaidAmount,
  };
}

// Parse an address blob that may arrive as a JSON string or an object.
function parseAddress(raw: any): any | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return raw;
}

// Resolve the correct product image URL, matching the convention used in
// ProductCard.tsx / CartDrawer.tsx.
function resolveProductImage(product?: any): string {
  if (!product) return '';
  const fullUrlObj = product.thumbnail_full_url;
  if (fullUrlObj && fullUrlObj.path && !fullUrlObj.path.includes('def.png')) {
    const cleanPath = fullUrlObj.path.replace(/^https?:\/\/[^/]+/, '');
    return cleanPath.replace('storage/app/public', 'storage');
  }
  if (product.thumbnail && !product.thumbnail.includes('def.png')) {
    return `/storage/product/thumbnail/${product.thumbnail}`;
  }
  return '';
}

function ProductThumb({ product, className = '' }: { product?: any; className?: string }) {
  const src = resolveProductImage(product);
  const [errored, setErrored] = useState(false);
  if (!src || errored) {
    return (
      <div className={`w-full h-full flex items-center justify-center text-primary-600 bg-primary-50 ${className}`}>
        <ShoppingBag size={22} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={product?.name || 'product'} className={`w-full h-full object-cover ${className}`} onError={() => setErrored(true)} />
  );
}

const refundLabels: Record<number, string> = {
  1: 'Refund Pending',
  2: 'Refund Approved',
  3: 'Refund Rejected',
  4: 'Refund Refunded',
};

/* -------------------------------------------------------------------------- */
/* Small presentational helpers                                               */
/* -------------------------------------------------------------------------- */

function InfoRow({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex justify-between gap-2 text-xs ${className}`}>
      <span className="text-neutral-gray-600 capitalize">{label}</span>
      <span className="font-semibold capitalize text-right">{children}</span>
    </div>
  );
}function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-5 shadow-xl shadow-neutral-gray-100/10 hover:shadow-2xl hover:shadow-neutral-gray-100/20 transition-all duration-300 ${className}`}>{children}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-white rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl border border-neutral-gray-200/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-gray-100 bg-neutral-gray-50/20">
          <h2 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">{title}</h2>
          <button onClick={onClose} aria-label="Close modal" className="w-12 h-12 rounded-full hover:bg-neutral-gray-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"><X size={16} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function OrderDetailsContent() {
  const { isLoggedIn, setLoginOpen } = useAppStore();
  const router = useRouter();
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const orderId = Number(rawId);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);

  const loadOrder = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getOrderDetails(orderId);
      const list: any[] = Array.isArray(data) ? data : (data?.details || []);
      setItems(list);
      setOrder(list[0]?.order || null);
      if (!list.length) setNotFound(true);
      else setNotFound(false);
    } catch (err) {
      // Failed to load order details
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!isLoggedIn || !orderId) return;
    loadOrder();
  }, [isLoggedIn, orderId, loadOrder]);

  const summary = useMemo(() => (order ? getOrderTotalPriceSummary(order, items) : null), [order, items]);

  // Digital-product flag, replicating the Blade @foreach probe.
  const digitalProduct = useMemo(() => {
    for (const detail of items) {
      const product = detail?.product_details;
      if (product && typeof product === 'object' && product.digital_product_type) {
        if (product.product_type === 'digital') return true;
      }
    }
    return false;
  }, [items]);

  const shipping = useMemo(() => parseAddress(order?.shipping_address_data), [order]);
  const billing = useMemo(() => parseAddress(order?.billing_address_data), [order]);
  const edit = order?.latestEditHistory;

  const isDefault = order?.order_type === 'default_type';
  const isPos = order?.order_type === 'POS' || order?.order_type === 'pos';
  const isCod = order?.payment_method === 'cash_on_delivery';

  const downloadInvoice = async () => {
    if (!orderId) return;
    setDownloading(true);
    try {
      const bytes = await api.getOrderInvoice(orderId);
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Invoice download failed
      alert('Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  const cancelOrder = async () => {
    if (!orderId || !window.confirm('Want to cancel this order?')) return;
    setCanceling(true);
    try {
      await api.cancelOrder(orderId);
      await loadOrder();
    } catch (err) {
      // Cancel order failed
      alert('Status not changeable now');
    } finally {
      setCanceling(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="flex-1 min-w-0 p-6 flex items-center justify-center bg-neutral-white">
        <div className="text-center bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-10 max-w-md shadow-2xl">
          <User size={40} className="mx-auto text-neutral-gray-400 mb-4" />
          <h2 className="text-sm font-extrabold text-neutral-gray-900 mb-2">Please log in</h2>
          <p className="text-xs text-neutral-500 mb-6">You need to be logged in to view this order details.</p>
          <button onClick={() => setLoginOpen(true)} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/10 cursor-pointer active:scale-95 transition-all">Login</button>
        </div>
      </main>
    );
  }

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (notFound || !order) {
    return (
      <main className="flex-1 min-w-0 p-6 flex items-center justify-center bg-neutral-white">
        <div className="text-center bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-10 max-w-md shadow-2xl">
          <ShoppingBag size={40} className="mx-auto text-neutral-gray-400 mb-4" />
          <h2 className="text-sm font-extrabold text-neutral-gray-900 mb-2">Order Not Found</h2>
          <p className="text-xs text-neutral-500 mb-6">We couldn&apos;t find the order you&apos;re looking for.</p>
          <button onClick={() => router.push('/profile/orders')} className="px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/10 cursor-pointer active:scale-95 transition-all">Back to My Orders</button>
        </div>
      </main>
    );
  }

  const showVerificationCode = order.order_status !== 'delivered' && isDefault && !!order.verification_code;

  // Which "second column" payment card should render (mirrors Blade branch chain).
  const dueMethodPaidOrOffline = order.edited_status === 1 && (
    edit?.order_due_payment_method === 'offline_payment' ||
    edit?.order_due_payment_method === 'cash_on_delivery' ||
    edit?.order_due_payment_status === 'paid'
  );
  const showPayDueBill = order.edited_status === 1 && Number(order.edit_due_amount) > 0 && !isCod && !dueMethodPaidOrOffline;
  const showReturnPending = order.edited_status === 1 && edit?.order_return_payment_status === 'pending' && !dueMethodPaidOrOffline && !showPayDueBill;
  const showReturned = order.edited_status === 1 && edit?.order_return_payment_status === 'returned' && !dueMethodPaidOrOffline && !showPayDueBill && !showReturnPending;

  const sameAddress = billing && shipping &&
    billing.address === shipping.address &&
    billing.city === shipping.city &&
    billing.zip === shipping.zip;

  return (
    <div className="flex-1 flex min-w-0 bg-neutral-white">
      <main className="flex-1 min-w-0 bg-neutral-white">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Top navbar row: back + download */}
          <div className="flex items-center justify-between border-b border-neutral-gray-100 pb-4">
            <button
              onClick={() => router.push('/profile/orders')}
              className="flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-primary-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back to Orders</span>
            </button>
            <button
              onClick={downloadInvoice}
              disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/10 cursor-pointer active:scale-95 transition-all disabled:opacity-60 hover:-translate-y-0.5"
            >
              {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span>Download Invoice</span>
            </button>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-primary-600 rounded" />
              <h1 className="text-lg font-extrabold text-neutral-gray-900 tracking-tight">
                Order #{order.id}
              </h1>
              {order.edited_status === 1 && (
                <span className="text-xs font-bold text-neutral-500 bg-neutral-gray-100 px-2 py-0.5 rounded-md border border-neutral-gray-200/40">Edited</span>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize border ${orderStatusClasses(order.order_status)}`}>
                {order.order_status === 'processing' ? 'Packaging' : order.order_status === 'out_for_delivery' ? 'Out For Delivery' : order.order_status === 'failed' ? 'Failed To Deliver' : titleCase(order.order_status)}
              </span>
            </div>
            {order.created_at && (
              <div className="text-xs font-semibold text-neutral-gray-500 mt-2 ml-4.5">
                {formatOrderDateTime(order.created_at)}
              </div>
            )}
          </div>

          {/* Order details tab menu */}
          <OrderDetailsNav orderId={order.id} order={order} activeTab="summary" />

          {/* "Please bring change" badge */}
          {(isCod || edit?.order_due_payment_method === 'cash_on_delivery') && Number(order.bring_change_amount) > 0 && (
            <div className="bg-primary-50 border border-primary-100 text-neutral-gray-900 rounded-2xl px-4.5 py-3 text-xs">
              💡 Please bring <strong>{order.bring_change_amount} {order.bring_change_amount_currency || ''}</strong> in change when making the delivery
            </div>
          )}

          {/* POS order info bar */}
          {isPos && (
            <Card className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs font-extrabold text-neutral-gray-900 tracking-tight">POS Order Information</div>
              <div className="flex flex-wrap items-center gap-5 text-[11px] font-bold">
                <div className="flex items-center gap-1.5"><span className="text-neutral-gray-400">Order Type:</span><span className="text-primary-600">POS</span></div>
                <div className="flex items-center gap-1.5"><span className="text-neutral-gray-400">Payment Status:</span><span className="text-green-600 capitalize">{order.payment_status}</span></div>
                <div className="flex items-center gap-1.5"><span className="text-neutral-gray-400">Payment Method:</span><span className="text-neutral-700 capitalize">{titleCase(order.payment_method)}</span></div>
              </div>
            </Card>
          )}

          {/* default_type info blocks */}
          {isDefault && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Order info */}
              <Card className={`${showVerificationCode ? '' : 'md:col-span-2'} flex justify-between gap-4 items-center`}>
                <div className="text-xs font-extrabold text-neutral-gray-900 tracking-tight">Order Information</div>
                <div className="flex flex-col gap-1.5 min-w-[180px]">
                  <InfoRow label="Order Type"><span className="text-primary-600">{titleCase(order.order_type)}</span></InfoRow>
                  {isCod && (
                    <>
                      <InfoRow label="Payment status">
                        <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}>{titleCase(order.payment_status)}</span>
                      </InfoRow>
                      <InfoRow label="Payment method">{titleCase(order.payment_method)}</InfoRow>
                    </>
                  )}
                </div>
              </Card>

              {/* Verification code */}
              {showVerificationCode && (
                <Card className="flex items-center justify-between gap-4">
                  <div className="text-xs font-extrabold text-neutral-gray-500">Order Verification Code</div>
                  <div className="text-base font-extrabold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-100 tracking-wider font-mono">{order.verification_code}</div>
                </Card>
              )}

              {/* Payment info (non-COD) */}
              {!isCod && (
                <div className="md:col-span-2 flex flex-col gap-4">
                  {/* Primary payment info */}
                  <Card className="w-full">
                    <div className="text-xs font-extrabold text-neutral-gray-900 tracking-tight mb-3">Primary Payment Details</div>
                    <div className="flex flex-col gap-2 font-semibold text-xs text-neutral-600">
                      <InfoRow label="Payment status" className="justify-start gap-2">
                        {order.edited_status === 1 && Number(order.edit_due_amount) > 0 && edit?.order_due_payment_method !== 'cash_on_delivery' && edit?.order_due_payment_status === 'unpaid'
                          ? <span className="text-green-600 font-extrabold">Partially Paid</span>
                          : <span className={order.payment_status === 'paid' ? 'text-green-600 font-extrabold' : 'text-red-600 font-extrabold'}>{order.payment_status}</span>}
                      </InfoRow>
                      <InfoRow label="Payment method" className="justify-start gap-2">{titleCase(order.payment_method)}</InfoRow>
                      <InfoRow label="Amount" className="justify-start gap-2">
                        {Number(order.total_order_amount) > 0 ? money(order.total_order_amount) : money(order.init_order_amount)}
                      </InfoRow>
                      {order.payment_method === 'offline_payment' && order.offlinePayments && (
                        <button onClick={() => setShowOfflineModal(true)} className="self-start mt-2 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-800 text-[10px] font-extrabold border border-primary-100 cursor-pointer transition-colors">
                          See Payment Info
                        </button>
                      )}
                    </div>
                  </Card>

                  {/* Second card variants */}
                  {dueMethodPaidOrOffline && (
                    <Card className="w-full">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-xs font-extrabold text-neutral-gray-900 tracking-tight">Additional Payment</div>
                        <span className={`text-[10px] font-extrabold capitalize border px-2 py-0.5 rounded-full ${edit?.order_due_payment_status === 'paid' ? 'bg-green-100/70 text-green-800 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>{edit?.order_due_payment_status}</span>
                      </div>
                      <div className="flex flex-col gap-2 font-semibold text-xs text-neutral-600">
                        <InfoRow label="Payment method" className="justify-start gap-2">{titleCase(edit?.order_due_payment_method)}</InfoRow>
                        <InfoRow label="Due amount" className="justify-start gap-2">{money(edit?.order_due_amount)}</InfoRow>
                        {edit?.order_due_payment_method === 'offline_payment' && edit?.order_due_payment_info && (
                          <button onClick={() => setShowDueModal(true)} className="self-start mt-2 px-3 py-1.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-800 text-[10px] font-extrabold border border-primary-100 cursor-pointer transition-colors">
                            See Payment Details
                          </button>
                        )}
                      </div>
                    </Card>
                  )}

                  {showPayDueBill && (
                    <Card className="w-full flex flex-col items-center justify-center text-center p-6 border border-red-200/60 bg-red-50/20 gap-2">
                      <div className="text-sm text-red-600 font-extrabold tracking-tight">Pay Due Bill</div>
                      <p className="text-xs font-semibold text-neutral-500 max-w-[280px]">
                        Following recent adjustments, please settle the remaining balance of{' '}
                        <strong className="text-neutral-900 font-extrabold text-sm">{money(order.edit_due_amount)}</strong> to resume order fulfillment.
                      </p>
                    </Card>
                  )}

                  {showReturnPending && (
                    <Card className="w-full flex flex-col justify-center p-6 border border-green-200/60 bg-green-50/20 gap-2">
                      <div className="text-sm text-green-600 font-extrabold tracking-tight">Returned Amount Pending</div>
                      <p className="text-xs font-semibold text-neutral-500">
                        An overpayment of <strong className="text-neutral-900 font-extrabold text-sm">{money(edit?.order_return_amount)}</strong> will be credited back to your account.
                      </p>
                    </Card>
                  )}

                  {showReturned && (
                    <Card className="w-full">
                      <div className="text-xs font-extrabold text-neutral-gray-900 tracking-tight mb-3">Refund Details</div>
                      <div className="flex flex-col gap-2 font-semibold text-xs text-neutral-600">
                        <InfoRow label="Payment status" className="justify-start gap-2">
                          <span className="text-green-600 font-extrabold">{edit?.order_return_payment_status}</span>
                        </InfoRow>
                        <InfoRow label="Return Amount" className="justify-start gap-2">{money(edit?.order_return_amount)}</InfoRow>
                        <InfoRow label="Refund method" className="justify-start gap-2">{titleCase(edit?.order_return_payment_method)}</InfoRow>
                        <div className="bg-neutral-gray-50 py-2.5 px-3 rounded-2xl text-[10px] font-bold mt-1 text-neutral-500 border border-neutral-gray-200/30">Note: {edit?.order_return_payment_note}</div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Shipping & Billing Addresses Side-by-Side */}
              {(shipping || billing) && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Shipping address */}
                  {shipping && Object.keys(shipping).length > 0 && (
                    <Card className="h-full">
                      <div className="text-xs font-extrabold text-neutral-gray-900 tracking-tight mb-3">Shipping Address</div>
                      <div className="space-y-1.5 text-xs text-neutral-600 font-semibold leading-relaxed">
                        <div className="flex"><span className="text-neutral-400 w-16 shrink-0">Name</span><span>{shipping.contact_person_name}</span></div>
                        <div className="flex"><span className="text-neutral-400 w-16 shrink-0">Phone</span><span>{shipping.phone}</span></div>
                        <div className="flex"><span className="text-neutral-400 w-16 shrink-0">City/Zip</span><span>{shipping.city}, {shipping.zip}</span></div>
                        <div className="flex items-start"><span className="text-neutral-400 w-16 shrink-0">Address</span><span className="text-neutral-800 font-bold">{shipping.address}</span></div>
                      </div>
                    </Card>
                  )}

                  {/* Billing address */}
                  {billing && Object.keys(billing).length > 0 && (
                    <Card className="h-full">
                      <div className="text-xs font-extrabold text-neutral-gray-900 tracking-tight mb-3">Billing Address</div>
                      {sameAddress ? (
                        <div className="py-6 text-center text-xs font-bold text-neutral-400 flex items-center justify-center h-full">Same as shipping address</div>
                      ) : (
                        <div className="space-y-1.5 text-xs text-neutral-600 font-semibold leading-relaxed">
                          <div className="flex"><span className="text-neutral-400 w-16 shrink-0">Name</span><span>{billing.contact_person_name}</span></div>
                          <div className="flex"><span className="text-neutral-400 w-16 shrink-0">Phone</span><span>{billing.phone}</span></div>
                          <div className="flex"><span className="text-neutral-400 w-16 shrink-0">City/Zip</span><span>{billing.city}, {billing.zip}</span></div>
                          <div className="flex items-start"><span className="text-neutral-400 w-16 shrink-0">Address</span><span className="text-neutral-800 font-bold">{billing.address}</span></div>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reorder banner */}
          {order.order_status === 'delivered' && (
            <Card className="flex flex-wrap items-center justify-between gap-4 border border-green-100 bg-green-50/10">
              <p className="text-xs font-bold text-neutral-700">Want to buy the same products again?</p>
              <button
                onClick={() => router.push('/profile/orders')}
                className="px-4.5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-primary-600/10 hover:-translate-y-0.5"
              >
                Reorder Items
              </button>
            </Card>
          )}

          {/* Items table */}
          <div className="border border-neutral-gray-200/50 rounded-3xl overflow-hidden shadow-xl shadow-neutral-gray-100/10 bg-neutral-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-xs font-semibold">
                <thead className="bg-neutral-gray-50 text-neutral-gray-400 border-b border-neutral-gray-100">
                  <tr>
                    <th className="text-left font-bold px-5 py-4">#</th>
                    <th className="text-left font-bold px-5 py-4">Item Details</th>
                    <th className="text-center font-bold px-5 py-4">Qty</th>
                    <th className="text-right font-bold px-5 py-4">Price</th>
                    <th className="text-right font-bold px-5 py-4">Discount</th>
                    <th className="text-right font-bold px-5 py-4">Total</th>
                    <th className="text-center font-bold px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-gray-100">
                  {items.map((detail, index) => {
                    const product = detail.product_details || detail.product;
                    if (!product) return null;
                    const qty = Number(detail.qty) || 0;
                    const price = Number(detail.price) || 0;
                    const canDownloadDigital = product && order.payment_status === 'paid' && product.digital_product_type &&
                      (product.digital_product_type === 'ready_product' ||
                        (product.digital_product_type === 'ready_after_sell' && detail.digital_file_after_sell));
                    const showReview = isDefault && order.order_status === 'delivered' && detail.product;
                    const showActionCol =
                      (isDefault && (order.order_status === 'delivered' || (order.payment_status === 'paid' && digitalProduct))) ||
                      (!isDefault && order.order_status === 'delivered');
                    return (
                      <tr key={detail.id ?? index} className="hover:bg-neutral-gray-50/30 transition-colors">
                        <td className="px-5 py-4 align-middle text-neutral-400">{index + 1}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3.5 min-w-[220px]">
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-neutral-gray-200/60 shrink-0 bg-neutral-gray-50 flex items-center justify-center">
                              <ProductThumb product={product} />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <button
                                onClick={() => product.slug && router.push(`/product/${product.slug}`)}
                                className="text-left text-xs font-bold text-neutral-gray-900 line-clamp-2 hover:text-primary-600 transition-colors leading-relaxed cursor-pointer"
                              >
                                {product.name || `#${detail.product_id}`}
                              </button>
                              <div className="text-[10px] font-bold text-neutral-gray-400">Unit Price: {money(detail.price)}</div>
                              {detail.refund_request > 0 && refundLabels[detail.refund_request] && (
                                <div className="text-[10px] font-bold text-red-500">({refundLabels[detail.refund_request]})</div>
                              )}
                              {detail.variant && (
                                <div className="text-[10px] font-extrabold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100 inline-block mt-0.5">
                                  {detail.variant}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center align-middle font-bold text-neutral-800">{qty}</td>
                        <td className="px-5 py-4 text-right align-middle font-bold text-neutral-800">{money(price * qty)}</td>
                        <td className="px-5 py-4 text-right align-middle font-bold text-red-600">{money(detail.discount)}</td>
                        <td className="px-5 py-4 text-right align-middle font-extrabold text-neutral-900">{money(qty * price - (Number(detail.discount) || 0))}</td>
                        <td className="px-5 py-4 text-center align-middle">
                          {showActionCol ? (
                            <div className="flex items-center justify-center gap-2">
                              {showReview && (
                                <button
                                  onClick={() => product.slug && router.push(`/product/${product.slug}`)}
                                  className="inline-flex items-center gap-1 text-primary-600 text-[10px] font-extrabold hover:text-primary-800 transition-colors cursor-pointer border border-primary-200/50 bg-primary-50 px-2.5 py-1.5 rounded-xl"
                                >
                                  <Star size={11} className="fill-primary-600" />
                                  <span>{detail.reviewData ? 'Update Review' : 'Add Review'}</span>
                                </button>
                              )}
                              {canDownloadDigital && (
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 cursor-pointer shadow-sm"
                                  title="Download File"
                                >
                                  <Download size={13} />
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-neutral-300">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price summary */}
          {summary && (
            <div className="w-full border border-neutral-gray-200/50 rounded-3xl p-5 shadow-xl shadow-neutral-gray-100/10 bg-neutral-white space-y-4">
              {order.edited_status ? (
                <div className="bg-primary-50 border border-primary-100 text-neutral-800 rounded-2xl px-3.5 py-2.5 text-[10px] font-bold flex items-center gap-2">
                  <Info size={13} className="text-primary-600" />
                  <span>Total bill has been updated after recent order adjustments.</span>
                </div>
              ) : null}

              <div className="space-y-2 text-xs font-semibold text-neutral-600">
                <SummaryRow label="Total Items" value={String(summary.totalItemQuantity)} />
                <SummaryRow label="Items Price" value={money(summary.itemPrice)} />
                  <SummaryRow label="Items Discount" value={`- ${money(summary.itemDiscount)}`} />
                  {!isDefault && <SummaryRow label="Extra discount" value={`- ${money(summary.extraDiscount)}`} />}
                  <SummaryRow label="Subtotal" value={money(summary.subTotal)} />
                  <SummaryRow label="Coupon discount" value={`- ${money(summary.couponDiscount)}`} />
                  {summary.referAndEarnDiscount > 0 && <SummaryRow label="Referral discount" value={`- ${money(summary.referAndEarnDiscount)}`} />}
                  <SummaryRow label="VAT / Tax" value={money(summary.taxTotal)} />
                  {isDefault && Number(order.is_shipping_free) === 0 && <SummaryRow label="Shipping Fee" value={money(summary.shippingTotal)} />}

                  <div className="flex justify-between items-center border-t border-neutral-gray-100 pt-3 mt-1.5">
                    <span className="font-extrabold text-neutral-900 text-sm">
                      Total Bill{' '}
                      {summary.tax_model === 'include' && <span className="text-[9px] font-bold text-neutral-400 ml-1">(Tax Included)</span>}
                    </span>
                    <span className="font-extrabold text-neutral-900 text-sm">{money(summary.totalAmount)}</span>
                  </div>

                  {Number(summary.edited_total_paid_amount) > 0 && (
                    <SummaryRow label="Paid Amount" value={money(summary.edited_total_paid_amount)} />
                  )}

                  {/* Edited order due/return breakdown */}
                  {order.edited_status === 1 && edit && (
                    <div className="pt-2.5 border-t border-dashed border-neutral-gray-100 space-y-2">
                      {Number(edit.order_due_amount) > 0 && (
                        edit.order_due_payment_status === 'paid' ? (
                          <>
                            <SummaryRow label="Paid Amount" value={money(Number(edit.order_amount) - Number(edit.order_due_amount))} />
                            <SummaryRow
                              label={`Due Paid (${titleCase(edit.order_due_payment_method)})`}
                              value={money(edit.order_due_amount)}
                            />
                            <div className="flex justify-between items-center border-t border-neutral-gray-100 pt-2.5">
                              <span className="font-extrabold text-neutral-900">Total Paid Amount</span>
                              <span className="font-extrabold text-neutral-900">{money(edit.order_amount)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center text-red-600">
                            <span className="font-bold">Due Balance</span>
                            <span className="font-extrabold">{money(edit.order_due_amount)}</span>
                          </div>
                        )
                      )}

                      {Number(edit.order_return_amount) > 0 && (
                        edit.order_return_payment_status === 'returned' ? (
                          <>
                            <SummaryRow label="Paid Amount" value={money(Number(edit.order_amount) + Number(edit.order_return_amount))} />
                            <div className="flex justify-between items-center border-t border-neutral-gray-100 pt-2.5">
                              <span className="font-extrabold text-neutral-900">Refunded ({titleCase(edit.order_return_payment_method)})</span>
                              <span className="font-extrabold text-neutral-900">{money(edit.order_return_amount)}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between items-center text-green-600">
                            <span className="font-bold">Amount To Refund</span>
                            <span className="font-extrabold">{money(edit.order_return_amount)}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* POS paid / change */}
                  {isPos && (
                    <div className="pt-2 border-t border-neutral-gray-100 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span>Paid amount</span>
                        <span className="font-bold">{money(summary.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Change amount</span>
                        <span className="font-bold">{money(summary.changeAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {order.order_status === 'pending' && (
                  <button
                    onClick={cancelOrder}
                    disabled={canceling}
                    className="w-full mt-2 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-red-100/50 active:scale-95"
                  >
                    {canceling && <Loader2 size={12} className="animate-spin" />}
                    <span>Cancel Order</span>
                  </button>
                )}
              </div>
            )}
        </div>
      </main>

      {/* Offline payment verification modal */}
      {showOfflineModal && order.offlinePayments && (
        <Modal title="Payment Verification" onClose={() => setShowOfflineModal(false)}>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-2">Customer Info</div>
              <div className="flex flex-col gap-1.5 text-xs text-neutral-600 font-semibold">
                <div className="flex gap-2">
                  <span className="min-w-[100px] text-neutral-400">Name</span>
                  <span className="font-bold text-neutral-800">{order.customer?.f_name || 'Not provided'} {order.customer?.l_name || ''}</span>
                </div>
                <div className="flex gap-2">
                  <span className="min-w-[100px] text-neutral-400">Phone</span>
                  <span className="font-bold text-neutral-800">{order.customer?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-gray-100 pt-4">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-gray-400 mb-2">Payment Details</div>
              <div className="flex flex-col gap-1.5 text-xs text-neutral-600 font-semibold">
                {Object.entries(order.offlinePayments.payment_info || {}).map(([key, value]) => (
                  key !== 'method_id' && (
                    <div key={key} className="flex gap-2">
                      <span className="min-w-[100px] text-neutral-400 capitalize">{titleCase(key)}</span>
                      <span className="font-bold text-neutral-800">{String(value ?? 'N/A')}</span>
                    </div>
                  )
                ))}
                {order.payment_note && (
                  <div className="flex gap-2 items-start mt-1">
                    <span className="min-w-[100px] text-neutral-400">Payment Note</span>
                    <span className="font-bold text-neutral-800 bg-neutral-gray-50 border border-neutral-gray-200/40 p-2.5 rounded-2xl w-full">{order.payment_note}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Order due payment info modal */}
      {showDueModal && edit?.order_due_payment_info && (
        <Modal title="Due Payment Details" onClose={() => setShowDueModal(false)}>
          <div className="space-y-2 text-xs text-neutral-600 font-semibold">
            {Object.entries(edit.order_due_payment_info || {}).map(([key, value]) => (
              key !== 'method_id' && (
                <div key={key} className="flex gap-2">
                  <span className="min-w-[100px] text-neutral-400 capitalize">{titleCase(key)}</span>
                  <span className="font-bold text-neutral-800">{String(value ?? 'N/A')}</span>
                </div>
              )
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-neutral-gray-600">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<main className="flex-1 min-w-0 p-6 flex items-center justify-center"><Loader2 className="animate-spin text-primary-600" size={28} /></main>}>
      <OrderDetailsContent />
    </Suspense>
  );
}
