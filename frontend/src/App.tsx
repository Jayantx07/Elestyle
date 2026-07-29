import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { CursorProvider } from '@/contexts/CursorContext';
import { Cursor } from '@/components/ui/inverted-cursor';

import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <CursorProvider>
              <RouterProvider router={router} />
              <Cursor />
            </CursorProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
