'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, BACKEND_URL } from '@/lib/api';
import Footer from '@/components/Footer';
import {
  ChevronRight,
  User,
  Mail,
  Phone,
  Lock,
  Store,
  MapPin,
  FileText,
  Calendar,
  Upload,
  ArrowLeft,
  Check,
  Loader2,
  FileUp,
  AlertCircle
} from 'lucide-react';

export default function VendorRegisterPage() {
  const router = useRouter();

  // Current Step
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [tinExpireDate, setTinExpireDate] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // File Upload States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [tinFile, setTinFile] = useState<File | null>(null);

  // Previews
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleTinFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTinFile(file);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !phone || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fName || !lName || !shopName || !shopAddress) {
      setErrorMsg('Please fill in all required vendor and shop information.');
      return;
    }

    if (!imageFile || !logoFile || !bannerFile) {
      setErrorMsg('Please upload all required files (Profile image, Shop Logo, and Shop Banner).');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);
      formData.append('f_name', fName);
      formData.append('l_name', lName);
      formData.append('shop_name', shopName);
      formData.append('shop_address', shopAddress);
      
      formData.append('image', imageFile);
      formData.append('logo', logoFile);
      formData.append('banner', bannerFile);

      if (taxNumber) {
        formData.append('tax_identification_number', taxNumber);
      }
      if (tinExpireDate) {
        formData.append('tin_expire_date', tinExpireDate);
      }
      if (tinFile) {
        formData.append('tin_certificate', tinFile);
      }

      await api.registerVendor(formData);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full min-h-[calc(100vh-65px)] flex flex-col justify-between bg-neutral-white">
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <div className="max-w-md w-full bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-8 text-center shadow-xl space-y-6">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Check size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-extrabold text-neutral-gray-900">Congratulations!</h2>
            <p className="text-sm font-semibold text-neutral-gray-600 leading-relaxed">
              Your registration application was submitted successfully. Our team will review your application, and you will receive an approval email shortly.
            </p>
            <div className="pt-4">
              <a
                href={`${BACKEND_URL}/vendor/auth/login`}
                className="inline-block px-8 py-3.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/15 transition-all duration-200"
              >
                Go to Vendor Login
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-neutral-white flex flex-col justify-between">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Dynamic header / breadcrumbs */}
        <div className="border-b border-neutral-gray-200/60 pb-4 mb-8">
          <div className="flex items-center space-x-2 text-xs text-neutral-gray-600 mb-2">
            <span className="hover:text-primary-600 hover:underline cursor-pointer transition-colors" onClick={() => router.push('/')}>
              Home
            </span>
            <ChevronRight size={12} />
            <span className="hover:text-primary-600 hover:underline cursor-pointer transition-colors" onClick={() => router.push('/vendors')}>
              All Stores
            </span>
            <ChevronRight size={12} />
            <span className="font-semibold text-primary-600">Become a Vendor</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-10 max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
              step >= 1 ? 'bg-primary-600 border-primary-600 text-neutral-white shadow-md shadow-primary-600/15' : 'bg-neutral-white border-neutral-gray-300 text-neutral-gray-500'
            }`}>
              1
            </div>
            <span className={`text-xs font-bold ${step >= 1 ? 'text-neutral-gray-900' : 'text-neutral-gray-400'}`}>Account Credentials</span>
          </div>
          <div className="flex-1 h-0.5 bg-neutral-gray-200 mx-4" />
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
              step === 2 ? 'bg-primary-600 border-primary-600 text-neutral-white shadow-md shadow-primary-600/15' : 'bg-neutral-white border-neutral-gray-300 text-neutral-gray-500'
            }`}>
              2
            </div>
            <span className={`text-xs font-bold ${step === 2 ? 'text-neutral-gray-900' : 'text-neutral-gray-400'}`}>Store Information</span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-6 flex items-start space-x-2 text-xs font-semibold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="whitespace-pre-line">{errorMsg}</span>
          </div>
        )}

        <div className="bg-neutral-white border border-neutral-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
          
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-6">
              <h2 className="text-xl font-extrabold text-neutral-gray-900 mb-4">Create Your Account</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-gray-700 flex items-center gap-1">
                    <Mail size={13} className="text-neutral-gray-400" /> Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-800 outline-none focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 transition-all bg-neutral-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-gray-700 flex items-center gap-1">
                    <Phone size={13} className="text-neutral-gray-400" /> Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-800 outline-none focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 transition-all bg-neutral-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-gray-700 flex items-center gap-1">
                    <Lock size={13} className="text-neutral-gray-400" /> Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-800 outline-none focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 transition-all bg-neutral-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-gray-700 flex items-center gap-1">
                    <Lock size={13} className="text-neutral-gray-400" /> Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-800 outline-none focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 transition-all bg-neutral-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-neutral-gray-100">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold shadow-md shadow-primary-600/15 transition-all duration-200 cursor-pointer"
                >
                  Proceed to Next
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Vendor Personal Information */}
              <div className="space-y-5">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-gray-900 border-b border-neutral-gray-100 pb-2">
                  Vendor Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-gray-700">First Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Ex: John"
                        value={fName}
                        onChange={(e) => setFName(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-800 outline-none focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 transition-all bg-neutral-white"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-gray-700">Last Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Ex: Doe"
                        value={lName}
                        onChange={(e) => setLName(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-800 outline-none focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 transition-all bg-neutral-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Vendor Image Upload */}
                  <div className="flex flex-col items-center justify-center border border-dashed border-neutral-gray-200 rounded-2xl p-4 bg-neutral-gray-50/30">
                    <label className="cursor-pointer group flex flex-col items-center justify-center space-y-2">
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} required={!imagePreview} />
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile preview" className="w-20 h-20 rounded-full object-cover border border-neutral-gray-200" />
                      ) : (
                        <div className="w-16 h-16 bg-neutral-white rounded-full flex items-center justify-center text-neutral-gray-400 border shadow-sm group-hover:border-primary-400 group-hover:text-primary-500 transition-all">
                          <User size={24} />
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-neutral-gray-700">Vendor Image <span className="text-red-500">*</span></span>
                      <span className="text-[9px] text-neutral-gray-400 uppercase font-extrabold tracking-wider">Ratio 1:1 • Max 2MB</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Shop Details */}
              <div className="space-y-5">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-gray-900 border-b border-neutral-gray-100 pb-2">
                  Shop Information
                </h3>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-gray-700">Shop Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Ex: XYZ Store"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-800 outline-none focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 transition-all bg-neutral-white"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-neutral-gray-700">Shop Address <span className="text-red-500">*</span></label>
                    <textarea
                      placeholder="Enter shop address"
                      value={shopAddress}
                      onChange={(e) => setShopAddress(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-800 outline-none focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 transition-all bg-neutral-white resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Logo Upload */}
                    <div className="flex flex-col items-center justify-center border border-dashed border-neutral-gray-200 rounded-2xl p-4 bg-neutral-gray-50/30">
                      <label className="cursor-pointer group flex flex-col items-center justify-center space-y-2">
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} required={!logoPreview} />
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-xl object-cover border border-neutral-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-white rounded-xl flex items-center justify-center text-neutral-gray-400 border shadow-sm group-hover:border-primary-400 group-hover:text-primary-500 transition-all">
                            <Upload size={20} />
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-neutral-gray-700">Shop Logo <span className="text-red-500">*</span></span>
                        <span className="text-[9px] text-neutral-gray-400 uppercase font-extrabold tracking-wider">Ratio 1:1 • Max 2MB</span>
                      </label>
                    </div>

                    {/* Banner Upload */}
                    <div className="flex flex-col items-center justify-center border border-dashed border-neutral-gray-200 rounded-2xl p-4 bg-neutral-gray-50/30">
                      <label className="cursor-pointer group flex flex-col items-center justify-center space-y-2 w-full">
                        <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} required={!bannerPreview} />
                        {bannerPreview ? (
                          <img src={bannerPreview} alt="Banner preview" className="w-full h-16 rounded-xl object-cover border border-neutral-gray-200" />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-white rounded-xl flex items-center justify-center text-neutral-gray-400 border shadow-sm group-hover:border-primary-400 group-hover:text-primary-500 transition-all">
                            <Upload size={20} />
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-neutral-gray-700">Shop Banner <span className="text-red-500">*</span></span>
                        <span className="text-[9px] text-neutral-gray-400 uppercase font-extrabold tracking-wider">Ratio 2:1 • Max 2MB</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business TIN Section */}
              <div className="space-y-5">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-gray-900 border-b border-neutral-gray-100 pb-2">
                  Business TIN
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-gray-700">Taxpayer Identification Number (TIN)</label>
                      <input
                        type="text"
                        placeholder="Type taxpayer identification number"
                        value={taxNumber}
                        onChange={(e) => setTaxNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-800 outline-none focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 transition-all bg-neutral-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-gray-700">TIN Expiry Date</label>
                      <input
                        type="date"
                        value={tinExpireDate}
                        onChange={(e) => setTinExpireDate(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-xs font-bold text-neutral-gray-800 outline-none focus:ring-2 focus:ring-primary-600/25 focus:border-primary-600 transition-all bg-neutral-white"
                      />
                    </div>
                  </div>

                  {/* Certificate Upload */}
                  <div className="flex flex-col items-center justify-center border border-dashed border-neutral-gray-200 rounded-2xl p-4 bg-neutral-gray-50/30">
                    <label className="cursor-pointer group flex flex-col items-center justify-center space-y-2 w-full text-center">
                      <input type="file" accept=".pdf,.doc,.docx,.jpg" className="hidden" onChange={handleTinFileChange} />
                      <div className="w-12 h-12 bg-neutral-white rounded-xl flex items-center justify-center text-neutral-gray-400 border shadow-sm group-hover:border-primary-400 group-hover:text-primary-500 transition-all">
                        {tinFile ? <FileText size={20} className="text-primary-600" /> : <FileUp size={20} />}
                      </div>
                      <span className="text-[11px] font-bold text-neutral-gray-700">
                        {tinFile ? tinFile.name : 'TIN Certificate File'}
                      </span>
                      <span className="text-[9px] text-neutral-gray-400 uppercase font-extrabold tracking-wider leading-relaxed">
                        PDF, DOC, DOCX, JPG • Max 5MB
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="flex items-start space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-gray-300 text-primary-600 focus:ring-primary-600/30 mt-0.5 cursor-pointer"
                />
                <label htmlFor="agree-checkbox" className="text-xs font-bold text-neutral-gray-600 select-none cursor-pointer">
                  I agree with the{' '}
                  <a href="/page/terms" target="_blank" className="text-primary-600 hover:underline">
                    Terms & Conditions
                  </a>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-5 border-t border-neutral-gray-100 gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-neutral-gray-200 hover:bg-neutral-50 text-neutral-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-200 cursor-pointer"
                  disabled={loading}
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="submit"
                  disabled={!agreeTerms || loading}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-800 text-neutral-white disabled:opacity-40 disabled:hover:bg-primary-600 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary-600/15 transition-all duration-200 cursor-pointer"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Submit Application
                </button>
              </div>
            </form>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
