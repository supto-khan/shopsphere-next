# 💻 ShopSphere — Frontend SPA (Next.js Consumer App)

This is the customer-facing web application for the **ShopSphere** multi-vendor e-commerce platform. It is a high-performance, search-engine-optimized Single Page Application (SPA) built using Next.js (App Router), React, TypeScript, and Tailwind CSS.

---

## 🚀 Features

- **Dynamic Homepage**: Features interactive promotional banners, category menus, flash sale countdowns, and trending products.
- **Advanced Search & Filtering**: Multi-attribute filtering (by price, category, rating, vendor) with clean query URL sync.
- **Interactive Multi-Vendor Catalogs**: Customers can browse dedicated vendor profile pages, check store ratings, and view products offered by specific sellers.
- **Cart & Dynamic Checkout**: Secure cart management and multi-step checkout flow featuring shipping option choice, address management, and dynamic tax calculation.
- **Order Tracking**: Enter order ID/credentials to see live shipping tracking status fetched directly from the backend.
- **Customer Dashboard (Profile)**: Edit personal details, view order histories, track active transactions, and manage wishlists.
- **Modern UI/UX**: Designed with smooth micro-interactions, clean layouts, custom responsive breakpoints, and modern web font optimization.

---

## 📁 Project Directory Structure

```bash
├── app/                      # Next.js App Router folders
│   ├── about-us/             # Static brand information page
│   ├── checkout/             # Shopping cart and checkout flow pages
│   ├── discounted-products/  # Discount promotional lists
│   ├── flash-deals/          # Deal timers and countdown promotion grids
│   ├── product/              # Product detail views (/product/[id])
│   ├── products/             # General product browsing grids
│   ├── profile/              # Secure customer dashboard/profile pages
│   ├── search/               # Search result views
│   ├── shop/                 # General shop browse page
│   ├── track-order/          # Order delivery tracking status page
│   ├── vendors/              # Multi-vendor listing and store detail views
│   ├── layout.tsx            # Global layout wrapper containing providers
│   ├── globals.css           # Global custom css styling tokens
│   └── page.tsx              # Main homepage component
├── components/               # Shared reusable UI elements (Buttons, Inputs, Cards, etc.)
├── lib/                      # Core helpers, API fetch clients, and global state utility wrappers
├── types/                    # TypeScript interfaces for API models
└── public/                   # Static assets (images, icons, svgs)
```

---

## 🛠️ Installation & Local Setup

### Prerequisites
- Node.js (v18.x or newer recommended)
- npm, yarn, pnpm, or bun

### Setup Steps
1. Navigate to the frontend directory:
   ```bash
   cd frontend-spa
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root of `frontend-spa/` and add the backend API gateway URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open your browser and navigate to `http://localhost:3000`.

---

## 🌐 Production Build & Deployment

To build the application for production:
```bash
npm run build
```

To start the optimized Next.js server locally:
```bash
npm run start
```
This application can be seamlessly deployed on platforms like **Vercel**, **AWS Amplify**, or any Node.js environment.
