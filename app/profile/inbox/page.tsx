'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { resolveStorageImage } from '@/lib/order-utils';
import { InboxSkeleton, ChatMessagesSkeleton } from '@/components/profile-skeletons';
import { Loader2, Search, MessageCircle, Send, Check, CheckCheck, ArrowLeft } from 'lucide-react';

type ChatType = 'seller' | 'delivery-man';

interface Attachment {
  key?: string;
  path?: string | null;
  status?: number;
}

interface Conversation {
  id: number;
  name: string;
  image: string | null;
  lastMessage: string;
  hasAttachment: boolean;
  unseen: number;
  time: string;
}

interface Message {
  id?: number;
  message?: string;
  sent_by_customer?: number;
  sent_by_seller?: number;
  sent_by_admin?: number;
  sent_by_delivery_man?: number;
  created_at?: string;
  attachment_full_url?: Attachment[];
}

function strrchr(str?: string, needle = '.'): string {
  if (!str) return '';
  const idx = str.lastIndexOf(needle);
  return idx >= 0 ? str.slice(idx) : '';
}

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

function formatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function resolveAttachments(atts?: Attachment[]): { type: 'file' | 'media'; src: string | null }[] {
  return (atts || []).map((a) => {
    const path = a?.path && a.status === 200 ? a.path : null;
    const src = resolveStorageImage(path);
    const ext = strrchr(a?.key, '.');
    const fileExts = ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx', '.csv'];
    return { type: fileExts.includes(ext || '') ? 'file' : 'media', src };
  });
}

function MessageBubble({ msg, peerImage }: { msg: Message; peerImage: string | null }) {
  // Safe and comprehensive check for customer-sent messages across type representations
  const mine = Number(msg.sent_by_customer) === 1 || String(msg.sent_by_customer) === 'true';
  const atts = resolveAttachments(msg.attachment_full_url);

  return (
    <div className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
      {!mine && (
        peerImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={peerImage} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
            <MessageCircle size={16} className="text-primary-600" />
          </div>
        )
      )}
      <div className={`flex flex-col max-w-[78%] ${mine ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
            mine
              ? 'bg-primary-600 text-neutral-white rounded-2xl rounded-br-md'
              : 'bg-neutral-white text-neutral-800 border border-neutral-gray-200 rounded-2xl rounded-bl-md'
          }`}
        >
          {atts.map((a, i) =>
            a.type === 'file' ? (
              <a key={i} href={a.src || '#'} target="_blank" rel="noreferrer" className={`block underline ${mine ? 'text-white' : 'text-primary-600'}`}>
                {a.src ? 'Attachment' : 'Attachment (unavailable)'}
              </a>
            ) : a.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={a.src} alt="attachment" className="mt-1 max-h-56 rounded-lg" />
            ) : null
          )}
          {msg.message ? <p className="whitespace-pre-wrap break-words">{msg.message}</p> : null}
        </div>
        <div className={`mt-1 flex items-center gap-1 px-1 text-[10px] text-neutral-400 ${mine ? 'flex-row-reverse' : ''}`}>
          <span>{formatTime(msg.created_at)}</span>
          {mine && (msg.id ? <CheckCheck size={12} className="text-primary-500" /> : <Check size={12} />)}
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const [tab, setTab] = useState<ChatType>('seller');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<number>(0);

  useEffect(() => {
    let active = true;
    setLoadingList(true);
    api.getChatList(tab)
      .then((data) => {
        if (!active) return;
        const chats: any[] = data?.chat || [];
        
        // Sort conversations descending by last message timestamp (newest first)
        const sortedChats = [...chats].sort((a, b) => {
          const timeA = a.created_at ? new Date(a.created_at.replace(' ', 'T')).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at.replace(' ', 'T')).getTime() : 0;
          return timeB - timeA;
        });

        setConversations(
          sortedChats.map((c) => {
            const isDelivery = !!c.delivery_man_id;
            const isAdmin = c.admin_id != null;
            const id = isAdmin ? 0 : (c.seller_id ?? c.delivery_man_id ?? 0);
            let name = '';
            let image: string | null = null;
            if (isDelivery) {
              name = `${c.deliveryMan?.f_name || ''} ${c.deliveryMan?.l_name || ''}`.trim() || 'Delivery Man';
              image = resolveStorageImage(c.deliveryMan?.image_full_url);
            } else if (!isAdmin && c.seller?.shop) {
              name = c.seller.shop.name || 'Vendor';
              image = resolveStorageImage(c.seller.shop.image_full_url);
            } else {
              name = 'In-house Shop';
              image = resolveStorageImage(c.seller?.shop?.image_full_url);
            }
            const atts = c.attachment_full_url ? (Array.isArray(c.attachment_full_url) ? c.attachment_full_url : []) : [];
            return {
              id,
              name,
              image,
              lastMessage: c.message || (atts.length ? 'Attachment' : ''),
              hasAttachment: atts.length > 0,
              unseen: Number(c.unseen_message_count || 0),
              time: timeAgo(c.created_at),
            };
          })
        );
      })
      .catch((e) => console.error('Failed to load chat list', e))
      .finally(() => { if (active) setLoadingList(false); });
    return () => { active = false; };
  }, [tab]);

  useEffect(() => {
    if (activeId === null) return;
    let active = true;
    setLoadingMessages(true);
    lastIdRef.current = 0;

    const fetchOnce = async (replace: boolean) => {
      try {
        const data = await api.getChatMessages(tab, activeId, 1, 50);
        const incoming: Message[] = data?.message || [];
        // Backend returns newest-first; copy BEFORE reversing so we never mutate
        // the shared array (mutating caused order flips + duplicates on each poll).
        const ordered = [...incoming].reverse();
        if (replace) {
          setMessages(ordered);
          lastIdRef.current = ordered.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
        } else {
          let changed = false;
          for (const m of ordered) {
            const mid = Number(m.id) || 0;
            if (mid > lastIdRef.current) {
              lastIdRef.current = mid;
              setMessages((prev) => [...prev, m]);
              changed = true;
            }
          }
          if (changed) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      } catch {
        if (active) setError('Could not load messages');
      } finally {
        if (active && replace) setLoadingMessages(false);
      }
    };

    fetchOnce(true);
    const interval = setInterval(() => fetchOnce(false), 3000);
    return () => { active = false; clearInterval(interval); };
  }, [activeId, tab]);

  useEffect(() => {
    if (listRef.current && messages.length) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const filtered = useMemo(
    () => conversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [conversations, search]
  );

  const activeConversation = conversations.find((c) => c.id === activeId);
  const peerImage = activeConversation?.image || null;

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || activeId === null) return;
    setSending(true);
    setError(null);
    try {
      await api.sendChatMessage(tab, activeId, trimmed);
      setText('');
      const data = await api.getChatMessages(tab, activeId, 1, 50);
      const ordered = [...(data?.message || [])].reverse();
      setMessages(ordered);
      lastIdRef.current = ordered.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) {
      setError('Message failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px-2.5rem)] space-y-4">
      {loadingList ? (
        <InboxSkeleton />
      ) : (
        <>
          {/* Custom Premium Tabs */}
          <div className="flex gap-2 p-1 bg-neutral-gray-50 border border-neutral-gray-200/40 rounded-2xl max-w-sm shrink-0">
            <button
              onClick={() => { setTab('seller'); setActiveId(null); }}
              className={`flex-1 px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                tab === 'seller' 
                  ? 'bg-neutral-white text-primary-600 shadow-md shadow-neutral-gray-200/50' 
                  : 'text-neutral-gray-500 hover:text-neutral-gray-900'
              }`}
            >
              Vendor Chat
            </button>
            <button
              onClick={() => { setTab('delivery-man'); setActiveId(null); }}
              className={`flex-1 px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
                tab === 'delivery-man' 
                  ? 'bg-neutral-white text-primary-600 shadow-md shadow-neutral-gray-200/50' 
                  : 'text-neutral-gray-500 hover:text-neutral-gray-900'
              }`}
            >
              Delivery Man
            </button>
          </div>

          <div className="flex flex-1 min-h-0 border border-neutral-gray-200/50 rounded-3xl overflow-hidden bg-neutral-white shadow-xl shadow-neutral-gray-100/10">
            {/* Conversation list */}
            <div className={`w-full sm:w-80 shrink-0 border-r border-neutral-gray-100 flex flex-col bg-neutral-gray-50/10 ${activeId !== null ? 'hidden sm:flex' : 'flex'}`}>
              <div className="p-3 border-b border-neutral-gray-100 bg-neutral-white">
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-neutral-gray-50 border border-neutral-gray-200/40 focus-within:ring-1 focus-within:ring-primary-600 focus-within:border-primary-600 transition-all">
                  <Search size={14} className="text-neutral-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages..."
                    className="bg-transparent outline-none text-xs w-full font-semibold placeholder-neutral-gray-400"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-neutral-gray-100/50">
                {filtered.length === 0 ? (
                  <div className="text-center text-xs font-semibold text-neutral-gray-400 py-12">No active chats</div>
                ) : (
                  filtered.map((c) => (
                    <button
                      key={`${tab}-${c.id}`}
                      onClick={() => setActiveId(c.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all cursor-pointer border-l-2 ${
                        activeId === c.id 
                          ? 'bg-primary-50/50 border-primary-600 pl-3.5' 
                          : 'border-transparent hover:bg-neutral-gray-50/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-primary-50 shrink-0 flex items-center justify-center border border-primary-100 ring-2 ring-primary-50/50">
                        {c.image ? (
                           <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <MessageCircle size={16} className="text-primary-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-xs truncate ${c.unseen > 0 ? 'font-extrabold text-neutral-gray-900' : 'font-bold text-neutral-gray-800'}`}>{c.name}</span>
                          <span className="text-[9px] font-bold text-neutral-400 shrink-0">{c.time}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[11px] truncate ${c.unseen > 0 ? 'text-neutral-800 font-extrabold' : 'text-neutral-500 font-semibold'}`}>{c.lastMessage || 'No messages'}</span>
                          {c.unseen > 0 && (
                            <span className="shrink-0 bg-primary-600 text-neutral-white text-[9px] font-extrabold rounded-full px-1.5 py-0.5 min-w-[16px] text-center shadow-sm shadow-primary-600/30">{c.unseen}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat panel */}
            <div className={`flex-1 flex-col min-w-0 bg-neutral-white ${activeId === null ? 'hidden sm:flex' : 'flex'}`}>
              {activeId === null ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-neutral-500 bg-neutral-gray-50/30 p-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-4 border border-primary-100">
                    <MessageCircle size={22} className="text-primary-600" />
                  </div>
                  <p className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">Your Message Inbox</p>
                  <p className="text-xs text-neutral-400 mt-1">Select a vendor or delivery partner from the list to view chat history.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-5 py-3.5 border-b border-neutral-gray-100 bg-neutral-white shrink-0">
                    <button
                      onClick={() => setActiveId(null)}
                      className="p-1 rounded-lg hover:bg-neutral-gray-50 active:scale-95 transition-all cursor-pointer sm:hidden text-neutral-gray-500 hover:text-neutral-gray-800"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-50 shrink-0 flex items-center justify-center border border-primary-100">
                      {peerImage ? (
                        <img src={peerImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <MessageCircle size={15} className="text-primary-600" />
                      )}
                    </div>
                    <h6 className="text-xs font-extrabold text-neutral-gray-900 truncate">{activeConversation?.name}</h6>
                  </div>

                  <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-neutral-gray-50/40">
                    {loadingMessages ? (
                      <ChatMessagesSkeleton />
                    ) : messages.length === 0 ? (
                      <div className="text-center text-xs font-semibold text-neutral-gray-400 py-12">No messages yet. Send a greeting to start!</div>
                    ) : (
                      <>
                        {messages.map((m, i) => (
                          <MessageBubble key={m.id ?? i} msg={m} peerImage={peerImage} />
                        ))}
                        <div ref={bottomRef} />
                      </>
                    )}
                  </div>

                  {error && <div className="px-5 py-1.5 text-[10px] font-bold text-red-600 bg-red-50 border-t border-red-100">{error}</div>}

                  <form
                    className="flex items-center gap-2 border-t border-neutral-gray-100 p-3.5 bg-neutral-white shrink-0"
                    onSubmit={(e) => { e.preventDefault(); send(); }}
                  >
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 rounded-2xl border border-neutral-gray-200 px-4 py-2.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 placeholder-neutral-gray-400"
                    />
                    <button
                      type="submit"
                      disabled={sending || !text.trim()}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-primary-600 text-neutral-white disabled:opacity-50 hover:bg-primary-800 transition-all cursor-pointer shadow-md shadow-primary-600/10 active:scale-95 shrink-0"
                      aria-label="Send message"
                    >
                      {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
