// src/app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import ReduxWrapper from '@/redux/ReduxWrapper';
import AuthHydrator from './components/AuthHydrator';
import { Toaster } from 'react-hot-toast';
import InterceptorLoader from './components/InterceptorLoader';

import 'rsuite/dist/rsuite-no-reset.min.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Nous Meeting',
  description: 'An AI-powered platform for meeting transcription and summarization',
  icons: {
    icon: [
      { rel: "icon", type: "image/png", sizes: "36x36", url: "/favicon/android-icon-36x36.png?v=2" },
      { rel: "icon", type: "image/png", sizes: "48x48", url: "/favicon/android-icon-48x48.png?v=2" },
      { rel: "icon", type: "image/png", sizes: "72x72", url: "/favicon/android-icon-72x72.png?v=2" },
      { rel: "icon", type: "image/png", sizes: "96x96", url: "/favicon/android-icon-96x96.png?v=2" },
      { rel: "icon", type: "image/png", sizes: "144x144", url: "/favicon/android-icon-144x144.png?v=2" },
      { rel: "icon", type: "image/png", sizes: "192x192", url: "/favicon/android-icon-192x192.png?v=2" },
      { rel: "icon", type: "image/png", sizes: "512x512", url: "/favicon/android-icon-512x512.png?v=2" },
      { rel: "apple-touch-icon", type: "image/ico", url: "/favicon/apple-icon.png?v=2" },
      { rel: "apple-touch-icon", sizes: "57x57", url: "/favicon/apple-icon-57x57.png?v=2" },
      { rel: "apple-touch-icon", sizes: "60x60", url: "/favicon/apple-icon-60x60.png?v=2" },
      { rel: "apple-touch-icon", sizes: "72x72", url: "/favicon/apple-icon-72x72.png?v=2" },
      { rel: "apple-touch-icon", sizes: "76x76", url: "/favicon/apple-icon-76x76.png?v=2" },
      { rel: "apple-touch-icon", sizes: "114x114", url: "/favicon/apple-icon-114x114.png?v=2" },
      { rel: "apple-touch-icon", sizes: "120x120", url: "/favicon/apple-icon-120x120.png?v=2" },
      { rel: "apple-touch-icon", sizes: "144x144", url: "/favicon/apple-icon-144x144.png?v=2" },
      { rel: "apple-touch-icon", sizes: "152x152", url: "/favicon/apple-icon-152x152.png?v=2" },
      { rel: "apple-touch-icon", sizes: "180x180", url: "/favicon/apple-icon-180x180.png?v=2" },
      { rel: "icon", type: "image/ico", url: "/favicon/favicon.ico?v=2" },
      { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon/favicon-16x16.png?v=2" },
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon/favicon-32x32.png?v=2" },
      { rel: "icon", type: "image/png", sizes: "96x96", url: "/favicon/favicon-96x96.png?v=2" }
    ],
    other: [
      { rel: "apple-touch-icon-precomposed", url: "/favicon/apple-icon-precomposed.png?v=2" }
    ]
  },
  manifest: "/favicon/manifest.json?v=2"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxWrapper>
          <AuthHydrator>
            <InterceptorLoader />
            <div className="min-h-screen bg-gray-50">
              {children}
              <Toaster
                position="top-center"
                reverseOrder={false}
                toastOptions={{
                  style: {
                    background: '#111827',
                    color: '#fff',
                    fontSize: '14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#ef4444',
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
