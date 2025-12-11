import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useMeeting } from '@/contexts/MeetingContext';
import { XIcon, VideoIcon } from '@/components/icons/Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { setCurrentUser } = useMeeting();
  const [mode, setMode] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [email, setEmail] = useState('');
  // পাসওয়ার্ড ফিল্ড আপাতত ডামি রাখা হয়েছে সিম্পলিসিটির জন্য
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // ১. সাইন ইন ফাংশন
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ইমেইল দিয়ে ইউজার খোঁজা
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        setMode('signup');
        setError('User not found. Please create an account.');
        setLoading(false);
        return;
      }

      setCurrentUser(userData);
      onSuccess();
    } catch (err) {
      setError('An error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  // ২. সাইন আপ ফাংশন
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: 'temporary-password-123', // অটোমেটিক পাসওয়ার্ড
        options: {
          data: {
            full_name: displayName,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
         // ডাটাবেস আপডেট হওয়ার জন্য একটু সময় নেওয়া
         await new Promise(resolve => setTimeout(resolve, 1000));
         
         const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

         if (userData) {
           setCurrentUser(userData);
           onSuccess();
         } else {
           // যদি ডাটাবেস থেকে না পায়, ম্যানুয়ালি সেট করা
           setCurrentUser({
             id: authData.user.id,
             email: authData.user.email,
             full_name: displayName,
             avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
             created_at: new Date().toISOString()
           } as any);
           onSuccess();
         }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up.');
    } finally {
      setLoading(false);
    }
  };

  // ৩. গেস্ট জয়েন (ফিক্স করা হয়েছে)
  const handleGuestJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Starting Guest Join...");
      
      // Supabase Anonymous Login
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously({
        options: {
          data: {
             full_name: displayName || 'Guest',
             is_guest: true
          }
        }
      });

      if (authError) {
        console.error("Auth Error:", authError);
        throw authError;
      }

      console.log("Guest Auth Successful:", authData);

      if (authData.user) {
        // টাইপ এরর এড়ানোর জন্য 'as any' ব্যবহার করা হয়েছে
        const guestUser: any = {
          id: authData.user.id,
          email: `guest_${authData.user.id.slice(0, 5)}@neetfast.com`, // ফেইক ইমেইল
          full_name: displayName || 'Guest',
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
          is_guest: true,
          created_at: new Date().toISOString()
        };

        // ইউজারের ডাটাবেসে এন্ট্রি করা (যাতে পরে খুঁজে পাওয়া যায়)
        await supabase.from('users').insert(guestUser).select();

        setCurrentUser(guestUser);
        onSuccess();
      }

    } catch (err: any) {
      console.error("Full Error:", err);
      setError(err.message || 'Could not join as guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="relative p-6 bg-gradient-to-br from-indigo-600 to-purple-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <XIcon size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <VideoIcon size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">NeetFast</span>
          </div>
          <p className="text-indigo-200 text-sm">
            {mode === 'signin' && 'Sign in to your account'}
            {mode === 'signup' && 'Create a new account'}
            {mode === 'guest' && 'Join as a guest'}
          </p>
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'signin' ? 'bg-white dark:bg-gray-700 text-gray-900 shadow' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'signup' ? 'bg-white dark:bg-gray-700 text-gray-900 shadow' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode('guest')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                mode === 'guest' ? 'bg-white dark:bg-gray-700 text-gray-900 shadow' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Guest
            </button>
          </div>

          {/* Errors */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Forms */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border rounded-xl" placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border rounded-xl" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border rounded-xl" placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          {mode === 'guest' && (
            <form onSubmit={handleGuestJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border rounded-xl" placeholder="Enter your name" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold">
                {loading ? 'Joining...' : 'Continue as Guest'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;