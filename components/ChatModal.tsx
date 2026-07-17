'use client';

import React, { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { resolveStorageImage } from '@/lib/order-utils';
import { Loader2, Send, X, MessageCircle } from 'lucide-react';

interface ChatAttachment {
  type?: string;
  path?: string | null;
}

interface ChatMessage {
  id?: number;
  message?: string;
  sent_by_customer?: number;
  created_at?: string;
  attachment?: ChatAttachment[];
}

interface ChatModalProps {
  type: 'seller' | 'delivery-man';
  id: number;
  title: string;
  subtitle?: string;
  triggerLabel?: string;
  triggerClassName?: string;
}

export default function ChatModal({
  type,
  id,
  title,
  subtitle,
  triggerLabel = 'Chat',
  triggerClassName,
}: ChatModalProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const data = await api.getChatMessages(type, id, 1, 50);
      const list: ChatMessage[] = data?.message || [];
      setMessages([...list].reverse());
    } catch (e) {
      setError('Could not load messages');
    }
  };

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError(null);
    loadMessages()
      .catch(() => setError('Could not load messages'))
      .finally(() => { if (active) setLoading(false); });

    const interval = setInterval(() => {
      if (active) loadMessages();
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [open, type, id]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await api.sendChatMessage(type, id, trimmed);
      setText('');
      await loadMessages();
    } catch (e) {
      setError('Message failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={triggerClassName ?? "inline-flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-primary-50 hover:bg-primary-100/80 text-primary-600 text-xs font-bold border border-primary-100 cursor-pointer transition-all active:scale-95 shadow-sm hover:-translate-y-0.5"}
        style={triggerClassName === 'hidden' ? { display: 'none' } : undefined}
      >
        <MessageCircle size={14} />
        <span className="hidden sm:inline">{triggerLabel}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-black/40 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex flex-col w-full sm:max-w-lg h-[80vh] sm:h-[70vh] bg-neutral-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-neutral-gray-200/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-neutral-gray-100 bg-neutral-gray-50/25">
              <div className="min-w-0">
                <h6 className="text-xs font-extrabold text-neutral-gray-900 truncate leading-snug">{title}</h6>
                {subtitle && <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide truncate mt-0.5">{subtitle}</div>}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-neutral-gray-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-neutral-gray-50/30">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin text-primary-600" size={24} />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-xs font-bold text-neutral-400 py-12">
                  No messages yet. Say hello! 👋
                </div>
              ) : (
                messages.map((m, idx) => {
                  const mine = Number(m.sent_by_customer) === 1 || String(m.sent_by_customer) === 'true';
                  return (
                    <div key={m.id ?? idx} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs font-semibold leading-relaxed shadow-sm ${
                        mine
                          ? 'bg-primary-600 text-neutral-white rounded-br-none'
                          : 'bg-neutral-white border border-neutral-gray-200/50 text-neutral-gray-800 rounded-bl-none'
                      }`}>
                        {m.message ? <p className="whitespace-pre-wrap break-words">{m.message}</p> : null}
                        {(m.attachment || []).map((a, ai) => {
                          const src = resolveStorageImage(a?.path);
                          if (!src) return null;
                          if (a?.type === 'file') {
                            return (
                              <a key={ai} href={src} target="_blank" rel="noreferrer" className={`block underline mt-1 ${mine ? 'text-neutral-white' : 'text-primary-600'}`}>
                                Attachment
                              </a>
                            );
                          }
                          // eslint-disable-next-line @next/next/no-img-element
                          return <img key={ai} src={src} alt="attachment" className="mt-2 max-h-40 rounded-xl border border-neutral-gray-200/40 object-cover" />;
                        })}
                        {m.created_at && (
                          <div className={`text-[9px] mt-1.5 font-bold ${mine ? 'text-primary-200' : 'text-neutral-400'}`}>
                            {new Date(m.created_at.replace(' ', 'T')).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {error && <div className="px-6 py-1.5 text-[10px] font-bold text-red-500 bg-red-50 border-t border-b border-red-150">{error}</div>}

            <form
              className="flex items-center gap-2.5 border-t border-neutral-gray-150 p-4 bg-neutral-white"
              onSubmit={(e) => { e.preventDefault(); send(); }}
            >
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-xl border border-neutral-gray-250/70 px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-500 bg-neutral-gray-50/50"
              />
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-600 text-neutral-white disabled:opacity-50 cursor-pointer shadow-md shadow-primary-600/10 active:scale-95 transition-all hover:bg-primary-800"
                aria-label="Send message"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
