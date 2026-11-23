import React, { useState } from 'react';
import { User, ArrowRight, Lock, Mail, Sparkles, X, ShieldCheck } from 'lucide-react';
import { apiService } from '../services/apiService';

interface UserAuthModalProps {
  currentUserId: string | null;
  knownUsers: string[];
  onSubmit: (userId: string, email?: string) => void;
  onClose?: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  currentUserId,
  knownUsers,
  onSubmit,
  onClose,
}) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();

    if (!cleanId) {
      setError('Please enter a valid name or username.');
      return;
    }

    if (cleanId.length > 32) {
      setError('User ID must be 32 characters or fewer.');
      return;
    }

    setError(null);

    // If password is provided, attempt backend authentication
    if (password) {
      setLoading(true);
      try {
        if (mode === 'register') {
          const cleanEmail = email.trim() || `${cleanId}@salattracker.local`;
          const res = await apiService.register(cleanId, cleanEmail, password);
          if (!res.success) {
            setError(res.message || 'Registration failed');
            setLoading(false);
            return;
          }
          onSubmit(res.data?.user.username || cleanId, cleanEmail);
        } else {
          const res = await apiService.login(cleanId, password);
          if (!res.success) {
            setError(res.message || 'Invalid username or password');
            setLoading(false);
            return;
          }
          onSubmit(res.data?.user.username || cleanId);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Authentication failed';
        setError(msg);
        setLoading(false);
        return;
      }
      setLoading(false);
    } else {
      // Local profile mode
      onSubmit(cleanId);
    }
  };

  const handleSelectExisting = (user: string) => {
    onSubmit(user);
  };

  const isModal = Boolean(currentUserId && onClose);

  const submitButtonLabel = loading
    ? 'Authenticating...'
    : mode === 'register'
    ? 'Create Account'
    : currentUserId
    ? 'Switch to this User'
    : 'Start Tracking';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200/90 w-full max-w-md overflow-hidden relative">
        {/* Close button if currently logged in */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Decorative Top Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 p-6 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-3 backdrop-blur-xs ring-1 ring-white/20">
            <Sparkles className="w-6 h-6 text-emerald-200" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {currentUserId ? 'Switch User Account' : 'Welcome to Salat Tracker'}
          </h2>
          <p className="text-emerald-100/90 text-xs mt-1 max-w-xs mx-auto leading-relaxed">
            Securely track your 5 daily prayers with Supabase PostgreSQL cloud sync and mindfulness.
          </p>
        </div>

        {/* Auth Mode Toggle */}
        <div className="flex border-b border-stone-200 bg-stone-50/70 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'signin'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-center transition-colors ${
              mode === 'register'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-700 font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Identifier */}
            <div>
              <label
                htmlFor="userIdInput"
                className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
              >
                {mode === 'register' ? 'Username' : 'Enter your Name or User ID'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="userIdInput"
                  type="text"
                  autoFocus
                  placeholder={mode === 'signin' ? 'e.g. Tariq or aisha_k' : 'Choose a unique username'}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-stone-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                />
              </div>
            </div>

            {/* Email (only in register mode) */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="emailInput"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="emailInput"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="passwordInput"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600"
                >
                  Password
                </label>
                {mode === 'signin' && (
                  <span className="text-[11px] text-stone-400">Optional for local profile</span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="passwordInput"
                  type="password"
                  placeholder={mode === 'signin' ? 'Enter password for cloud sync' : 'At least 6 characters'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 transition-all"
                />
              </div>
            </div>

            {error && <p className="text-red-600 text-xs mt-1.5 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-semibold py-3 px-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{submitButtonLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          {/* Known accounts list for switching */}
          {knownUsers.length > 0 && mode === 'signin' && (
            <div className="mt-6 pt-5 border-t border-stone-100">
              <span className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
                Saved Accounts on this Device
              </span>
              <div className="flex flex-wrap gap-2">
                {knownUsers.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleSelectExisting(u)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                      u === currentUserId
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <User className="w-3 h-3 text-stone-400" />
                    <span>{u}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-1.5 text-stone-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted with JWT & bcrypt &bull; Supabase PostgreSQL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
