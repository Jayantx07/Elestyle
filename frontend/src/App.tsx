import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { CursorProvider } from '@/contexts/CursorContext';
import { Cursor } from '@/components/ui/inverted-cursor';

import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useLiveSync } from '@/hooks/useLiveSync';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id.apps.googleusercontent.com';

// Component to initialize global hooks inside QueryClientProvider
function GlobalHooks() {
  useLiveSync();
  return null;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <CartProvider>
            <WishlistProvider>
              <CursorProvider>
                <GlobalHooks />
                <RouterProvider router={router} />
                <Cursor />
              </CursorProvider>
            </WishlistProvider>
          </CartProvider>
        </QueryClientProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
