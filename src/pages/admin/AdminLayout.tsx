import { ReactNode } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { Wrench, FileText, Package, FolderTree, Users, Inbox } from 'lucide-react';

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return <div className="text-center text-gray-400 py-12">Loading...</div>;
  }

  if (!user || !isAdmin) {
    // Only redirect AFTER loading is finished
    navigate('/', { replace: true });
    return null;
  }

  const tabs = [
    { to: '/admin', icon: Wrench, label: 'Tools' },
    { to: '/admin/articles', icon: FileText, label: 'Articles' },
    { to: '/admin/toolkits', icon: Package, label: 'Toolkits' },
    { to: '/admin/toolkittools', icon: Inbox, label: 'Toolkit Tools' },
    { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
    { to: '/admin/users', icon: Users, label: 'Users' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold">ADMIN</span>
          <h1 className="text-4xl font-bold text-white">Content Management</h1>
        </div>

        <div className="flex gap-2 border-b border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  isActive
                    ? 'border-purple-600 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
