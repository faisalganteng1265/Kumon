'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SuccessPopupProps {
  message: string;
  onClose: () => void;
}

function SuccessPopup({ message, onClose }: SuccessPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700/50 relative overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Success gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-lime-500 to-green-500"></div>

        <div className="p-8 text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-green-500/40 rounded-full"></div>
              <div className="relative bg-green-500/20 backdrop-blur-md rounded-full p-4 border border-green-500/50">
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Message */}
          <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>Success!</h3>
          <p className="text-gray-300 text-sm mb-6" style={{ fontFamily: "'Fredoka', sans-serif" }}>{message}</p>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-bold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-green-500/50 hover:scale-105 cursor-pointer"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState(true); // true = login, false = register
  const [panelOrder, setPanelOrder] = useState<'login' | 'register'>('login'); // Separate state for panel order
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('left'); // Track animation direction
  const { signIn, signUp, signInWithGoogle, signInWithGitHub } = useAuth();

  if (!isOpen) return null;

  const handleModeSwitch = () => {
    // Set animation direction based on CURRENT panel position (before change)
    setAnimationDirection(panelOrder === 'login' ? 'left' : 'right');

    setIsTransitioning(true);
    setError('');

    // Phase 1: Fade out content (200ms)
    // Phase 2: Panel expands to full width (400ms)
    setTimeout(() => {
      // Change content AND panel order while panel is full width
      setDisplayMode(!isLogin);
      setIsLogin(!isLogin);
      setPanelOrder(isLogin ? 'register' : 'login');
      setEmail('');
      setPassword('');
      setUsername('');
    }, 500); // After expand

    // Phase 3: Panel returns to normal + content fades in (400ms)
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000); // Total animation time
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Check if input is email or username
        const isEmail = email.includes('@');
        let loginEmail = email;

        if (!isEmail) {
          // Input is username, fetch email from profiles table
          const { supabase } = await import('@/lib/supabase');

          // Try exact match first (case-sensitive)
          let { data, error: fetchError } = await supabase
            .from('profiles')
            .select('email, username')
            .eq('username', email)
            .maybeSingle();

          // If not found, try case-insensitive
          if (!data || fetchError) {
            const result = await supabase
              .from('profiles')
              .select('email, username')
              .ilike('username', email)
              .maybeSingle();

            data = result.data;
            fetchError = result.error;
          }

          console.log('[AuthModal] Username lookup:', {
            inputUsername: email,
            foundData: data,
            error: fetchError
          });

          if (fetchError) {
            console.error('[AuthModal] Database error:', fetchError);
            setError(`Database error: ${fetchError.message}. Try using email to login.`);
            setLoading(false);
            return;
          }

          if (!data || !data.email) {
            setError(`Username "${email}" not found. Please use email to login or check your username.`);
            setLoading(false);
            return;
          }

          loginEmail = data.email;
          console.log('[AuthModal] Found email for username:', loginEmail);
        }

        const { error } = await signIn(loginEmail, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
          setEmail('');
          setPassword('');
        }
      } else {
        if (!username) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          setError(error.message);
        } else {
          setError('');
          setSuccessMessage('Sign up successful! Please check your email for verification.');
          setShowSuccessPopup(true);
          setEmail('');
          setPassword('');
          setUsername('');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
      // Note: Google OAuth will redirect, so we don't close modal here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithGitHub();
      if (error) {
        setError(error.message);
      }
      // Note: GitHub OAuth will redirect, so we don't close modal here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Success Popup */}
      {showSuccessPopup && (
        <SuccessPopup
          message={successMessage}
          onClose={() => {
            setShowSuccessPopup(false);
            setIsLogin(true);
          }}
        />
      )}

      {/* Auth Modal */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        <div className="rounded-3xl shadow-2xl w-full max-w-5xl relative overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-700/50" style={{ backgroundColor: '#fef9ed' }}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-black hover:text-white transition-colors z-[60] rounded-full p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black cursor-pointer"
            style={{ backgroundColor: '#f7d050' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Form Panel - Order changes based on panelOrder */}
          <div
            className={`w-full p-12 flex flex-col justify-center relative transition-all duration-500 ease-in-out ${
              isTransitioning ? 'md:w-0 opacity-0' : 'md:w-1/2 opacity-100'
            } ${panelOrder === 'register' ? 'md:order-1' : 'md:order-2'}`}
            style={{ backgroundColor: '#fef9ed' }}
          >
            <div className={`w-full max-w-sm mx-auto transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <h2 className="text-3xl font-bold text-black mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {displayMode ? 'Login' : 'Registration'}
              </h2>
              <p className="text-gray-700 text-sm mb-8" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {displayMode ? 'Welcome back to AICampus!' : 'Join AICampus today'}
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xl" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-black rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      placeholder="Username"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xl" />
                  <input
                    type={isLogin ? 'text' : 'email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-black rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    placeholder={isLogin ? 'Email or Username' : 'Email'}
                    required
                  />
                </div>

                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xl" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-black rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="Password"
                    required
                    minLength={6}
                  />
                </div>

            

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm" style={{ fontFamily: "'Fredoka', sans-serif" }}>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-black font-bold py-3.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                  style={{ backgroundColor: '#f7d050', fontFamily: "'Fredoka', sans-serif" }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{isLogin ? 'Login' : 'Register'}</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-black"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 text-gray-700 font-bold" style={{ backgroundColor: '#fef9ed', fontFamily: "'Fredoka', sans-serif" }}>OR</span>
                </div>
              </div>

              {/* Social Sign In Buttons - Horizontal Layout */}
              <div className="flex gap-3 justify-center">
                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  title="Continue with Google"
                  className="bg-white border-2 border-black text-black p-3.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105 cursor-pointer"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>

                {/* GitHub Sign In Button */}
                <button
                  type="button"
                  onClick={handleGitHubSignIn}
                  disabled={loading}
                  title="Continue with GitHub"
                  className="bg-white border-2 border-black text-black p-3.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105 cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Welcome Panel - Order changes based on panelOrder with organic curved shape */}
          <div
            className={`w-full flex flex-col justify-center items-center text-white overflow-hidden ${
              panelOrder === 'register' ? 'md:order-2' : 'md:order-1'
            } ${
              isTransitioning
                ? 'md:absolute md:top-0 md:bottom-0 md:z-50 md:rounded-3xl p-12 transition-all duration-500 ease-in-out'
                : 'md:relative md:z-0 md:w-1/2 p-12 transition-all duration-500 ease-in-out'
            } ${
              isTransitioning
                ? (panelOrder === 'login' ? 'md:left-0 md:right-0' : 'md:left-0 md:right-0')
                : ''
            } ${
              isTransitioning ? '' : (panelOrder === 'register' ? 'md:rounded-l-[150px]' : 'md:rounded-r-[150px]')
            }`}
            style={
              isTransitioning
                ? animationDirection === 'left'
                  ? { backgroundColor: '#f7d050', animation: 'expandFromLeft 0.5s ease-in-out' }
                  : { backgroundColor: '#f7d050', animation: 'expandFromRight 0.5s ease-in-out' }
                : { backgroundColor: '#f7d050' }
            }
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 transition-all duration-700"></div>

            <div className={`relative z-10 text-center transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {displayMode ? 'Hello, Welcome!' : 'Welcome Back!'}
              </h1>
              <p className="text-lg mb-8 text-black/80" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {displayMode ? 'Don\'t have an account?' : 'Already have an account?'}
              </p>
              <button
                onClick={handleModeSwitch}
                className="px-8 py-3 border-2 border-black text-black rounded-full hover:bg-black hover:text-white transition-all duration-300 font-medium cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                {displayMode ? 'Register' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
