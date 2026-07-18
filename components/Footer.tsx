import React from 'react';
import Link from 'next/link';
import { Phone, Mail, UserCheck, MapPin, Link2 } from 'lucide-react';
import { BACKEND_URL } from '@/lib/api';
import FooterSubscribeForm from './FooterSubscribeForm';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

const Facebook = ({ size = 24, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = ({ size = 24, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Instagram = ({ size = 24, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const Linkedin = ({ size = 24, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-9a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Pinterest = ({ size = 24, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M8 22a3.75 3.75 0 0 1 .49-1.92c.31-1.32 1.83-7.79 1.83-7.79s-.45-.91-.45-2.26c0-2.12 1.23-3.7 2.76-3.7 1.3 0 1.93.98 1.93 2.15 0 1.31-.83 3.26-1.26 5.08-.36 1.52.76 2.76 2.26 2.76 2.71 0 4.8-2.86 4.8-6.99 0-3.65-2.62-6.21-6.38-6.21-4.35 0-6.9 3.26-6.9 6.63 0 1.31.5 2.72 1.13 3.48a.39.39 0 0 1 .09.37c-.1.42-.33 1.37-.38 1.56a.31.31 0 0 1-.29.21c-1.29-.6-2.1-2.48-2.1-3.99 0-5.71 4.15-10.96 11.97-10.96 6.29 0 11.17 4.48 11.17 10.46 0 6.25-3.94 11.28-9.4 11.28-1.84 0-3.56-.96-4.15-2.09 0 0-.91 3.46-1.13 4.31-.41 1.58-1.52 3.56-2.27 4.79z" />
  </svg>
);

const Google = ({ size = 24, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.111 4.114a5.755 5.755 0 0 1-5.776-5.776c0-3.19 2.585-5.776 5.776-5.776 1.492 0 2.853.567 3.886 1.492l3.226-3.226C19.14 3.46 15.9 2 12.24 2 6.58 2 2 6.58 2 12.24s4.58 10.24 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.693-.076-1.36-.189-1.955H12.24z" />
  </svg>
);

const Youtube = ({ size = 24, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

interface FooterProps {
  config?: any;
}

export default function Footer({ config: propConfig }: FooterProps) {
  // Use provided config or fallback to empty object if not loaded yet
  const config = propConfig || {};
  // Extract clean logo path
  let footerLogo = "/shopsphere.png";
  const logoObj = config?.footer_logo?.path ? config.footer_logo : config?.company_logo;
  if (logoObj && typeof logoObj === "object" && logoObj.path) {
    const cleanPath = logoObj.path.replace(/^https?:\/\/[^\/]+/, "");
    footerLogo = cleanPath.replace("storage/app/public", "storage");
  }

  // App download status
  const showIos = config?.ios?.status === "1" || config?.ios?.status === 1;
  const showAndroid = config?.android?.status === "1" || config?.android?.status === 1;
  const showAppSection = showIos || showAndroid;

  // Social media list
  const socialMedia = config?.social_media || [];

  // Business pages filtering
  const businessPagesDefault1 =
    config?.business_pages?.filter(
      (p: any) => p.default_status === 1 || p.default_status === "1",
    ) || [];
  const businessPagesDefault0 =
    config?.business_pages?.filter(
      (p: any) => p.default_status === 0 || p.default_status === "0",
    ) || [];

  return (
    <>
      {/* 4 Cards Grid - About/Contact/FAQ/Blog links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* About us */}
          <Link
            href="/about-us"
            className="bg-neutral-white border border-neutral-gray-200/40 p-5 rounded-2xl flex flex-col items-center text-center hover:shadow-md hover:border-primary-200 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-3">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <h4 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider mb-1">
              About Us
            </h4>
            <p className="text-[10px] text-neutral-gray-500">Know about our company more.</p>
          </Link>

          {/* Contact us */}
          <Link
            href="/contact-us"
            className="bg-neutral-white border border-neutral-gray-200/40 p-5 rounded-2xl flex flex-col items-center text-center hover:shadow-md hover:border-primary-200 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-3">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <h4 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider mb-1">
              Contact Us
            </h4>
            <p className="text-[10px] text-neutral-gray-500">We are Here to Help.</p>
          </Link>

          {/* FAQ */}
          <Link
            href="/faq"
            className="bg-neutral-white border border-neutral-gray-200/40 p-5 rounded-2xl flex flex-col items-center text-center hover:shadow-md hover:border-primary-200 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-3">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16h-2v-2h2v2zm1.07-7.75l-.9.92C12.45 11.9 12 12.5 12 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H5c0-3.87 3.13-7 7-7s7 3.13 7 7c0 1.11-.45 2.11-1.07 2.83z" />
              </svg>
            </div>
            <h4 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider mb-1">
              FAQ
            </h4>
            <p className="text-[10px] text-neutral-gray-500">Get all Answers.</p>
          </Link>

          {/* Blog */}
          <Link
            href="/blog"
            className="bg-neutral-white border border-neutral-gray-200/40 p-5 rounded-2xl flex flex-col items-center text-center hover:shadow-md hover:border-primary-200 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 mb-3">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
              </svg>
            </div>
            <h4 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider mb-1">
              Blog
            </h4>
            <p className="text-[10px] text-neutral-gray-500">Read our latest posts.</p>
          </Link>
        </div>
      </div>

      <footer className="bg-neutral-white border-t border-neutral-gray-200/50 mt-auto select-none">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Branding, About, and App Download */}
            <div className="md:col-span-3 space-y-6">
              <Link href="/" className="inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={footerLogo}
                  alt={config?.company_name || "Logo"}
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    // Prevent infinite loop if fallback image also fails
                    target.onerror = null;
                    target.src = "/shopsphere.png";
                  }}
                />
              </Link>
              <p className="text-xs text-neutral-gray-500 leading-relaxed font-medium">
                ShopSphere is a multi-vendor ecommerce platform offering high-quality items, quick delivery, and secure checkouts.
              </p>

              {/* Social Icons */}
              {socialMedia.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {socialMedia.map((sm: any, i: number) => {
                    if (sm.status !== 1 && sm.status !== "1") return null;
                    let icon = null;
                    const c = "w-4 h-4";
                    if (sm.name === "facebook") icon = <Facebook size={16} className={c} />;
                    else if (sm.name === "twitter") icon = <Twitter size={16} className={c} />;
                    else if (sm.name === "instagram") icon = <Instagram size={16} className={c} />;
                    else if (sm.name === "linkedin") icon = <Linkedin size={16} className={c} />;
                    else if (sm.name === "pinterest") icon = <Pinterest size={16} className={c} />;
                    else if (sm.name === "google-play") icon = <Google size={16} className={c} />;
                    else if (sm.name === "youtube") icon = <Youtube size={16} className={c} />;
                    else icon = <Link2 size={16} className={c} />;

                    return (
                      <a
                        key={i}
                        href={sm.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full border border-neutral-gray-200 flex items-center justify-center text-neutral-gray-500 hover:text-primary-600 hover:border-primary-600 hover:bg-primary-50/10 transition-all duration-300"
                        title={sm.name}
                      >
                        {icon}
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Vendor Zone */}
              {config?.business_mode === "multi" && (
                <div className="pt-2">
                  <h5 className="text-[10px] font-extrabold text-neutral-gray-900 uppercase tracking-wider mb-2.5">
                    Vendor Zone
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/vendors/register"
                      className="inline-flex items-center justify-center px-2 py-2 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-lg text-[10px] font-bold shadow-sm shadow-primary-600/10 cursor-pointer transition-all text-center whitespace-nowrap"
                    >
                      Become a Vendor
                    </Link>
                    <a
                      href={`${BACKEND_URL}/vendor/auth/login`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-2 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-gray-800 border border-neutral-gray-200 rounded-lg text-[10px] font-bold cursor-pointer transition-all text-center whitespace-nowrap"
                    >
                      Login as Vendor
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Quick links & other columns wrapper */}
            <div className="md:col-span-9">
              <div className="grid grid-cols-2 sm:grid-cols-12 gap-6">
                {/* Quick Links */}
                <div className="sm:col-span-4 space-y-4">
                  <h5 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider">
                    Quick Links
                  </h5>
                  <ul className="space-y-2.5">
                    {businessPagesDefault1.map((page: any) => (
                      <li key={page.slug}>
                        <Link
                          href={`/page/${page.slug}`}
                          className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-all font-medium"
                        >
                          {page.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/vendors"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-all font-medium"
                      >
                        All Vendors / Shops
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Information Links */}
                <div className="sm:col-span-4 space-y-4">
                  <h5 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider">
                    Information
                  </h5>
                  <ul className="space-y-2.5">
                    {businessPagesDefault0.map((page: any) => (
                      <li key={page.slug}>
                        <Link
                          href={`/page/${page.slug}`}
                          className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-all font-medium"
                        >
                          {page.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/track-order"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-all font-medium"
                      >
                        Track Order Status
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Newsletter Subscription */}
                <div className="col-span-2 sm:col-span-4 space-y-4">
                  <h5 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider">
                    Newsletter
                  </h5>
                  <p className="text-xs text-neutral-gray-500 leading-relaxed font-medium">
                    Subscribe to receive the latest updates, special deals, and new arrivals.
                  </p>
                  <FooterSubscribeForm />
                </div>
              </div>

              {/* Contact Information & App download blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 mt-10 border-t border-neutral-gray-200/50">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <Phone size={14} />
                  </div>
                  <div>
                    <h6 className="text-[10px] font-extrabold text-neutral-gray-400 uppercase tracking-wider mb-0.5">
                      Hotline Number
                    </h6>
                    <a
                      href={`tel:${config?.company_phone}`}
                      className="text-xs font-extrabold text-neutral-gray-800 hover:text-primary-600 transition-colors"
                    >
                      {config?.company_phone || "Support line unavailable"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <Mail size={14} />
                  </div>
                  <div>
                    <h6 className="text-[10px] font-extrabold text-neutral-gray-400 uppercase tracking-wider mb-0.5">
                      Email Address
                    </h6>
                    <a
                      href={`mailto:${config?.company_email}`}
                      className="text-xs font-extrabold text-neutral-gray-800 hover:text-primary-600 transition-colors"
                    >
                      {config?.company_email || "mail@company.com"}
                    </a>
                  </div>
                </div>

                {showAppSection && (
                  <div className="flex flex-col space-y-2">
                    <h6 className="text-[10px] font-extrabold text-neutral-gray-400 uppercase tracking-wider">
                      Download Apps
                    </h6>
                    <div className="flex gap-2">
                      {showIos && (
                        <a
                          href={config.ios?.link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-85 transition-opacity"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                            alt="App Store"
                            className="h-8"
                          />
                        </a>
                      )}
                      {showAndroid && (
                        <a
                          href={config.android?.link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:opacity-85 transition-opacity"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                            alt="Google Play"
                            className="h-8"
                          />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="border-t border-neutral-gray-200/50 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-neutral-gray-500 font-bold">
              © {new Date().getFullYear()} {config?.company_name || "ShopSphere"}. All rights reserved.
            </p>
            <div className="flex items-center space-x-2 text-[10px] text-neutral-gray-400 font-bold">
              <span>Powered by</span>
              <span className="text-neutral-gray-800 font-black tracking-wider uppercase">
                ShopSphere Core
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
