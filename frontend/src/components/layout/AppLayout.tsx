import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../organisms/Navbar';
import { Footer } from '../organisms/Footer';
import { useEffect } from 'react';

export default function AppLayout() {
  const location = useLocation();

  // Ensure data-category is cleared when navigating to non-category pages
  // (CategoryPage's ThemeProvider handles setting it for category routes,
  //  and cleans up on unmount — this is a safety guard for SSR/edge cases)
  useEffect(() => {
    if (!location.pathname.startsWith('/category/')) {
      document.documentElement.removeAttribute('data-category');
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

