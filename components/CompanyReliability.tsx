'use client';

import React, { useEffect, useState } from 'react';
import { api, BACKEND_URL } from '@/lib/api';

const toProxyUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${BACKEND_URL}${url}`;
};

export default function CompanyReliability() {
  const [reliability, setReliability] = useState<any[]>([]);

  useEffect(() => {
    api.getConfig()
      .then((config) => {
        if (config?.company_reliability && Array.isArray(config.company_reliability)) {
          setReliability(config.company_reliability.filter((r: any) => r?.status === 1 && r?.title));
        }
      })
      .catch(console.error);
  }, []);

  if (reliability.length === 0) return null;

  return (
    <div className="bg-neutral-white border border-neutral-gray-200/50 rounded-3xl p-5 shadow-sm space-y-4">
      <h4 className="text-xs font-extrabold text-neutral-gray-900 uppercase tracking-wider">Why shop with us</h4>
      <div className="grid grid-cols-2 gap-4">
        {reliability.map((r: any, i: number) => {
          let reliabilityImg = "";
          if (r.image && typeof r.image === "object" && r.image.image_name) {
            reliabilityImg = `${BACKEND_URL}/storage/app/public/company-reliability/${r.image.image_name}`;
          } else if (r.image && typeof r.image === "string") {
            reliabilityImg = toProxyUrl(`/storage/app/public/company-reliability/${r.image}`);
          } else {
            // fallback icons mapping
            reliabilityImg = `${BACKEND_URL}/public/assets/front-end/img/${r.item}.png`;
          }
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 text-[11px] font-bold text-neutral-gray-800 bg-neutral-50 p-3 rounded-2xl border border-neutral-200/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={reliabilityImg}
                alt=""
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  // If image fails to load, replace with a generic fallback icon or hide
                  (e.target as HTMLImageElement).src = `https://cdn-icons-png.flaticon.com/512/1161/1161388.png`;
                }}
              />
              <span className="capitalize leading-snug">{r.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
