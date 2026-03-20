import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Chrome, 
  AlertCircle,
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing. Please try again. If you are using Safari or Brave, try opening the app in a new tab.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser. Please allow popups for this site, or open the app in a new tab.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`This domain (${window.location.hostname}) is not authorized for Google Sign-In. Please add it in Firebase Console -> Authentication -> Settings -> Authorized domains.`);
      } else {
        setError(err.message || 'An error occurred during sign-in. Please try again. If the issue persists, try opening the app in a new tab.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
              <ShoppingBag className="text-slate-900" size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              Welcome Back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
              Sign in to Magnolia Bakery
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold"
            >
              <AlertCircle size={18} className="flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <Loader2 className="animate-spin text-primary" size={20} />
            ) : (
              <Chrome size={20} className="text-primary" />
            )}
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
