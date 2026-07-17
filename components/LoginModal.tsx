'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { X, Phone, Mail } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
    <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.572H7.078v-3.355h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.355h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000" aria-hidden="true">
    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.49-.12-1.12.46-2.29 1.175-3.04 1.03-.98 2.82-1.35 3-1.53zM21.23 17.36c-.43 1.02-.64 1.47-1.2 2.37-.83 1.32-2.01 2.97-3.46 2.98-1.28.01-1.64-.84-3.4-.83-1.76.01-2.13.85-3.41.84-1.45-.01-2.56-1.64-3.39-2.96-1.86-2.96-2.07-6.44-1.01-8.33.73-1.21 1.92-1.94 3.05-1.94 1.13 0 1.84.77 3.4.77 1.54 0 2.24-.77 3.39-.77 1.06 0 2.19.58 2.99 1.59-2.63 1.44-2.2 5.21.94 6.28z"/>
  </svg>
);

const SOCIAL_ICONS: Record<string, () => React.ReactElement> = {
  google: GoogleIcon,
  facebook: FacebookIcon,
  apple: AppleIcon,
};

const SOCIAL_LABELS: Record<string, string> = {
  google: 'Google',
  facebook: 'Facebook',
  apple: 'Apple',
};

export default function LoginModal() {
  const { isLoginOpen, setLoginOpen, setLoggedIn, customerLogin } = useAppStore();
  const { login, checkPhone, verifyOTP } = api;

  const [method, setMethod] = useState<'otp' | 'email'>('otp');
  const [inputValue, setInputValue] = useState('');
  const [password, setPassword] = useState('');
  const [codeMode, setCodeMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoginOpen) return null;

  const loginOption = customerLogin?.login_option ?? {};
  const socialOptions = customerLogin?.social_media_login_options ?? {};

  const otpEnabled = !!loginOption.otp_login;
  const emailEnabled = !!loginOption.manual_login;
  const socialEnabled = !!loginOption.social_login;

  const standardMethods: ('otp' | 'email')[] = [];
  if (otpEnabled) standardMethods.push('otp');
  if (emailEnabled) standardMethods.push('email');

  const socialMethods = socialEnabled
    ? (Object.entries(socialOptions) as [string, unknown][])
        .filter(([, v]) => !!v)
        .map(([k]) => k)
    : [];

  const activeMethod = standardMethods.includes(method) ? method : (standardMethods[0] ?? 'otp');

  const resetState = () => {
    setInputValue('');
    setPassword('');
    setCodeMode(false);
    setOtp('');
    setError(null);
  };

  const closeModal = () => {
    setLoginOpen(false);
    resetState();
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue) return;
    setLoading(true);
    setError(null);
    try {
      const res = await checkPhone(inputValue);
      if (res.errors) {
        setError(res.errors[0]?.message ?? 'Failed to send OTP');
      } else {
        setCodeMode(true);
      }
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setLoading(true);
    setError(null);
    try {
      const res = await verifyOTP(inputValue, otp);
      if (res.token) {
        setLoggedIn(res.token);
        resetState();
      } else if (res.errors) {
        setError(res.errors[0]?.message ?? 'Invalid OTP');
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch {
      setError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await login(inputValue, password, 'email');
      if (res.token) {
        setLoggedIn(res.token);
        resetState();
      } else if (res.errors) {
        setError(res.errors[0]?.message ?? 'Login failed');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = () => {
    setError('Social login is not yet wired to the SPA.');
  };

  const hasStandard = standardMethods.length > 0;
  const hasSocial = socialMethods.length > 0;

  if (!hasStandard && !hasSocial) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-gray-900/50 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-md bg-neutral-white rounded-xl shadow-2xl border border-neutral-gray-200 p-6 text-center">
          <button
            onClick={closeModal}
            className="absolute right-4 top-4 text-neutral-gray-600 hover:text-neutral-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
          <h3 className="text-lg font-semibold text-neutral-gray-900 mb-2">Login Unavailable</h3>
          <p className="text-sm text-neutral-gray-600">No login methods are currently enabled. Please check back later.</p>
        </div>
      </div>
    );
  }

  const title =
    activeMethod === 'otp'
      ? codeMode
        ? 'Verify OTP Code'
        : 'Login with Phone'
      : 'Login with Email';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-gray-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-white rounded-xl shadow-2xl overflow-hidden border border-neutral-gray-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-gray-50 bg-neutral-gray-50/50">
          <h3 className="text-lg font-semibold text-neutral-gray-900">
            {hasStandard ? title : 'Login / Register'}
          </h3>
          <button
            onClick={closeModal}
            className="text-neutral-gray-600 hover:text-neutral-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-start space-x-3 bg-danger/10 text-red-600 p-3 rounded-lg border border-danger/20 text-sm">
              <span>{error}</span>
            </div>
          )}

          {hasStandard && (
            <>
              {standardMethods.length > 1 && (
                <div className="flex justify-center space-x-4 border-b border-neutral-gray-50 pb-3">
                  {otpEnabled && (
                    <button
                      type="button"
                      onClick={() => { setMethod('otp'); setCodeMode(false); }}
                      className={`flex items-center space-x-2 pb-2 px-4 border-b-2 transition-all ${
                        activeMethod === 'otp'
                          ? 'border-primary-600 text-primary-600 font-medium'
                          : 'border-transparent text-neutral-gray-600 hover:text-neutral-gray-900'
                      }`}
                    >
                      <Phone size={16} />
                      <span>Phone</span>
                    </button>
                  )}
                  {emailEnabled && (
                    <button
                      type="button"
                      onClick={() => setMethod('email')}
                      className={`flex items-center space-x-2 pb-2 px-4 border-b-2 transition-all ${
                        activeMethod === 'email'
                          ? 'border-primary-600 text-primary-600 font-medium'
                          : 'border-transparent text-neutral-gray-600 hover:text-neutral-gray-900'
                      }`}
                    >
                      <Mail size={16} />
                      <span>Email</span>
                    </button>
                  )}
                </div>
              )}

              {activeMethod === 'otp' ? (
                codeMode ? (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-gray-600 mb-1">
                        Verification Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 text-center tracking-widest text-lg font-bold rounded-lg border border-neutral-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-neutral-gray-900 bg-neutral-white"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setCodeMode(false)}
                        disabled={loading}
                        className="flex-1 py-3 bg-neutral-gray-50 hover:bg-neutral-gray-200 text-neutral-gray-900 font-medium rounded-lg transition-all disabled:opacity-60"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-primary-600 hover:bg-primary-800 text-neutral-white font-medium rounded-lg shadow-lg shadow-primary-600/10 active:scale-[0.98] transition-all disabled:opacity-60"
                      >
                        {loading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSendCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-gray-600 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +8801700000000"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-neutral-gray-900 bg-neutral-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-primary-600 hover:bg-primary-800 text-neutral-white font-medium rounded-lg shadow-lg shadow-primary-600/10 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {loading ? 'Sending...' : 'Send Code'}
                    </button>
                  </form>
                )
              ) : (
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-gray-600 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. user@example.com"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-neutral-gray-900 bg-neutral-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-gray-600 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all text-neutral-gray-900 bg-neutral-white"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-primary-600 hover:bg-primary-800 text-neutral-white font-medium rounded-lg shadow-lg shadow-primary-600/10 active:scale-[0.98] transition-all disabled:opacity-60"
                    >
                      {loading ? 'Signing in...' : 'Login'}
                    </button>
                  </form>
              )}
            </>
          )}

          {hasSocial && (
            <>
              <div className="flex items-center space-x-3">
                <div className="flex-1 h-px bg-neutral-gray-200" />
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-gray-600">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-neutral-gray-200" />
              </div>

              <div className="space-y-3">
                {socialMethods.map((provider) => {
                  const Icon = SOCIAL_ICONS[provider] ?? Mail;
                  const label = SOCIAL_LABELS[provider] ?? provider;
                  return (
                    <button
                      key={provider}
                      type="button"
                      onClick={handleSocialLogin}
                      className="w-full flex items-center justify-center space-x-3 py-3 border border-neutral-gray-200 rounded-lg text-neutral-gray-900 font-medium hover:bg-neutral-gray-50 transition-all"
                    >
                      <Icon />
                      <span>Continue with {label}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
