// src/app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '../app/components/layout/Navbar';
import Sidebar from '../app/components/layout/Sidebar';
import ReduxWrapper from '@/redux/ReduxWrapper';
import AuthHydrator from './components/AuthHydrator';
import { Toaster } from 'react-hot-toast';
import InterceptorLoader from './components/InterceptorLoader';
import ProtectedRoute from './components/ProtectedRoute';
// import 'rsuite/dist/rsuite.min.css';
import 'rsuite/dist/rsuite-no-reset.min.css';


const inter = Inter({ subsets: ['latin'] });


export const metadata = {
  title: 'Nous Meeting',
  description: 'An AI-powered platform for meeting transcription and summarization',
  icons: {
    icon: [
      // Android Icons
      { rel: "icon", type: "image/png", sizes: "36x36", url: "/favicon/android-icon-36x36.png" },
      { rel: "icon", type: "image/png", sizes: "48x48", url: "/favicon/android-icon-48x48.png" },
      { rel: "icon", type: "image/png", sizes: "72x72", url: "/favicon/android-icon-72x72.png" },
      { rel: "icon", type: "image/png", sizes: "96x96", url: "/favicon/android-icon-96x96.png" },
      { rel: "icon", type: "image/png", sizes: "144x144", url: "/favicon/android-icon-144x144.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", url: "/favicon/android-icon-192x192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", url: "/favicon/android-icon-512x512.png" },

      // Apple Icons
      { rel: "apple-touch-icon", type: "image/ico", url: "/favicon/apple-icon.png" },
      { rel: "apple-touch-icon", sizes: "57x57", url: "/favicon/apple-icon-57x57.png" },
      { rel: "apple-touch-icon", sizes: "60x60", url: "/favicon/apple-icon-60x60.png" },
      { rel: "apple-touch-icon", sizes: "72x72", url: "/favicon/apple-icon-72x72.png" },
      { rel: "apple-touch-icon", sizes: "76x76", url: "/favicon/apple-icon-76x76.png" },
      { rel: "apple-touch-icon", sizes: "114x114", url: "/favicon/apple-icon-114x114.png" },
      { rel: "apple-touch-icon", sizes: "120x120", url: "/favicon/apple-icon-120x120.png" },
      { rel: "apple-touch-icon", sizes: "144x144", url: "/favicon/apple-icon-144x144.png" },
      { rel: "apple-touch-icon", sizes: "152x152", url: "/favicon/apple-icon-152x152.png" },
      { rel: "apple-touch-icon", sizes: "180x180", url: "/favicon/apple-icon-180x180.png" },

      // Favicon Icons
      { rel: "icon", type: "image/ico", url: "/favicon/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon/favicon-16x16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "96x96", url: "/favicon/favicon-96x96.png" }
    ],
    other: [
      { rel: "apple-touch-icon-precomposed", url: "/favicon/apple-icon-precomposed.png" }
    ]
  },
  manifest: "/favicon/manifest.json"
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxWrapper>
          <AuthHydrator>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              {/* <main className="p-0">{children}</main> */}
              <ProtectedRoute>
                <main className="p-0">{children}</main>
              </ProtectedRoute>
              
              <Toaster 
                position="top-center" 
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
                    duration: 3000,
                    iconTheme: {
                      primary: '#10b981', // green-500
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 3000,
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