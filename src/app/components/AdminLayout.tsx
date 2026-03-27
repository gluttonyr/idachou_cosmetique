import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  ShoppingBag,
  LogOut,
  Sparkles,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  {
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    to: '/admin/dashboard',
    exact: true,
  },
  {
    label: 'Produits',
    icon: Package,
    to: '/admin/products',
  },
  {
    label: 'Commandes',
    icon: ShoppingBag,
    to: '/admin/orders',
  },
];

export const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen flex bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="relative flex flex-col bg-white shadow-xl transition-all duration-300 ease-in-out"
        style={{
          width: collapsed ? '72px' : '240px',
          minHeight: '100vh',
          borderRight: '1px solid #f0e6ef',
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-3 px-4 py-5"
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
            minHeight: '72px',
          }}
        >
          
          {!collapsed && (
            <span
              className="text-white font-bold text-sm leading-tight overflow-hidden whitespace-nowrap"
              style={{ letterSpacing: '0.01em' }}
            >
              IDACHOU<br />
              <span className="font-normal opacity-80 text-xs">PERLAGE GLOSS</span>
            </span>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 z-10 w-6 h-6 bg-white border border-pink-200 rounded-full flex items-center justify-center shadow-md hover:bg-pink-50 transition-colors"
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3 text-pink-500" />
            : <ChevronLeft className="w-3 h-3 text-pink-500" />
          }
        </button>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-3">
              Menu
            </p>
          )}
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group"
                style={{
                  background: active
                    ? 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 100%)'
                    : 'transparent',
                  color: active ? '#db2777' : '#6b7280',
                  fontWeight: active ? '600' : '400',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = '#fdf2f8';
                    (e.currentTarget as HTMLElement).style.color = '#ec4899';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#6b7280';
                  }
                }}
              >
                <item.icon
                  className="flex-shrink-0 w-5 h-5"
                  style={{ color: active ? '#db2777' : 'inherit' }}
                />
                {!collapsed && (
                  <span className="text-sm whitespace-nowrap overflow-hidden">{item.label}</span>
                )}
                {active && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ✅ Logout — épinglé tout en bas */}
        <div className="px-2 pb-4 pt-2 border-t border-gray-100">
          <button
            onClick={handleLogout}
            title={collapsed ? 'Déconnexion' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-150"
          >
            <LogOut className="flex-shrink-0 w-5 h-5" />
            {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="bg-white shadow-sm px-6 flex items-center justify-between"
          style={{ minHeight: '72px', borderBottom: '1px solid #f0e6ef' }}
        >
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              {navItems.find(isActive)?.label ?? 'Administration'}
            </h1>
            <p className="text-xs text-gray-400">IDACHOU PERLAGE GLOSS</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)' }}
            >
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};