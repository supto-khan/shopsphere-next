"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, BACKEND_URL } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Phone, Mail, UserCheck, MapPin, Link2 } from "lucide-react";
import Link from "next/link";

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
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
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
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
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
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" />
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
    <circle cx="12" cy="12" r="10" />
    <path d="M10 7.5v9.5c0 1.5-.5 2.5-1.5 3.5" />
    <path d="M10 7.5h3.5c1.7 0 3 1.3 3 3s-1.3 3-3 3H10" />
  </svg>
);

const GooglePlus = ({ size = 24, ...props }: IconProps) => (
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
    <path d="M14.5 8.5C13.5 7 11.8 6 10 6c-3.3 0-6 2.7-6 6s2.7 6 6 6c1.8 0 3.5-1 4.5-2.5V12h-4" />
    <path d="M18 12h4M20 10v4" />
  </svg>
);



export default function Footer() {
  const router = useRouter();
  const { isLoggedIn } = useAppStore();
  const [config, setConfig] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribedMsg, setSubscribedMsg] = useState("");

  useEffect(() => {
    api
      .getConfig()
      .then((res) => {
        setConfig(res);
      })
      .catch((err) => {
        console.error("Failed to load footer config", err);
      });
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    setSubscribedMsg("");
    try {
      // Mock or call subscription endpoint if it exists
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubscribedMsg("Thank you for subscribing!");
      setEmail("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubscribing(false);
    }
  };

  // Extract clean logo path
  let footerLogo = "/logo-placeholder.png";
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
            <p className="text-[10px] text-neutral-gray-500">Check Latest Blogs.</p>
          </Link>
        </div>
      </div>
      <footer className="bg-gray-200/30 border-t border-primary-100/60 w-full">
        {/* Main Footer Body links/newsletter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Logo & app download column */}
            <div className="md:col-span-3 space-y-6">
              <Link href="/" className="inline-block">
                <img
                  src={footerLogo}
                  alt={config?.company_name || "ShopSphere"}
                  className="max-h-12 object-contain"
                />
              </Link>

              {showAppSection && (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-extrabold text-neutral-gray-400 uppercase tracking-wider">
                    Download Our App
                  </h5>
                  <div className="flex gap-2">
                    {showIos && (
                      <a
                        href={config?.ios?.link || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block transition-transform hover:-translate-y-0.5"
                      >
                        <img
                          width="90"
                          src="/apple_app.png"
                          alt="Apple App Store"
                          className="object-contain"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://activeitzone.com/demo_images/app-store.png";
                          }}
                        />
                      </a>
                    )}
                    {showAndroid && (
                      <a
                        href={config?.android?.link || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block transition-transform hover:-translate-y-0.5"
                      >
                        <img
                          width="90"
                          src="/google_app.png"
                          alt="Google Play Store"
                          className="object-contain"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://activeitzone.com/demo_images/play-store.png";
                          }}
                        />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {config?.business_mode === "multi" && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-[10px] font-extrabold text-neutral-gray-400 uppercase tracking-wider">
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
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href={isLoggedIn ? "/profile" : "/login"}
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors"
                      >
                        Profile Info
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile/wishlist"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors"
                      >
                        Wish List
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/flash-deals"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors"
                      >
                        Flash Deal
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products/featured"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors"
                      >
                        Featured Products
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products/best-sellers"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors"
                      >
                        Best Selling Products
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products/latest"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors"
                      >
                        Latest Products
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/products/top-rated"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors"
                      >
                        Top Rated Products
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/track-order"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors"
                      >
                        Track Order
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Other Pages */}
                <div className="sm:col-span-4 space-y-4">
                  <h5 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider">
                    Other
                  </h5>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/about-us"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors block"
                      >
                        About Us
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/page/terms"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors block"
                      >
                        Terms And Conditions
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/page/privacy-policy"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors block"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/page/return-policy"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors block"
                      >
                        Return Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/page/cancellation-policy"
                        className="text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors block"
                      >
                        Cancellation Policy
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Newsletter subscription */}
                <div className="sm:col-span-4 space-y-4">
                  <h5 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider">
                    Newsletter
                  </h5>
                  <p className="text-xs text-neutral-gray-500 leading-relaxed">
                    Subscribe to our channel to get latest updates.
                  </p>
                  <form onSubmit={handleSubscribe} className="space-y-2 relative">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your Email Address"
                        className="w-full px-3.5 py-2.5 text-xs border border-neutral-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-600 bg-neutral-white font-medium"
                        required
                      />
                      <button
                        type="submit"
                        disabled={subscribing}
                        className="w-full sm:w-auto px-5 py-2.5 bg-primary-600 hover:bg-primary-800 text-neutral-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        {subscribing ? "..." : "Subscribe"}
                      </button>
                    </div>
                    {subscribedMsg && (
                      <p className="text-[10px] text-green-600 font-semibold absolute -bottom-5 left-1">
                        {subscribedMsg}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Address and Contacts block */}
          <div className="mt-12 pt-8 border-t border-neutral-gray-200/40 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Start Conversation */}
            <div className="md:col-span-5 space-y-3">
              <h5 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider">
                Start a Conversation
              </h5>
              <div className="space-y-2">
                <a
                  href={`tel:${config?.company_phone || ""}`}
                  className="flex items-center gap-2 text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors w-max"
                >
                  <Phone size={14} className="text-primary-600" />
                  <span className="font-semibold">{config?.company_phone || "Call Support"}</span>
                </a>
                <a
                  href={`mailto:${config?.company_email || ""}`}
                  className="flex items-center gap-2 text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors w-max"
                >
                  <Mail size={14} className="text-primary-600" />
                  <span className="font-semibold">{config?.company_email || "Email Support"}</span>
                </a>
                <Link
                  href={isLoggedIn ? "/profile/support" : "/login"}
                  className="flex items-center gap-2 text-xs text-neutral-gray-500 hover:text-primary-600 transition-colors w-max"
                >
                  <UserCheck size={14} className="text-primary-600" />
                  <span className="font-semibold">Support Ticket</span>
                </Link>
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-4 space-y-3">
              <h5 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider">
                Address
              </h5>
              <div className="flex items-start gap-2 text-xs text-neutral-gray-500">
                <MapPin size={14} className="text-primary-600 mt-0.5 shrink-0" />
                <p className="font-medium leading-relaxed">
                  {config?.shop_address || "Company Location Address"}
                </p>
              </div>
            </div>

            {/* Social icons */}
            <div className="md:col-span-3">
              <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                {socialMedia.map((item: any, idx: number) => {
                  const name = item.name.toLowerCase();
                  let IconComponent: React.ComponentType<any> = Link2;

                  if (name.includes("facebook")) {
                    IconComponent = Facebook;
                  } else if (name.includes("twitter") || name.includes("x")) {
                    IconComponent = Twitter;
                  } else if (name.includes("instagram")) {
                    IconComponent = Instagram;
                  } else if (name.includes("linkedin")) {
                    IconComponent = Linkedin;
                  } else if (name.includes("youtube")) {
                    IconComponent = Youtube;
                  } else if (name.includes("pinterest")) {
                    IconComponent = Pinterest;
                  } else if (
                    name.includes("google") ||
                    name.includes("gplus") ||
                    name.includes("googleplus") ||
                    name.includes("google-plus")
                  ) {
                    IconComponent = GooglePlus;
                  }

                  return (
                    <a
                      key={idx}
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-full border border-neutral-gray-200/60 bg-neutral-white flex items-center justify-center text-neutral-gray-600 hover:bg-primary-600 hover:border-primary-600 hover:text-neutral-white transition-all duration-200"
                    >
                      <IconComponent size={14} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright text bar */}
        <div className="bg-primary-100/20 py-4 border-t border-primary-100/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-neutral-gray-500 font-medium">
              {config?.copyright_text ||
                `© ${new Date().getFullYear()} ShopSphere. All rights reserved.`}
            </p>
            {businessPagesDefault0.length > 0 && (
              <ul className="flex flex-wrap gap-4">
                {businessPagesDefault0.map((page: any, idx: number) => (
                  <li key={idx}>
                    <Link
                      href={`/page/${page.slug}`}
                      className="text-[11px] text-neutral-gray-400 hover:text-primary-600 transition-colors"
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
