'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { normalizeImage } from '@/lib/profile-utils';
import { Loader2, User, Lock, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { ProfileSkeleton } from '@/components/profile-skeletons';

export default function ProfileInfoPage() {
  const { setCustomerInfo } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [form, setForm] = useState({ f_name: '', l_name: '', phone: '', email: '' });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [infoMsg, setInfoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const data = await api.getCustomerInfo();
        setForm({ f_name: data.f_name || '', l_name: data.l_name || '', phone: data.phone || '', email: data.email || '' });
        const img = normalizeImage(data.image_full_url || data.image);
        setImagePreview(img);
        setCustomerInfo(`${data.f_name || ''} ${data.l_name || ''}`.trim() || null, img);
      } catch (err) {
        setInfoMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    })();
  }, [setCustomerInfo]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMsg(null);
    setSavingInfo(true);
    try {
      const fd = new FormData();
      fd.append('f_name', form.f_name);
      fd.append('l_name', form.l_name);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      if (selectedFile) fd.append('image', selectedFile);
      const res = await api.updateCustomerProfile(fd);
      setInfoMsg({ type: 'success', text: res?.message || 'Profile updated successfully' });
      const data = await api.getCustomerInfo();
      const img = normalizeImage(data.image_full_url || data.image);
      setImagePreview(img);
      setCustomerInfo(`${data.f_name || ''} ${data.l_name || ''}`.trim() || null, img);
    } catch (err) {
      setInfoMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile' });
    } finally {
      setSavingInfo(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (password.length < 6) {
      setPwMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    if (password !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setSavingPassword(true);
    try {
      const fd = new FormData();
      fd.append('f_name', form.f_name);
      fd.append('l_name', form.l_name);
      fd.append('phone', form.phone);
      fd.append('email', form.email);
      fd.append('password', password);
      const res = await api.updateCustomerProfile(fd);
      setPwMsg({ type: 'success', text: res?.message || 'Password updated successfully' });
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update password' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Basic Info Card */}
      <form onSubmit={saveInfo} className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl overflow-hidden shadow-xl shadow-neutral-gray-100/30">
        <div className="px-6 py-5 border-b border-neutral-gray-100 bg-neutral-gray-50/30 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
            <User size={16} />
          </div>
          <h2 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">Basic Account Information</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-5 mb-8">
            <div className="relative w-20 h-20 shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary-200 bg-primary-50 flex items-center justify-center ring-4 ring-primary-50">
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-primary-600" />
                )}
              </div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="absolute -bottom-1 -right-1 bg-primary-600 hover:bg-primary-800 text-neutral-white p-2 rounded-full border-2 border-neutral-white shadow-lg active:scale-90 transition-transform cursor-pointer"
              >
                <Camera size={12} />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-neutral-gray-800">Profile Picture</span>
              <span className="text-[10px] font-semibold text-neutral-gray-500">Supports JPG, PNG formats. Max file size: 2MB.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">First Name <span className="text-red-500">*</span></label>
              <input 
                required 
                value={form.f_name} 
                onChange={(e) => setForm({ ...form, f_name: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-neutral-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 text-sm font-semibold transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Last Name <span className="text-red-500">*</span></label>
              <input 
                required 
                value={form.l_name} 
                onChange={(e) => setForm({ ...form, l_name: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-neutral-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 text-sm font-semibold transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
              <input 
                required 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-neutral-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 text-sm font-semibold transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Email Address</label>
              <input 
                type="email" 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-neutral-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 text-sm font-semibold transition-all" 
              />
            </div>
          </div>

          {infoMsg && (
            <div className={`mt-5 flex items-center space-x-2 text-xs font-bold px-4 py-3 rounded-xl border ${
              infoMsg.type === 'success' 
                ? 'bg-primary-50/50 border-primary-200 text-primary-800' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {infoMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{infoMsg.text}</span>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button 
              type="submit" 
              disabled={savingInfo} 
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/10 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center space-x-2 cursor-pointer hover:-translate-y-0.5"
            >
              {savingInfo && <Loader2 size={14} className="animate-spin" />}
              <span>Save Basic Info</span>
            </button>
          </div>
        </div>
      </form>

      {/* Change Password Card */}
      <form onSubmit={savePassword} className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl overflow-hidden shadow-xl shadow-neutral-gray-100/30">
        <div className="px-6 py-5 border-b border-neutral-gray-100 bg-neutral-gray-50/30 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
            <Lock size={16} />
          </div>
          <h2 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">Security & Credentials</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">New Password <span className="text-red-500">*</span></label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="At least 6 characters" 
                className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-neutral-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 text-sm font-semibold transition-all" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder="Re-enter password" 
                className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-neutral-gray-900 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 text-sm font-semibold transition-all" 
              />
            </div>
          </div>

          {pwMsg && (
            <div className={`mt-5 flex items-center space-x-2 text-xs font-bold px-4 py-3 rounded-xl border ${
              pwMsg.type === 'success' 
                ? 'bg-primary-50/50 border-primary-200 text-primary-800' 
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {pwMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              <span>{pwMsg.text}</span>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button 
              type="submit" 
              disabled={savingPassword} 
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/10 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center space-x-2 cursor-pointer hover:-translate-y-0.5"
            >
              {savingPassword && <Loader2 size={14} className="animate-spin" />}
              <span>Update Credentials</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
