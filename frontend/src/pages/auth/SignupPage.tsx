import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { GoogleLogin } from '@react-oauth/google';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateInputs = () => {
    if (!name.trim()) return 'Full name is required.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address.';
    if (!password || password.length < 6) return 'Password must be at least 6 characters long.';
    if (phone.trim() && !/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/.test(phone.trim())) {
      return 'Please enter a valid phone number.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.signup({ name, email, password, phone });
      if (data.success) {
        setSuccess('Registration successful! A verification link has been sent to your email.');
        setName(''); setEmail(''); setPassword(''); setPhone('');
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join ElleStyle to enjoy personalized shopping and exclusive collections.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-100 text-sm text-red-600 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 text-sm text-emerald-800 space-y-2">
            <div className="font-semibold flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Verify Your Email</span>
            </div>
            <p>{success}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-gray-200 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              placeholder="e.g. Eleanor Vance"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Email Address *
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              className="w-full rounded-xl border border-gray-200 py-3 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
              Password * (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
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
            {isLoading ? 'Creating account...' : 'Create Account'}
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
            onError={() => setError('Google Sign Up Failed')}
            text="signup_with"
            shape="pill"
            width="100%"
          />
        </div>

        <div className="text-center pt-2 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-black hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
