import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/record', label: 'Harvest Records', icon: 'agriculture' },
  { to: '/admin/inventory', label: 'Inventory', icon: 'inventory_2' },
  { to: '/admin/sales', label: 'Sales & Expenses', icon: 'payments' },
  { to: '/admin/users', label: 'User Management', icon: 'group' },
  { to: '/admin/issues', label: 'Issue Tracker', icon: 'report_problem' },
  { to: '/admin/fruits', label: 'Fruits', icon: 'local_florist' },
  { to: '/admin/orchardBlocks', label: 'Orchard Blocks', icon: 'park' },
];

const pageTitles = {
  '/admin': 'Dashboard Overview',
  '/admin/record': 'Harvest Records',
  '/admin/inventory': 'Inventory Management',
  '/admin/sales': 'Sales & Expenses',
  '/admin/users': 'User Management',
  '/admin/issues': 'Issue Tracker',
  '/admin/fruits': 'Fruits Management',
  '/admin/orchardBlocks': 'Orchard Blocks Management',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="text-on-background min-h-screen" style={{
      background: 'linear-gradient(135deg, #f0f7ee 0%, #e8f5e3 25%, #f6f4ec 60%, #fdf8f0 100%)'
    }}>
      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col py-6 z-50"
        style={{
          background: 'linear-gradient(180deg, #173416 0%, #1e4a1d 40%, #245c23 80%, #2a6e28 100%)',
          boxShadow: '4px 0 32px rgba(23,52,22,0.18)'
        }}>
        <div className="px-6 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-white/20 text-white p-1.5 rounded-lg backdrop-blur-sm">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>park</span>
            </div>
            <h1 className="text-lg font-black text-white font-manrope">AgroNest</h1>
          </div>
          <p className="text-xs font-medium text-green-200/70 uppercase tracking-widest font-label ml-8">Fruit Farm Management</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center space-x-3 py-2.5 px-4 transition-all duration-200 font-manrope text-sm rounded-xl ` +
                (isActive
                  ? `bg-white/20 text-white font-bold backdrop-blur-sm shadow-inner`
                  : `text-green-100/80 hover:bg-white/10 hover:text-white`)
              }>
              <span className="material-symbols-outlined text-base">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-4 space-y-3">
          <button onClick={() => navigate('/admin/record')}
            className="w-full py-3 px-4 bg-white/20 text-white rounded-xl font-manrope text-sm font-bold flex items-center justify-center space-x-2 hover:bg-white/30 transition-all backdrop-blur-sm border border-white/10">
            <span className="material-symbols-outlined text-base">add</span>
            <span>New Record</span>
          </button>
          <button onClick={() => navigate('/login')}
            className="w-full flex items-center space-x-3 text-green-200/70 py-2.5 px-3 hover:bg-white/10 hover:text-white transition-colors rounded-xl font-manrope text-sm">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen pb-10 relative">
        {/* Subtle animated nature pattern overlay */}
        <div className="pointer-events-none fixed inset-0 ml-64 z-0 overflow-hidden" aria-hidden>
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-[0.035]">
            <defs>
              <pattern id="leaf-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="1.5" fill="#173416"/>
                <path d="M40 10 Q55 25 40 40 Q25 25 40 10Z" fill="#173416"/>
                <path d="M10 40 Q25 55 40 40 Q25 25 10 40Z" fill="#173416"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#leaf-grid)"/>
          </svg>
          {/* Large decorative blurred orbs */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
            style={{background:'radial-gradient(circle, #4ade80 0%, transparent 70%)'}} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
            style={{background:'radial-gradient(circle, #86efac 0%, transparent 70%)'}} />
          <div className="absolute top-1/2 right-10 w-64 h-64 rounded-full opacity-10"
            style={{background:'radial-gradient(circle, #fbbf24 0%, transparent 70%)'}} />
        </div>

        {/* Top Bar */}
        <header className="w-full top-0 sticky z-40 flex justify-between items-center px-8 py-4 border-b border-green-900/5"
          style={{background:'rgba(246,244,236,0.85)', backdropFilter:'blur(16px)'}}>
          <div>
            <h2 className="text-xl font-manrope font-bold text-[#173416]">{title}</h2>
            <p className="text-xs font-label uppercase tracking-wider text-stone-400">{today}</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-green-100 transition-colors text-stone-500">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 rounded-full hover:bg-green-100 transition-colors text-stone-500">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-outline-variant/20">
              <div className="text-right">
                <p className="text-sm font-bold font-manrope text-primary">Ruwan Jayasinghe</p>
                <p className="text-[10px] uppercase font-label tracking-tighter text-stone-400">Farm Director</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">RJ</div>
            </div>
          </div>
        </header>

        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
