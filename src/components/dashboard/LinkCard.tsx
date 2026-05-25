import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Copy, Check, Trash2, ExternalLink, BarChart2,
  Clock, MousePointerClick, QrCode, Edit2, X, Save, Lock, AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import type { Link as LinkType } from '@/types';
import { buildShortUrl, copyToClipboard, truncateUrl, getDomain, isExpired, validateSlug } from '@/lib/utils';
import { useLinksStore } from '@/store/linksStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Props { link: LinkType; }

const LinkCard = memo(function LinkCard({ link }: Props) {
  const { removeLink, editLink } = useLinksStore();
  const [copied,    setCopied]    = useState(false);
  const [showQr,    setShowQr]    = useState(false);
  const [editing,   setEditing]   = useState(false);
  const [slugEdit,  setSlugEdit]  = useState(link.slug);
  const [titleEdit, setTitleEdit] = useState(link.title || '');
  const [deleting,  setDeleting]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const shortUrl = buildShortUrl(link.slug);
  const expired  = isExpired(link.expiresAt);

  const handleCopy = async () => {
    const ok = await copyToClipboard(shortUrl);
    if (ok) {
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await removeLink(link.id);
      toast.success('Link deleted');
    } catch {
      toast.error('Failed to delete');
      setDeleting(false);
      setConfirmDel(false);
    }
  };

  const handleSave = async () => {
    const { valid, error } = validateSlug(slugEdit);
    if (!valid) { toast.error(error || 'Invalid slug'); return; }
    setSaving(true);
    try {
      await editLink(link.id, { slug: slugEdit, title: titleEdit || undefined });
      toast.success('Link updated!');
      setEditing(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={`link-card ${expired ? 'opacity-60' : ''}`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              value={titleEdit}
              onChange={e => setTitleEdit(e.target.value)}
              placeholder="Add a title..."
              className="input-base py-1.5 text-sm mb-1"
            />
          ) : (
            <p className="font-medium text-sm truncate">
              {link.title || getDomain(link.originalUrl)}
            </p>
          )}
          <a
            href={link.originalUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 hover:text-brand-500 transition-colors truncate"
            style={{ color: 'var(--text-muted)' }}>
            {truncateUrl(link.originalUrl, 55)}
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {expired && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Expired
            </span>
          )}
          {link.password && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 flex items-center gap-1">
              <Lock className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {/* Short URL row */}
      <div className="flex items-center gap-2 mb-3">
        {editing ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
              {(() => {
                try {
                  return new URL(shortUrl).origin;
                } catch {
                  return window.location.origin;
                }
              })()}/
            </span>
            <input
              value={slugEdit}
              onChange={e => setSlugEdit(e.target.value)}
              className="input-base py-1.5 text-sm font-mono flex-1"
            />
          </div>
        ) : (
          <a
            href={shortUrl} target="_blank" rel="noopener noreferrer"
            className="font-mono text-sm text-brand-500 hover:text-brand-400 transition-colors flex-1 truncate">
            {shortUrl}
          </a>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="btn-primary px-2.5 py-1.5 text-xs rounded-lg">
                {saving ? <LoadingSpinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => { setEditing(false); setSlugEdit(link.slug); }} className="btn-ghost px-2.5 py-1.5 rounded-lg">
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button onClick={handleCopy} className="btn-ghost w-8 h-8 p-0 rounded-lg" title="Copy">
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setShowQr(v => !v)} className="btn-ghost w-8 h-8 p-0 rounded-lg" title="QR Code">
                <QrCode className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setEditing(true)} className="btn-ghost w-8 h-8 p-0 rounded-lg" title="Edit">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <Link to={`/dashboard/analytics/${link.id}`} className="btn-ghost w-8 h-8 p-0 rounded-lg flex items-center justify-center" title="Analytics">
                <BarChart2 className="w-3.5 h-3.5" />
              </Link>
              {confirmDel ? (
                <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-lg p-0.5 animate-fade-in shrink-0">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="text-red-500 hover:bg-red-500/20 w-7 h-7 flex items-center justify-center rounded"
                    title="Confirm Delete">
                    {deleting ? <LoadingSpinner size="sm" /> : <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setConfirmDel(false)}
                    className="text-gray-500 hover:bg-gray-500/20 w-7 h-7 flex items-center justify-center rounded"
                    title="Cancel">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDel(true)}
                  className="btn-ghost w-8 h-8 p-0 rounded-lg shrink-0"
                  title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* QR Code */}
      {showQr && (
        <motion.div
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="flex justify-center pt-3 border-t mb-3"
          style={{ borderColor: 'var(--border)' }}>
          <div className="p-3 bg-white rounded-xl">
            <QRCodeSVG value={shortUrl} size={120} level="H" />
          </div>
        </motion.div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <MousePointerClick className="w-3.5 h-3.5" />
          <strong style={{ color: 'var(--text)' }}>{link.totalClicks.toLocaleString()}</strong> clicks
        </span>
        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Clock className="w-3.5 h-3.5" />
          {formatDistanceToNow(link.createdAt, { addSuffix: true })}
        </span>
        {link.expiresAt && !expired && (
          <span className="flex items-center gap-1 text-xs text-amber-500">
            <AlertCircle className="w-3.5 h-3.5" />
            Expires {formatDistanceToNow(link.expiresAt, { addSuffix: true })}
          </span>
        )}
      </div>
    </motion.div>
  );
});

export default LinkCard;
