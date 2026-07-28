import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { CursorProvider } from '@/contexts/CursorContext';
import { Cursor } from '@/components/ui/inverted-cursor';

function App() {
  return (
    <CursorProvider>
      <RouterProvider router={router} />
      <Cursor />
    </CursorProvider>
  );
}

export default App;
