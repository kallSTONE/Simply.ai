import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, FileText, Package, Settings } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export function Sidebar() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/favorites', icon: Heart, label: 'Favorites' },
    { to: '/articles', icon: FileText, label: 'Articles' },
    { to: '/toolkits', icon: Package, label: 'Toolkits' },
  ];

  const adminLinks = [
    { to: '/admin', icon: Settings, label: 'Admin' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-r from-[#ff4de10e] via-fuchsia-500 to-[rgba(247, 1, 214, 0.6)] text-white shadow-lg rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-white font-bold text-xl">Simply.AI</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive?
                    'bg-gradient-to-r from-purple-500/60 via-fuchsia-500 to-indigo-600 text-white shadow-lg rounded-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}

        {isAdmin && (
          <div className="pt-6 mt-6 border-t border-gray-800">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-red-400 hover:bg-gray-800 hover:text-red-300'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{link.label}</span>
                  <span className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded">
                    ADMIN
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </aside>
  );
}
