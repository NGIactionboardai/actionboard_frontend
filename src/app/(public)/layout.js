// src/app/(public)/layout.js
import HomeNavbar from '@/app/components/layout/HomeNavbar';
import NewHomeFooter from '@/app/components/layout/NewHomeFooter'; // ✅ import footer
import { Inter } from 'next/font/google';
import NewNavbar from '../components/layout/NewNavbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Nous Meeting – Homepage',
  description: 'Welcome to Nous Meeting – AI-powered meeting transcription and summarization.',
};

export default function HomeLayout({ children }) {
  return (
    <div className={`${inter.className} min-h-screen bg-white flex flex-col`}>
      {/* <HomeNavbar /> */}
      <NewNavbar variant="home" />
      <main className="flex-grow">{children}</main>
      <NewHomeFooter /> {/* ✅ added footer */}
    </div>
  );
}
