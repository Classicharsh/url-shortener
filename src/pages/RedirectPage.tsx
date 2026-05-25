import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Lock, AlertCircle } from 'lucide-react';
import { getLinkBySlug, trackClick } from '@/lib/firestore';
import { isExpired } from '@/lib/utils';
import type { Link as LinkType } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function RedirectPage() {
  const { slug }   = useParams<{ slug: string }>();
  const navigate   = useNavigate();

  const [status,   setStatus]   = useState<'loading' | 'expired' | 'not-found' | 'password' | 'redirecting'>('loading');
  const [link,     setLink]     = useState<LinkType | null>(null);
  const [password, setPassword] = useState('');
  const [pwError,  setPwError]  = useState('');

  useEffect(() => {
    if (!slug) { navigate('/'); return; }
    resolve();
  }, [slug]);

  const resolve = async () => {
    const found = await getLinkBySlug(slug!);
    if (!found) { setStatus('not-found'); return; }
    if (!found.isActive) { setStatus('not-found'); return; }
    if (isExpired(found.expiresAt)) { setStatus('expired'); return; }

    setLink(found);

    if (found.password) {
      setStatus('password');
    } else {
      await doRedirect(found);
    }
  };

  const doRedirect = async (l: LinkType) => {
    setStatus('redirecting');
    // Fire analytics (non-blocking)
    trackClick(l).catch(console.error);
    // Small delay for UX, then redirect
    setTimeout(() => {
      window.location.href = l.originalUrl;
    }, 400);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link || !password) return;
    if (password === link.password) {
      setPwError('');
      await doRedirect(link);
    } else {
      setPwError('Incorrect password. Please try again.');
    }
  };

  // ── States ──────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)' }}>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow-brand">
          <Zap className="w-6 h-6 text-white" fill="currentColor" />
        </div>
        <LoadingSpinner size="md" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Resolving link…</p>
      </div>
    );
  }

  if (status === 'redirecting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)' }}>
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.4 }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow-brand">
          <Zap className="w-6 h-6 text-white" fill="currentColor" />
        </motion.div>
        <p className="font-semibold">Redirecting…</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Taking you to your destination
        </p>
      </div>
    );
  }

  if (status === 'not-found') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: 'var(--bg)' }}>
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="font-display font-bold text-2xl">Link not found</h1>
        <p className="text-sm text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
          This short link doesn't exist or has been removed.
        </p>
        <Link to="/" className="btn-primary text-sm">Go to Snip</Link>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: 'var(--bg)' }}>
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="font-display font-bold text-2xl">Link expired</h1>
        <p className="text-sm text-center max-w-sm" style={{ color: 'var(--text-muted)' }}>
          This link has passed its expiration date. Please contact the link owner for a new one.
        </p>
        <Link to="/" className="btn-primary text-sm">Go to Snip</Link>
      </div>
    );
  }

  if (status === 'password') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card p-8 w-full max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-5">
            <Lock className="w-6 h-6 text-brand-500" />
          </div>
          <h1 className="font-display font-bold text-xl mb-1">Password protected</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            This link requires a password to access.
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setPwError(''); }}
              placeholder="Enter password"
              className="input-base text-sm"
              autoFocus
            />
            {pwError && <p className="text-xs text-red-500 text-left">{pwError}</p>}
            <button type="submit" className="btn-primary w-full">
              <Zap className="w-4 h-4" fill="currentColor" />
              Unlock & Continue
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return null;
}
