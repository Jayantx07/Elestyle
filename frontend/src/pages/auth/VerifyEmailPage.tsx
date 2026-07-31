import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (hasVerifiedRef.current) return;

    if (!token) {
      setStatus('error');
      setMessage('Missing verification token in request URL.');
      return;
    }

    hasVerifiedRef.current = true;

    const verify = async () => {
      try {
        const data = await authService.verifyEmail(token);
        if (data.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          if (data.user && data.accessToken) {
            login(data.user, data.accessToken);
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to verify email token.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'An error occurred during email verification.');
      }
    };

    verify();
  }, [token, login]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAF3EB] py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100/50 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-fraunces">
          Email Verification
        </h2>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
            <p className="text-gray-600 text-sm font-medium">Verifying your account details...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6 py-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div>
              <p className="text-emerald-800 font-semibold text-lg">{message}</p>
              <p className="text-gray-500 text-sm mt-1">You are now logged in and ready to explore.</p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => navigate('/')}
                className="w-full rounded-xl bg-black py-3 px-4 text-sm font-semibold text-white hover:bg-gray-800 transition active:scale-[0.99] shadow-md"
              >
                Go to Homepage
              </button>
              <Link
                to="/profile"
                className="w-full rounded-xl border border-gray-200 py-3 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                View Profile
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6 py-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-red-700 font-semibold text-base">{message}</p>
              <p className="text-gray-500 text-sm mt-1">
                If your account is already verified, you can sign in directly.
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/login"
                className="w-full rounded-xl bg-black py-3 px-4 text-sm font-semibold text-white hover:bg-gray-800 transition active:scale-[0.99] shadow-md block"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
