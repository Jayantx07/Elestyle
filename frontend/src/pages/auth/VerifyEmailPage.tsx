import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    const verify = async () => {
      if (!token) {
        if (isMounted) {
          setStatus('error');
          setMessage('Missing verification token.');
        }
        return;
      }
      try {
        const data = await authService.verifyEmail(token);
        if (isMounted) {
          if (data.success) {
            setStatus('success');
            setMessage('Your email has been verified successfully!');
          } else {
            setStatus('error');
            setMessage(data.message || 'Failed to verify email.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setMessage(err.message || 'An error occurred during verification.');
        }
      }
    };
    verify();
    return () => { isMounted = false; };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
          Email Verification
        </h2>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-green-700 font-medium">{message}</p>
            <Link to="/login" className="mt-4 inline-block rounded-md bg-black px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
              Sign in to continue
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-700 font-medium">{message}</p>
            <Link to="/login" className="mt-4 inline-block text-black font-medium hover:underline">
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
