import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Brain,
  Home,
  Handshake,
  Bell,
  Users,
  CheckSquare,
  Luggage,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickEntry?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onQuickEntry }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();


  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Memories', path: '/memories', icon: Brain },
    { label: 'Borrowed & Lent', path: '/borrowed', icon: Handshake },
    { label: 'Reminders', path: '/reminders', icon: Bell },
    { label: 'People', path: '/people', icon: Users },
    { label: 'Carry List', path: '/carry', icon: CheckSquare },
    { label: 'Before You Leave', path: '/before-you-leave', icon: Luggage },
    { label: 'AI Assistant', path: '/assistant', icon: Sparkles, badge: 'AI' },
    { label: 'Insights', path: '/insights', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#183C36]/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#183C36] border-r border-[#224E47] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full md:shadow-none'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#224E47]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#526F52] flex items-center justify-center text-white shadow-xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">Recall AI</h1>
              <p className="text-[11px] text-[#C4D5B0] font-medium leading-none mt-0.5">Your life, remembered.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#C4D5B0] hover:text-white md:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Button */}
        <div className="px-3 pt-3.5 pb-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onQuickEntry) onQuickEntry();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#526F52] hover:bg-[#435B43] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer border border-[#C4D5B0]/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C4D5B0]" />
            <span>✨ Quick AI Entry</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#526F52] text-white shadow-xs font-semibold'
                      : 'text-[#C4D5B0]/80 hover:bg-[#204942] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-[#C4D5B0] text-[#183C36]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        {user && (
          <div className="p-3 border-t border-[#224E47]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#13302B]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#526F52] text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-[#C4D5B0]/75 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md text-[#C4D5B0]/80 hover:text-[#D9534F] hover:bg-[#204942] transition-colors cursor-pointer shrink-0"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
