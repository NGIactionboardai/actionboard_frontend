// src/app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../app/components/layout/Navbar';
import Sidebar from '../app/components/layout/Sidebar';
import ReduxWrapper from '@/redux/ReduxWrapper';
import AuthHydrator from './components/AuthHydrator';
import { Toaster } from 'react-hot-toast';

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
              <main className="p-0">{children}</main>
              <Toaster 
                position="top-right" 
                reverseOrder={false}
                toastOptions={{
                  // Default options for all toasts
                  style: {
                    background: '#111827', // Tailwind gray-900
                    color: '#fff',
                    fontSize: '14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981', // green-500
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444', // red-500
                      secondary: '#fff',
                    },
                  },
                }} 
              />
            </div>
          </AuthHydrator>
        </ReduxWrapper>
      </body>
    </html>
  );
}