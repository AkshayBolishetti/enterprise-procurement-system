import React from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, LogOut, User, Settings, LayoutDashboard, 
  Package, DollarSign, Bell
} from 'lucide-react';

export const SupplierLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/supplier/dashboard', icon: LayoutDashboard },
    { name: 'My Products', href: '/supplier/products', icon: Package },
    { name: 'Orders', href: '/supplier/orders', icon: Package },
    { name: 'Payments', href: '/supplier/payments', icon: DollarSign },
    { name: 'Notifications', href: '/supplier/notifications', icon: Bell },
  ];

  return (
    <div className="h-screen bg-[var(--background)] flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--card)] border-r border-[var(--input)] flex-shrink-0 flex flex-col hidden md:flex h-full z-20">
        <div className="h-20 flex items-center gap-3 px-8 border-b border-transparent">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[var(--foreground)]">Procure System</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[var(--primary)] text-white shadow-md' 
                    : 'text-[var(--secondary-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[var(--input)]">
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-[var(--muted)] capitalize">{user?.role?.toLowerCase() || 'supplier'}</p>
          </div>
          <Link
            to="/supplier/profile"
            className="flex items-center gap-4 px-4 py-3 rounded-full text-sm font-medium text-[var(--secondary-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] transition-all"
          >
            <Settings className="w-5 h-5" />
            Company Profile
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-full text-sm font-medium text-[var(--secondary-foreground)] hover:bg-[var(--error-bg)] hover:text-[var(--error)] transition-all mt-1"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">


        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 pt-4">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
