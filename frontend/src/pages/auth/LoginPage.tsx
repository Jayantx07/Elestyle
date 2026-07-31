import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsUnverified(false);
    setResendStatus('');

    try {
      const data = await authService.login({ email, password });
      if (data.success) {
        login(data.user, data.accessToken);
        navigate('/');
      } else {
        setError(data.message || 'Login failed');
        if (data.isUnverified) {
          setIsUnverified(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address to resend verification.');
      return;
    }
    setIsResending(true);
    setResendStatus('');
    try {
      const data = await authService.resendVerification(email);
      if (data.success) {
        setResendStatus('Verification email sent! Check your inbox.');
      } else {
        setError(data.message || 'Failed to resend verification email.');
      }
    } catch (err: any) {
      setError(err.message || 'Error resending verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const data = await authService.googleAuth(credentialResponse.credential);
      if (data.success) {
        login(data.user, data.accessToken);
        navigate('/');
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAF3EB] py-16 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100/50">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 font-fraunces">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome back! Please enter your details.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-100 text-sm text-red-600 space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
            {isUnverified && (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="mt-2 text-xs font-semibold text-black underline hover:text-gray-700 block"
              >
                {isResending ? 'Sending email...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
        )}

        {resendStatus && (
          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 text-sm text-emerald-800 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{resendStatus}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full rounded-xl border border-gray-200 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-black font-semibold hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              className="w-full rounded-xl border border-gray-200 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 rounded-xl bg-black py-3 px-4 text-sm font-semibold text-white hover:bg-gray-800 transition active:scale-[0.99] disabled:opacity-50 shadow-md"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            shape="pill"
            width="100%"
          />
        </div>

        <div className="text-center pt-2 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-black hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
