import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sun, Moon, LogOut, LayoutDashboard, Menu, X, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import toast from 'react-hot-toast';

interface Props { transparent?: boolean; }

export default function Navbar({ transparent }: Props) {
  const { user, logout }  = useAuthStore();
  const { resolved, setTheme } = useThemeStore();
  const navigate           = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const toggleTheme = () => setTheme(resolved === 'dark' ? 'light' : 'dark');

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${transparent ? '' : 'glass border-b'}`}
      style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow-brand group-hover:scale-110 transition-transform">
            <Zap className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span className="font-display font-bold text-xl gradient-text">Snip</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            className="btn-ghost w-9 h-9 p-0 rounded-lg"
            aria-label="Toggle theme">
            {resolved === 'dark'
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost gap-2 text-sm">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <div className="flex items-center gap-2 ml-1" key={user.uid}>
                {user.photoURL && !avatarError ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="w-8 h-8 rounded-full border"
                    style={{ borderColor: 'var(--border)' }}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <button onClick={handleLogout} className="btn-ghost gap-1.5 text-sm text-red-500 hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost text-sm">Log in</Link>
              <Link to="/register" className="btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden btn-ghost w-9 h-9 p-0 rounded-lg" onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t overflow-hidden"
            style={{ borderColor: 'var(--border)' }}>
            <div className="px-4 py-4 flex flex-col gap-2">
              <button onClick={toggleTheme} className="btn-ghost justify-start gap-2 text-sm">
                {resolved === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {resolved === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-ghost justify-start gap-2 text-sm" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn-ghost justify-start gap-2 text-sm text-red-500">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"    className="btn-ghost justify-start text-sm" onClick={() => setMobileOpen(false)}>Log in</Link>
                  <Link to="/register" className="btn-primary justify-start text-sm" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
