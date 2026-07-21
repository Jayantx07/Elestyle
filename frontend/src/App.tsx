import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { CursorProvider } from '@/contexts/CursorContext';
import { CustomCursor } from '@/components/atoms/CustomCursor';

function App() {
  return (
    <CursorProvider>
      <CustomCursor />
      <RouterProvider router={router} />
    </CursorProvider>
  );
}

export default App;
