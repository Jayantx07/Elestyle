import { Link, useRouteError } from 'react-router-dom';

export default function NotFound() {
  const error = useRouteError() as any;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-8 rounded max-w-2xl text-left overflow-auto w-full max-w-4xl">
          <h3 className="font-bold">Runtime Error:</h3>
          <pre className="text-sm mt-2 whitespace-pre-wrap">{JSON.stringify(error, null, 2)}</pre>
          <pre className="text-sm mt-2">{error?.message || String(error)}</pre>
          {error?.stack && <pre className="text-xs mt-2 opacity-80">{error.stack}</pre>}
        </div>
      )}
      <Link 
        to="/" 
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
