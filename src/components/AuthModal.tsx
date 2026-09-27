import React, { useState } from 'react';
import { X, Lock, Mail, User, Waves } from 'lucide-react';
import { UserSession } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    const loggedInUser: UserSession = {
      id: `user_${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      handle: `@${(name.trim() || email.split('@')[0]).toLowerCase().replace(/\s+/g, '_')}`,
      email: email.trim(),
      bio: 'Ocean lover exploring the Andaman Islands! 🌊🐚',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      followersCount: 12,
      followingCount: 34,
      visitedCount: 2,
      isLoggedIn: true,
    };
    onLoginSuccess(loggedInUser);
    onClose();
  };

  const handleGuestLogin = () => {
    const guestUser: UserSession = {
      id: 'guest_user',
      name: 'Island Traveler',
      handle: '@island_traveler',
      email: 'guest@emeraldandaman.islands',
      bio: 'Exploring Havelock, Neil & Port Blair on an Andaman journey! 🌴',
      avatarUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      followersCount: 45,
      followingCount: 88,
      visitedCount: 4,
      isLoggedIn: true,
    };
    onLoginSuccess(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#052440] rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-teal-100 dark:border-[#0d3b61]">
        {/* Top Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-[#0d3b61]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white">
              <Waves className="w-3.5 h-3.5" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white font-['Outfit']">
              {mode === 'login' ? 'Welcome Back' : 'Create Explorer Account'}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div className="flex bg-slate-100 dark:bg-[#021526] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Payal Mishra"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#0d3b61] bg-slate-50 dark:bg-[#021526] text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#0d3b61] bg-slate-50 dark:bg-[#021526] text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#0d3b61] bg-slate-50 dark:bg-[#021526] text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md mt-2"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#021526] dark:hover:bg-[#083256] text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-200 dark:border-[#0d3b61]"
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
