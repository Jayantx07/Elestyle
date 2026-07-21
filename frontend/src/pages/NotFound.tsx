import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
      <Link 
        to="/" 
        className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
