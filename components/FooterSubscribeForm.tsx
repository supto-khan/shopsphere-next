'use client';

import React, { useState } from 'react';

export default function FooterSubscribeForm() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribedMsg, setSubscribedMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    setSubscribedMsg('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubscribedMsg('Thank you for subscribing!');
      setEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <form onSubmit={handleSubscribe} className="space-y-3">
      <div className="relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your Email Address"
          className="w-full bg-neutral-100 border border-neutral-gray-200/50 rounded-xl px-4 py-3 text-xs font-bold text-neutral-gray-800 placeholder-neutral-gray-400 focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-all"
          required
        />
        <button
          type="submit"
          disabled={subscribing}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-primary-600 hover:bg-primary-800 disabled:bg-neutral-gray-200 text-neutral-white rounded-lg text-[10px] font-extrabold shadow-sm shadow-primary-600/10 cursor-pointer disabled:cursor-not-allowed transition-all"
        >
          {subscribing ? 'Sending...' : 'Subscribe'}
        </button>
      </div>
      {subscribedMsg && (
        <p className="text-[10px] font-extrabold text-primary-600 animate-fade-in">
          {subscribedMsg}
        </p>
      )}
    </form>
  );
}
