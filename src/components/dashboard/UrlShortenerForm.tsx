import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Zap, Settings2, ChevronDown, ChevronUp, Copy, Check, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '@/store/authStore';
import { useLinksStore } from '@/store/linksStore';
import { validateUrl, validateSlug, buildShortUrl, copyToClipboard, linkRateLimiter } from '@/lib/utils';
import type { LinkFormData } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Props {
  onCreated?: () => void;
  compact?: boolean;
}

export default function UrlShortenerForm({ onCreated, compact }: Props) {
  const { user } = useAuthStore();
  const { addLink } = useLinksStore();

  const [url,         setUrl]         = useState('');
  const [slug,        setSlug]        = useState('');
  const [title,       setTitle]       = useState('');
  const [expiresAt,   setExpiresAt]   = useState('');
  const [password,    setPassword]    = useState('');
  const [advanced,    setAdvanced]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [urlError,    setUrlError]    = useState('');
  const [slugError,   setSlugError]   = useState('');
  const [shortUrl,    setShortUrl]    = useState('');
  const [copied,      setCopied]      = useState(false);
  const [showQr,      setShowQr]      = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError(''); setSlugError('');

    if (!user) {
      toast.error('Please sign in to create short links');
      return;
    }

    // Rate limiting
    if (!linkRateLimiter.canProceed()) {
      toast.error('Too many requests. Please wait a moment.');
      return;
    }

    // Validate URL
    const { valid: urlValid, url: normalizedUrl, error: urlErr } = validateUrl(url);
    if (!urlValid) { setUrlError(urlErr || 'Invalid URL'); return; }

    // Validate custom slug
    if (slug) {
      const { valid: slugValid, error: slugErr } = validateSlug(slug);
      if (!slugValid) { setSlugError(slugErr || 'Invalid slug'); return; }
    }

    const form: LinkFormData = {
      originalUrl: normalizedUrl,
      customSlug:  slug || undefined,
      title:       title || undefined,
      expiresAt:   expiresAt || undefined,
      password:    password || undefined,
    };

    setLoading(true);
    try {
      const link = await addLink(user.uid, form);
      const short = buildShortUrl(link.slug);
      setShortUrl(short);
      toast.success('✨ Short link created!');
      onCreated?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    const ok = await copyToClipboard(shortUrl);
    if (ok) {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setUrl(''); setSlug(''); setTitle(''); setExpiresAt('');
    setPassword(''); setShortUrl(''); setShowQr(false);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {shortUrl ? (
          /* ── Result state ── */
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-semibold text-sm">Link created!</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your short URL is ready</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 input-base font-mono text-brand-500 text-sm truncate py-2.5">
                {shortUrl}
              </div>
              <button onClick={handleCopy} className="btn-primary px-4">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button onClick={() => setShowQr(v => !v)} className="btn-ghost px-4" title="QR Code">
                <QrCode className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code */}
            <AnimatePresence>
              {showQr && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex justify-center pt-2">
                  <div className="p-4 bg-white rounded-xl inline-block">
                    <QRCodeSVG value={shortUrl} size={160} level="H"
                      imageSettings={{ src: '/favicon.svg', height: 24, width: 24, excavate: true }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={resetForm} className="btn-ghost w-full text-sm">
              ↩ Shorten another URL
            </button>
          </motion.div>
        ) : (
          /* ── Input state ── */
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-3">
            {/* Main URL input */}
            <div className="relative">
              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="url"
                value={url}
                onChange={e => { setUrl(e.target.value); setUrlError(''); }}
                placeholder="Paste your long URL here..."
                className="input-base pl-11 pr-4 text-sm"
                autoFocus={!compact}
              />
              {urlError && <p className="text-xs text-red-500 mt-1 pl-1">{urlError}</p>}
            </div>

            {/* Advanced options toggle */}
            <button
              type="button"
              onClick={() => setAdvanced(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-brand-500"
              style={{ color: 'var(--text-muted)' }}>
              <Settings2 className="w-3.5 h-3.5" />
              Advanced options
              {advanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Advanced fields */}
            <AnimatePresence>
              {advanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden">
                  {/* Custom slug */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                      Custom slug (optional)
                    </label>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                        {import.meta.env.VITE_APP_URL || window.location.origin}/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={e => { setSlug(e.target.value); setSlugError(''); }}
                        placeholder="my-link"
                        className="input-base py-2 text-sm flex-1 font-mono"
                      />
                    </div>
                    {slugError && <p className="text-xs text-red-500 mt-1 pl-1">{slugError}</p>}
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. My landing page"
                      className="input-base py-2 text-sm"
                    />
                  </div>

                  {/* Expiration date */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                      Expiration date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={e => setExpiresAt(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="input-base py-2 text-sm"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                      Password protection (optional)
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="input-base py-2 text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className="btn-primary w-full" disabled={loading || !url}>
              {loading ? <LoadingSpinner size="sm" /> : <Zap className="w-4 h-4" fill="currentColor" />}
              {loading ? 'Creating...' : 'Shorten URL'}
            </button>

            {!user && (
              <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                <Link to="/login" className="text-brand-500 hover:underline">Sign in</Link> to save and track your links
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
