import { User, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { useState } from 'react';
import { AuthModal } from './AuthModal';

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-neutral-800 bg-gradient-to-br from-black via-neutral-900/60 to-neutral-800/90 text-neutral-300 flex items-center justify-end px-8 gap-4">
        {user ? (
          <>
            <div className="flex items-center gap-2 text-neutral-300">
              <User size={18} />
              <span className="text-sm">{user.email}</span>
              {isAdmin && (
                <span className="ml-2 text-xs bg-green-400 text-white px-2 py-1 rounded">
                  ADMIN
                </span>
              )}
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-300 hover:text-white transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-500/60 transition-colors font-medium"
          >
            Sign In
          </button>
        )}
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
