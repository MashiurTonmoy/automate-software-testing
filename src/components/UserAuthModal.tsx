import React, { useState } from 'react';
import { User, ArrowRight, ShieldCheck, Sparkles, X } from 'lucide-react';

interface UserAuthModalProps {
  currentUserId: string | null;
  knownUsers: string[];
  onSubmit: (userId: string) => void;
  onClose?: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  currentUserId,
  knownUsers,
  onSubmit,
  onClose,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) {
      setError('Please enter a valid name or username.');
      return;
    }
    if (trimmed.length > 32) {
      setError('User ID must be 32 characters or fewer.');
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  const handleSelectExisting = (user: string) => {
    onSubmit(user);
  };

  const isModal = Boolean(currentUserId && onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200/90 w-full max-w-md overflow-hidden relative">
        {/* Close button if currently logged in and opened via switch button */}
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
            Track your 5 daily prayers with clarity and mindfulness. Simply enter your name to access your records.
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userIdInput" className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
                Enter your Name or User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="userIdInput"
                  type="text"
                  autoFocus
                  placeholder="e.g. Tariq or aisha_k"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    if (error) setError(null);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-stone-300 focus:border-emerald-600 focus:ring-emerald-100'
                  }`}
                />
              </div>
              {error && (
                <p className="text-red-600 text-xs mt-1.5 font-medium">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-colors shadow-sm hover:shadow"
            >
              <span>{currentUserId ? 'Switch to this User' : 'Start Tracking'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Select for existing users on device */}
          {knownUsers.length > 0 && (
            <div className="mt-6 pt-5 border-t border-stone-100">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">
                Or select an existing user on this device:
              </p>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                {knownUsers.map((user) => (
                  <button
                    key={user}
                    type="button"
                    onClick={() => handleSelectExisting(user)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      user.toLowerCase() === currentUserId?.toLowerCase()
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800'
                    }`}
                  >
                    <User className="w-3 h-3 text-emerald-600" />
                    <span>{user}</span>
                    {user.toLowerCase() === currentUserId?.toLowerCase() && (
                      <span className="text-[10px] text-emerald-600 font-normal">(Current)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-start gap-2 text-stone-400 text-[11px] leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Your entries are stored locally on your device. You can return anytime using this same name.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
