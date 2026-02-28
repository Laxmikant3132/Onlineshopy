# Digital Seva Center - Government Service Portal

A high-performance, accessible, and full-featured government services portal built with **Next.js 14**, **Firebase Auth**, and **Supabase**.

## 🚀 Key Features

- **Dual Authentication**: Secure login and registration powered by **Firebase Authentication**.
- **Customer Dashboard**:
  - **Service Applications**: Apply for government services (PAN, Passport, etc.) with document uploads.
  - **Track Applications**: Real-time status tracking for all submitted requests.
  - **Profile Management**: Update personal information and contact details.
  - **Delete Applications**: Option to remove pending or unwanted service requests.
- **Admin Panel**:
  - **Application Management**: Review, process, and update the status of customer applications.
  - **User Management**: Searchable database of all registered users and their roles.
  - **Service Configuration**: Add, edit, or delete the services available on the platform.
- **Bilingual Support**: Global toggle for **English** and **Kannada**, persisted via cookies across sessions.
- **Modern UI/UX**:
  - Built with **Tailwind CSS** and **Framer Motion** for smooth, professional animations.
  - High-impact branding using Deep Red (`#911A20`) and Navy Blue (`#1F295D`).
  - Mobile-responsive design for all dashboards and landing pages.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Database & Storage**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context (Language)

## 🎨 Design Specifications

- **Branding**: `#911A20` (Red) | `#1F295D` (Navy Blue)
- **Action Elements**: `#DA1515F3` (Buttons & Hover states)
- **Typography**: **Montserrat** (Modern & Professional)

## 🚦 Getting Started

1. **Clone & Install**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` with your Firebase and Supabase credentials:
   - `NEXT_PUBLIC_FIREBASE_*`
   - `NEXT_PUBLIC_SUPABASE_*`

3. **Run Development**:
   ```bash
   npm run dev
   ```

## 📄 Recent Major Updates
- **Global Language Context**: Implemented a global state for English/Kannada support.
- **Admin & User Pages**: Fixed 404s by implementing dedicated admin management interfaces.
- **Firebase/Supabase Sync**: Integrated Firebase Auth with Supabase user profiles.
- **Security & RLS**: Configured Supabase storage and table policies for secure data handling.
