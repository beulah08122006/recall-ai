import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from '../sidebar/Sidebar';
import { Menu, Sparkles, Brain } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { QuickAiEntryModal } from '../assistant/QuickAiEntryModal';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);
  const { user } = useAuth();

  // Keyboard shortcut: Ctrl+K or Cmd+K to open Quick AI Entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickEntryOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#E8E8D8] text-[#26332C] flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onQuickEntry={() => setQuickEntryOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#183C36] border-b border-[#224E47] text-white md:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-[#C4D5B0] hover:text-white hover:bg-[#204942] cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#526F52] flex items-center justify-center text-white">
                <Brain className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-white">Recall AI</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuickEntryOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#526F52] text-white text-xs font-semibold hover:bg-[#435B43] transition-colors cursor-pointer"
              title="Quick AI Entry (Ctrl+K)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C4D5B0]" />
              <span>Quick</span>
            </button>
            <Link
              to="/assistant"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#204942] text-white text-xs font-semibold hover:bg-[#2a5e55] transition-colors"
            >
              <span>Ask</span>
            </Link>
            {user && (
              <div className="w-7 h-7 rounded-full bg-[#526F52] text-white flex items-center justify-center text-xs font-bold uppercase">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Universal Quick AI Entry Modal */}
      <QuickAiEntryModal
        isOpen={quickEntryOpen}
        onClose={() => setQuickEntryOpen(false)}
      />
    </div>
  );
};


