'use client';

import React, { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { resolveStorageImage } from '@/lib/order-utils';
import { SupportSkeleton, TicketConversationSkeleton } from '@/components/profile-skeletons';
import { Loader2, Ticket as TicketIcon, Send, X, Plus, ArrowLeft, Paperclip, ChevronDown } from 'lucide-react';

type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

const PRIORITY_CLASS: Record<string, string> = {
  Urgent: 'bg-danger/10 text-red-600',
  High: 'bg-warning/10 text-warning',
  Medium: 'bg-success/10 text-success',
  Low: 'bg-primary-50 text-primary-600',
};

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString();
}

function Attachment({ att }: { att?: any }) {
  const path = typeof att === 'string' ? att : att?.path;
  const url = resolveStorageImage(path);
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <a href={url} target="_blank" rel="noreferrer" className="block border border-neutral-gray-200 rounded-lg overflow-hidden w-32 h-32">
      <img src={url} alt="attachment" className="w-full h-full object-cover" />
    </a>
  );
}

function TicketList({ onOpen, onNew }: { onOpen: (id: number) => void; onNew: () => void }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.getSupportTickets()
      .then((data) => { if (active) setTickets(Array.isArray(data) ? data : []); })
      .catch((e) => console.error('Failed to load tickets', e))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-gray-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
            <TicketIcon size={16} />
          </div>
          <h2 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">Support Tickets</h2>
        </div>
        <button 
          onClick={onNew} 
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-800 text-neutral-white text-xs font-bold transition-all duration-300 shadow-md shadow-primary-600/10 cursor-pointer hover:-translate-y-0.5"
        >
          <Plus size={14} />
          <span>New Ticket</span>
        </button>
      </div>

      {loading ? (
        <SupportSkeleton />
      ) : tickets.length === 0 ? (
        <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-12 text-center shadow-xl shadow-neutral-gray-100/10 flex flex-col items-center justify-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4 border border-primary-100"><TicketIcon size={20} /></div>
          <h2 className="text-sm font-extrabold text-neutral-gray-900 mb-1.5">No Support Tickets</h2>
          <p className="text-xs text-neutral-500 mb-6">If you have any questions or issues, feel free to open a support ticket.</p>
          <button 
            onClick={onNew} 
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/10 cursor-pointer active:scale-95 transition-all hover:-translate-y-0.5"
          >
            <Plus size={14} /> Open Ticket
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {tickets.map((t) => (
            <button 
              key={t.id} 
              onClick={() => onOpen(t.id)} 
              className="w-full text-left bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-5 hover:shadow-2xl hover:shadow-neutral-gray-100/20 hover:border-primary-200/60 transition-all duration-300 shadow-xl shadow-neutral-gray-100/10 flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <h6 className="font-bold text-neutral-gray-900 text-sm tracking-tight capitalize truncate mb-1.5">{t.subject || 'Support Ticket'}</h6>
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                  <span className={`px-2.5 py-0.5 rounded-full capitalize border ${PRIORITY_CLASS[t.priority] || 'bg-neutral-gray-200 text-neutral-600'}`}>
                    {t.priority}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full capitalize border ${
                    t.status === 'close' 
                      ? 'bg-red-50 text-red-600 border-red-100' 
                      : 'bg-green-100/70 text-green-800 border-green-200'
                  }`}>
                    {t.status === 'close' ? 'Closed' : 'Active'}
                  </span>
                  <span className="text-neutral-400 font-semibold">{timeAgo(t.created_at)}</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-neutral-gray-400 bg-neutral-gray-50 border border-neutral-gray-200/40 px-2.5 py-1 rounded-lg shrink-0">#{t.id}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketConversation({ ticketId, onBack }: { ticketId: number; onBack: () => void }) {
  const [convs, setConvs] = useState<any[]>([]);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const data = await api.getSupportTicketConv(ticketId);
      setConvs(Array.isArray(data) ? data : []);
      const first = Array.isArray(data) && data[0];
      setTicket(first ? { description: first.customer_message, attachment_full_url: first.attachment_full_url, created_at: first.created_at } : null);
    } catch (e) {
      console.error('Failed to load conversation', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [convs]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await api.replySupportTicket(ticketId, trimmed);
      setText('');
      await load();
    } catch (e) {
      setError('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const close = async () => {
    setClosing(true);
    try {
      await api.closeSupportTicket(ticketId);
      onBack();
    } catch (e) {
      console.error('Failed to close ticket', e);
    } finally {
      setClosing(false);
    }
  };

  const closed = ticket?.status === 'close';

  return (
    <div className="flex flex-col h-[calc(100vh-65px-2.5rem)] space-y-4">
      <div className="flex items-center justify-between gap-2 shrink-0">
        <button 
          onClick={onBack} 
          className="flex items-center gap-1 text-xs font-extrabold text-neutral-500 hover:text-primary-600 transition-colors cursor-pointer"
        >
          <ArrowLeft size={15} /> Back to Tickets
        </button>
        {!closed && (
          <button 
            onClick={close} 
            disabled={closing} 
            className="px-4 py-2 rounded-xl text-xs font-bold border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer disabled:opacity-60"
          >
            {closing ? <Loader2 size={12} className="animate-spin inline mr-1" /> : 'Close Ticket'}
          </button>
        )}
      </div>

      <div className="flex-1 border border-neutral-gray-200/50 rounded-3xl overflow-hidden flex flex-col bg-neutral-white shadow-xl shadow-neutral-gray-100/10">
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-neutral-gray-50/40">
          {loading ? (
            <TicketConversationSkeleton />
          ) : (
            convs.map((c, i) => {
              const isAdmin = !!c.admin_id;
              return (
                <div key={i} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-semibold leading-relaxed shadow-sm ${
                    isAdmin 
                      ? 'bg-neutral-white border border-neutral-gray-200 text-neutral-800 rounded-bl-md' 
                      : 'bg-primary-600 text-neutral-white rounded-br-md'
                  }`}>
                    <p className="whitespace-pre-wrap break-words">{c.admin_message || c.customer_message}</p>
                    {(c.attachment_full_url || []).map((a: any, ai: number) => <Attachment key={ai} att={a} />)}
                    <div className={`text-[9px] font-bold mt-1.5 ${isAdmin ? 'text-neutral-400' : 'text-primary-200'}`}>{timeAgo(c.created_at)}</div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>

        {!closed && (
          <>
            {error && <div className="px-5 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 border-t border-red-100">{error}</div>}
            <form className="flex items-center gap-2 border-t border-neutral-gray-100 p-3.5 bg-neutral-white shrink-0" onSubmit={(e) => { e.preventDefault(); send(); }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Reply to this ticket..."
                className="flex-1 rounded-2xl border border-neutral-gray-200 px-4 py-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 placeholder-neutral-gray-400"
              />
              <button 
                type="submit" 
                disabled={sending || !text.trim()} 
                className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-primary-600 text-neutral-white disabled:opacity-50 hover:bg-primary-800 transition-all cursor-pointer shadow-md shadow-primary-600/10 active:scale-95 shrink-0"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>
          </>
        )}
        {closed && <div className="px-5 py-4 text-center text-xs font-bold text-neutral-400 bg-neutral-gray-50 border-t border-neutral-gray-100">This support ticket has been closed.</div>}
      </div>
    </div>
  );
}

function NewTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
 
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await api.createSupportTicket({ subject, type, priority, description });
      onCreated();
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create ticket');
    } finally {
      setBusy(false);
    }
  };
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-neutral-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-gray-200/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-gray-100 bg-neutral-gray-50/20">
          <h3 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">Create Support Ticket</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-neutral-gray-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"><X size={16} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600" />
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Issue Type <span className="text-red-500">*</span></label>
            <input required value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g., Delivery dispute" className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600" />
          </div>
          <div className="relative">
            <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Priority</label>
            <button
              type="button"
              onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
              className="flex items-center justify-between w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 text-left select-none text-neutral-gray-800"
            >
              <span>{priority}</span>
              <ChevronDown size={14} className="text-neutral-gray-400" />
            </button>
            {priorityDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPriorityDropdownOpen(false)} />
                <div className="flex flex-col absolute left-0 right-0 mt-1.5 bg-neutral-white border border-neutral-gray-200/60 rounded-2xl shadow-xl z-20 py-1.5 animate-scale-up">
                  {(['Low', 'Medium', 'High', 'Urgent'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setPriority(p);
                        setPriorityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                        priority === p ? 'text-primary-600 bg-primary-50/60' : 'text-neutral-gray-700 hover:bg-neutral-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Detailed Description <span className="text-red-500">*</span></label>
            <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600" />
          </div>
          {error && <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">{error}</div>}
          <div className="flex justify-end gap-3 pt-3 border-t border-neutral-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-gray-50 cursor-pointer">Cancel</button>
            <button 
              type="submit" 
              disabled={busy} 
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 text-neutral-white hover:bg-primary-800 disabled:opacity-60 flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary-600/10 hover:-translate-y-0.5 transition-all"
            >
              {busy && <Loader2 size={12} className="animate-spin" />}
              <span>Create Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const [viewId, setViewId] = useState<number | null>(null);
  const [showNew, setShowNew] = useState(false);

  if (viewId !== null) {
    return <TicketConversation ticketId={viewId} onBack={() => setViewId(null)} />;
  }

  return (
    <>
      <TicketList onOpen={setViewId} onNew={() => setShowNew(true)} />
      {showNew && <NewTicketModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); }} />}
    </>
  );
}
