import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  Calendar,
  Settings,
  Search,
  Menu,
  X,
  History,
  Bookmark,
} from 'lucide-react';
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import AnimeDetailPage from '@/pages/AnimeDetailPage';
import WatchPage from '@/pages/WatchPage';
import SchedulePage from '@/pages/SchedulePage';
import HistoryPage from '@/pages/HistoryPage';
import SettingsPage from '@/pages/SettingsPage';
import BookmarksPage from '@/pages/BookmarksPage';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: TrendingUp, label: 'Trending', path: '/trending' },
  { icon: Search, label: 'Search', path: '/search' },
  { icon: Calendar, label: 'Schedule', path: '/schedule' },
  { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

function App() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isWatchPage = location.pathname.startsWith('/watch/');

  if (isWatchPage) {
    return (
      <div className="min-h-screen bg-[#030712]">
        <Routes>
          <Route path="/watch/:animeId/:episodeNumber" element={<WatchPage />} />
          <Route path="/watch/:animeId" element={<WatchPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-[#f8fafc] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[240px] flex-col fixed left-0 top-0 bottom-0 bg-[#030712] border-r border-[#1e293b] z-50">
        <div className="p-5 flex items-center gap-3">
          <img src="/logo-icon.png" alt="KiraCast" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold tracking-tight">
            Kira<span className="text-[#f43f5e]">Cast</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path === '/' && location.pathname === '/') ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0f172a] text-[#f43f5e] border-l-2 border-[#f43f5e]'
                    : 'text-[#94a3b8] hover:bg-[#0f172a] hover:text-[#f8fafc]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1e293b]">
          <div className="text-xs text-[#94a3b8] text-center">
            KiraCast v1.0
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <div
          className={`flex items-center justify-between px-4 py-3 transition-all duration-300 ${
            scrolled ? 'glass-dark border-b border-[#1e293b]' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="KiraCast" className="w-7 h-7 object-contain" />
            <span className="text-lg font-bold">
              Kira<span className="text-[#f43f5e]">Cast</span>
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-[#0f172a] text-[#f8fafc]"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="glass-dark border-b border-[#1e293b] px-4 pb-4 pt-2">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#0f172a] text-[#f43f5e]'
                        : 'text-[#94a3b8] hover:bg-[#0f172a] hover:text-[#f8fafc]'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-[240px] min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trending" element={<HomePage tab="trending" />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/anime/:id" element={<AnimeDetailPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
