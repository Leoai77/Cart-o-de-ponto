import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, History, User, LogOut, LayoutDashboard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return <Outlet />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user.role === 'employee' ? [
    { name: 'Ponto', path: '/', icon: Clock },
    { name: 'Histórico', path: '/history', icon: History },
    { name: 'Perfil', path: '/profile', icon: User },
  ] : [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Funcionários', path: '/employees', icon: Users },
    { name: 'Relatórios', path: '/reports', icon: History },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Clock className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">PontoSmart</span>
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-slate-900">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto p-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t pb-safe">
        <div className="max-w-md mx-auto flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center w-full py-3 gap-1",
                  isActive ? "text-indigo-600" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "fill-indigo-50")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
