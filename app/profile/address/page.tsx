'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AddressSkeleton } from '@/components/profile-skeletons';
import { Loader2, MapPin, Pencil, Trash2, Plus, X, ChevronDown } from 'lucide-react';

interface Address {
  id: number;
  contact_person_name?: string;
  address_type?: string;
  is_billing?: number;
  phone?: string;
  city?: string;
  zip?: string;
  country?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

const EMPTY = {
  address_type: 'home',
  is_billing: 0,
  contact_person_name: '',
  phone: '',
  city: '',
  zip: '',
  country: '',
  address: '',
  latitude: 0,
  longitude: 0,
};

const COUNTRIES = ['Bangladesh', 'United States', 'United Kingdom', 'India', 'Canada', 'Australia', 'Germany', 'France'];

export default function AddressPage() {
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const load = async () => {
    try {
      const data = await api.getAddresses();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load addresses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({
      address_type: addr.address_type || 'home',
      is_billing: addr.is_billing ?? 0,
      contact_person_name: addr.contact_person_name || '',
      phone: addr.phone || '',
      city: addr.city || '',
      zip: addr.zip || '',
      country: addr.country || '',
      address: addr.address || '',
      latitude: addr.latitude ?? 0,
      longitude: addr.longitude ?? 0,
    });
    setError(null);
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = { ...form };
      if (editing) {
        (payload as any).id = editing.id;
        await api.updateAddress(payload);
      } else {
        await api.addAddress(payload);
      }
      setModalOpen(false);
      setEditing(null);
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save address';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    setBusy(true);
    try {
      await api.deleteAddress(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (err) {
      console.error('Failed to delete address', err);
    } finally {
      setBusy(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-gray-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
            <MapPin size={16} />
          </div>
          <h2 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">Manage Addresses</h2>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-800 text-neutral-white text-xs font-bold transition-all duration-300 shadow-md shadow-primary-600/10 cursor-pointer hover:-translate-y-0.5"
        >
          <Plus size={14} />
          <span>Add New Address</span>
        </button>
      </div>

      {loading ? (
        <AddressSkeleton />
      ) : items.length === 0 ? (
        <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-12 text-center shadow-xl shadow-neutral-gray-100/10 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4 border border-primary-100">
            <MapPin size={20} />
          </div>
          <h2 className="text-sm font-extrabold text-neutral-gray-900 mb-1.5">No Addresses Saved</h2>
          <p className="text-xs text-neutral-500 mb-6">You haven't added any shipping or billing addresses to your profile yet.</p>
          <button 
            onClick={openAdd} 
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-lg shadow-primary-600/10 cursor-pointer active:scale-95 transition-all hover:-translate-y-0.5"
          >
            <Plus size={14} /> Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((addr) => (
            <div key={addr.id} className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-5 flex flex-col justify-between shadow-xl shadow-neutral-gray-100/10 hover:shadow-2xl hover:shadow-neutral-gray-100/20 transition-all duration-300 relative group">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h6 className="font-extrabold text-neutral-gray-900 text-sm tracking-tight capitalize flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 text-[10px] font-extrabold border border-primary-100">
                      {addr.address_type}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-neutral-gray-50 text-neutral-600 text-[10px] font-extrabold border border-neutral-gray-200/40">
                      {addr.is_billing === 1 ? 'Billing' : 'Shipping'}
                    </span>
                  </h6>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEdit(addr)} 
                      className="p-1.5 rounded-lg hover:bg-neutral-gray-50 text-neutral-500 hover:text-primary-600 transition-colors cursor-pointer border border-transparent hover:border-neutral-gray-200/50" 
                      aria-label="Edit address"
                    >
                      <Pencil size={13} />
                    </button>
                    <button 
                      onClick={() => setConfirmDelete(addr.id)} 
                      className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors cursor-pointer border border-transparent hover:border-red-200/30" 
                      aria-label="Delete address"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-neutral-600 font-semibold">
                  <div className="flex"><span className="text-neutral-400 w-16 shrink-0">Name</span><span>{addr.contact_person_name}</span></div>
                  <div className="flex"><span className="text-neutral-400 w-16 shrink-0">Phone</span><span>{addr.phone}</span></div>
                  <div className="flex"><span className="text-neutral-400 w-16 shrink-0">City</span><span>{addr.city}</span></div>
                  <div className="flex"><span className="text-neutral-400 w-16 shrink-0">Zip</span><span>{addr.zip}</span></div>
                  <div className="flex"><span className="text-neutral-400 w-16 shrink-0">Country</span><span>{addr.country}</span></div>
                  <div className="flex items-start"><span className="text-neutral-400 w-16 shrink-0">Address</span><span className="text-neutral-700 leading-relaxed font-bold">{addr.address}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setModalOpen(false)}>
          <div className="bg-neutral-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-gray-200/30" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-gray-100 bg-neutral-gray-50/20">
              <h3 className="text-sm font-extrabold text-neutral-gray-900 tracking-tight">{editing ? 'Edit Address' : 'Add New Address'}</h3>
              <button 
                onClick={() => setModalOpen(false)} 
                className="w-8 h-8 rounded-full hover:bg-neutral-gray-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer" 
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-gray-400 mb-2">Address Type</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {['permanent', 'home', 'office'].map((t) => {
                      const active = form.address_type === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({ ...form, address_type: t })}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                            active 
                              ? 'bg-primary-50 border-primary-200 text-primary-600' 
                              : 'border-neutral-gray-200 bg-neutral-white text-neutral-600 hover:bg-neutral-gray-50'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-gray-400 mb-2">Usage</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {[0, 1].map((b) => {
                      const active = form.is_billing === b;
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setForm({ ...form, is_billing: b })}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            active 
                              ? 'bg-primary-50 border-primary-200 text-primary-600' 
                              : 'border-neutral-gray-200 bg-neutral-white text-neutral-600 hover:bg-neutral-gray-50'
                          }`}
                        >
                          {b === 1 ? 'Billing' : 'Shipping'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Contact Name <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    value={form.contact_person_name} 
                    onChange={(e) => setForm({ ...form, contact_person_name: e.target.value })} 
                    className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    value={form.city} 
                    onChange={(e) => setForm({ ...form, city: e.target.value })} 
                    className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Zip Code <span className="text-red-500">*</span></label>
                  <input 
                    required 
                    value={form.zip} 
                    onChange={(e) => setForm({ ...form, zip: e.target.value })} 
                    className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600" 
                  />
                </div>
                <div className="sm:col-span-2 relative">
                  <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Country <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="flex items-center justify-between w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 text-left select-none text-neutral-gray-800"
                  >
                    <span>{form.country || 'Select country'}</span>
                    <ChevronDown size={14} className="text-neutral-gray-400" />
                  </button>
                  {countryDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setCountryDropdownOpen(false)} />
                      <div className="flex flex-col absolute left-0 right-0 mt-1.5 max-h-48 overflow-y-auto bg-neutral-white border border-neutral-gray-200/60 rounded-2xl shadow-xl z-20 py-1.5 animate-scale-up">
                        {COUNTRIES.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, country: c });
                              setCountryDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                              form.country === c ? 'text-primary-600 bg-primary-50/60' : 'text-neutral-gray-700 hover:bg-neutral-gray-50'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-gray-700 mb-1.5">Detailed Address <span className="text-red-500">*</span></label>
                <textarea 
                  required 
                  value={form.address} 
                  onChange={(e) => setForm({ ...form, address: e.target.value })} 
                  rows={3} 
                  className="w-full px-3.5 py-2.5 border border-neutral-gray-200 rounded-xl bg-neutral-gray-50/30 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600" 
                />
              </div>

              {error && <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">{error}</div>}

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-gray-100">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)} 
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={busy} 
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-600 text-neutral-white hover:bg-primary-800 disabled:opacity-60 flex items-center gap-1.5 cursor-pointer shadow-md shadow-primary-600/10 hover:-translate-y-0.5 transition-all"
                >
                  {busy && <Loader2 size={12} className="animate-spin" />}
                  <span>{editing ? 'Update Address' : 'Save Address'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-black/40 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setConfirmDelete(null)}>
          <div className="bg-neutral-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-neutral-gray-200/30" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-extrabold text-neutral-gray-900 mb-2 tracking-tight">Delete address?</h3>
            <p className="text-xs font-semibold text-neutral-500 leading-relaxed mb-6">This will permanently remove the selected address from your account.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => remove(confirmDelete)} 
                disabled={busy} 
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-danger hover:bg-red-800 text-neutral-white disabled:opacity-60 cursor-pointer shadow-md shadow-red-600/10 active:scale-95"
              >
                {busy ? <Loader2 size={12} className="animate-spin inline" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
