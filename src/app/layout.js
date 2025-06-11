// src/app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../app/components/layout/Navbar';
import Sidebar from '../app/components/layout/Sidebar';
import ReduxWrapper from '@/redux/ReduxWrapper';
import AuthHydrator from './components/AuthHydrator';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MeetingSummarizer - Transcribe and Summarize Your Meetings',
  description: 'An AI-powered platform for meeting transcription and summarization',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxWrapper>
          <AuthHydrator>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <main className="p-6">{children}</main>
            </div>
          </AuthHydrator>
        </ReduxWrapper>
      </body>
    </html>
  );
}