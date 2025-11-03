# Dashboard App

A modern, responsive mini dashboard built with Next.js and ShadCN UI. Manage Products and Orders with create/list/edit flows, advanced tables, live forms with validation, and polished UX (dark mode, loaders, animations, toasts).

## ✨ Features
- Products: Create, List (TanStack Table), Edit, Delete
- Orders: Create (live totals, shipping), List (progress, feedback, badges), Edit (status/address/payment/feedback), Delete
- Auth: Sign up / Sign in, cookie-based session, route protection
- UI/UX: ShadCN components, dark mode, loaders, toasts (success/error), confirm dialog, responsive layout
- Charts: Recharts (bars, sparkline/area/line)

## 🧭 What can you do here?
- Add products with full details and image (drag & drop)
- Create orders: select products, quantities, shipping; see instant totals and line items
- Track delivery progress and customer feedback icons in the orders table
- Edit orders (status, address, payment, feedback) and products; get granular success toasts

## 🛠 Tech Stack
- Next.js 16 (App Router)
- React 19
- ShadCN UI + Tailwind CSS
- TanStack Query + TanStack Table
- React Hook Form + Zod
- Recharts
- MongoDB + Mongoose

## 📂 Folder Structure
```
app/
  (auth)/              # signin/signup pages
  api/                 # REST API routes (products, orders, auth)
  dashboard/           # protected dashboard layout + pages
    products/
      create/
      [id]/edit/
    orders/
      create/
      [id]/edit/
components/
  ui/                  # shadcn-like UI + custom loader/toast/dialog
lib/
  mongodb.ts           # Mongoose connection helper
models/                # Mongoose models (Product, Order, User)
```

## 🚀 Getting Started
1. Install deps
```bash
npm install
```
2. Add `.env.local`
```
MONGODB_URI="your-connection-string"
```
3. Run dev server
```bash
npm run dev
```

## 🔑 Authentication
- Sign up at `/signup` → Sign in at `/signin`
- Protected routes under `/dashboard` via middleware cookie check

## 🧾 API Overview
- `GET/POST/PUT/DELETE /api/products`
- `GET/POST/PUT/DELETE /api/orders`
- `POST /api/auth/signup`, `POST/DELETE /api/auth/signin`

## 💡 UI Conventions
- Top-right toasts for all success/error notifications
- Confirm Dialog for destructive actions (Delete)
- Consistent gradient background across app (light/dark)

## 📋 Scripts
- `npm run dev` – start dev server
- `npm run build` – build
- `npm run start` – start production
- `npm run lint` – lint

## 🗺 Roadmap (nice-to-have)
- Order details page with timeline
- Persist table filters + theme to localStorage
- Replace base64 images with upload storage
