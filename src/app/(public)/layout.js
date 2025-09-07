// src/app/(home02)/home02/layout.js
import HomeNavbar from '@/app/components/layout/HomeNavbar';
import NewHomeFooter from '@/app/components/layout/NewHomeFooter'; // ✅ import footer
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Nous Meeting – Homepage',
  description: 'Welcome to Nous Meeting – AI-powered meeting transcription and summarization.',
};

export default function HomeLayout({ children }) {
  return (
    <div className={`${inter.className} min-h-screen bg-white flex flex-col`}>
      <HomeNavbar />
      <main className="flex-grow">{children}</main>
      <NewHomeFooter /> {/* ✅ added footer */}
    </div>
  );
}
