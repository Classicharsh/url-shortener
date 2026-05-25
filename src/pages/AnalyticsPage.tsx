import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { ArrowLeft, MousePointerClick, Globe, Smartphone, Monitor, Tablet, TrendingUp, Calendar } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useLinksStore } from '@/store/linksStore';
import { useAuthStore } from '@/store/authStore';
import { getLinkAnalytics } from '@/lib/firestore';
import type { LinkAnalytics } from '@/types';
import { buildShortUrl, formatCount } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DEVICE_COLORS = { mobile: '#0ea5e9', desktop: '#8b5cf6', tablet: '#10b981' };
const CHART_COLORS  = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded skeleton" />
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-16 skeleton" />
            <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-12 skeleton" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-800 rounded skeleton" />
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 skeleton" />
        </div>
        <div className="h-60 bg-gray-200 dark:bg-gray-800 rounded w-full skeleton" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="card p-6 space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 skeleton" />
            <div className="h-40 bg-gray-200 dark:bg-gray-800 rounded w-full skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { linkId }     = useParams<{ linkId: string }>();
  const { links }      = useLinksStore();
  const { user }       = useAuthStore();
  const navigate       = useNavigate();

  const link           = links.find((l) => l.id === linkId);
  const [data,    setData]    = useState<LinkAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days,    setDays]    = useState(30);

  useEffect(() => {
    if (!linkId) return;
    setLoading(true);
    getLinkAnalytics(linkId, days)
      .then(setData)
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [linkId, days]);

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p className="font-semibold mb-2">Link not found</p>
          <Link to="/dashboard" className="btn-primary text-sm">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const shortUrl = buildShortUrl(link.slug);

  // Device icon helper
  const DeviceIcon = ({ device }: { device: string }) => {
    if (device === 'mobile')  return <Smartphone className="w-4 h-4" />;
    if (device === 'tablet')  return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="btn-ghost w-9 h-9 p-0 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-2xl truncate">
              Analytics — <span className="text-brand-500">{link.slug}</span>
            </h1>
            <p className="text-sm mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">
                {shortUrl}
              </a>
              {' → '}
              <a href={link.originalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">
                {link.originalUrl.slice(0, 60)}…
              </a>
            </p>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-1 glass rounded-xl p-1 shrink-0">
            {[7, 30, 90].map((d) => (
              <button
                key={d} onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  days === d
                    ? 'bg-brand-500 text-white shadow'
                    : 'hover:bg-brand-500/10'
                }`}
                style={{ color: days === d ? undefined : 'var(--text-muted)' }}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <AnalyticsSkeleton />
        ) : data ? (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Clicks', value: formatCount(data.totalClicks), icon: MousePointerClick, color: 'text-brand-500' },
                { label: 'Countries',    value: data.topCountries.length,       icon: Globe,             color: 'text-accent-500' },
                { label: 'Devices',      value: data.deviceBreakdown.length,    icon: Monitor,           color: 'text-green-500' },
                { label: 'Created',      value: format(link.createdAt, 'MMM d'), icon: Calendar,         color: 'text-amber-500' },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="card p-5">
                  <div className={`${s.color} mb-2`}><s.icon className="w-5 h-5" /></div>
                  <p className="font-display font-bold text-3xl">{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Clicks over time chart */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-brand-500" />
                <h2 className="font-semibold">Clicks over time</h2>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data.clicksOverTime} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    tickFormatter={(v) => format(new Date(v + 'T12:00:00'), 'MMM d')} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }}
                    labelFormatter={(v) => format(new Date(String(v) + 'T12:00:00'), 'MMMM d, yyyy')}
                  />
                  <Area type="monotone" dataKey="clicks" stroke="#0ea5e9" fill="url(#colorClicks)" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#0ea5e9' }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Device + Countries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Device breakdown */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
                <h2 className="font-semibold mb-5">Device breakdown</h2>
                {data.deviceBreakdown.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={data.deviceBreakdown} cx="50%" cy="50%" outerRadius={65} dataKey="count" nameKey="device">
                          {data.deviceBreakdown.map((entry, i) => (
                            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: 'var(--text-muted)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-3">
                      {data.deviceBreakdown.map((d) => (
                        <div key={d.device} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 capitalize" style={{ color: 'var(--text-muted)' }}>
                            <DeviceIcon device={d.device} /> {d.device}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                              <div className="h-full rounded-full bg-brand-500" style={{ width: `${d.percentage}%` }} />
                            </div>
                            <span className="font-medium w-8 text-right">{d.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No click data yet</p>
                )}
              </motion.div>

              {/* Top countries */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card p-6">
                <h2 className="font-semibold mb-5">Top countries</h2>
                {data.topCountries.length > 0 ? (
                  <div className="space-y-3">
                    {data.topCountries.slice(0, 8).map((c, i) => {
                      const pct = data.totalClicks > 0 ? Math.round((c.count / data.totalClicks) * 100) : 0;
                      return (
                        <div key={c.country} className="flex items-center gap-3 text-sm">
                          <span className="text-xs font-medium w-5 text-right" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Globe className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                            <span className="truncate">{c.country || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            </div>
                            <span className="font-medium w-6 text-right" style={{ color: 'var(--text-muted)' }}>{c.count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm py-8 text-center" style={{ color: 'var(--text-muted)' }}>No location data yet</p>
                )}
              </motion.div>
            </div>

            {/* Recent clicks table */}
            {data.recentClicks.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card p-6">
                <h2 className="font-semibold mb-4">Recent clicks</h2>
                <div className="overflow-x-auto -mx-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ color: 'var(--text-muted)' }}>
                        <th className="text-left pb-3 px-2 font-medium text-xs uppercase tracking-wider">Time</th>
                        <th className="text-left pb-3 px-2 font-medium text-xs uppercase tracking-wider">Device</th>
                        <th className="text-left pb-3 px-2 font-medium text-xs uppercase tracking-wider">Browser</th>
                        <th className="text-left pb-3 px-2 font-medium text-xs uppercase tracking-wider">Country</th>
                        <th className="text-left pb-3 px-2 font-medium text-xs uppercase tracking-wider">Referrer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentClicks.map((click) => (
                        <tr key={click.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                          <td className="py-2.5 px-2" style={{ color: 'var(--text-muted)' }}>
                            {format(click.timestamp, 'MMM d, HH:mm')}
                          </td>
                          <td className="py-2.5 px-2 capitalize">{click.device || '—'}</td>
                          <td className="py-2.5 px-2">{click.browser || '—'}</td>
                          <td className="py-2.5 px-2">{click.country || '—'}</td>
                          <td className="py-2.5 px-2 max-w-[140px] truncate" style={{ color: 'var(--text-muted)' }}>
                            {click.referrer === 'direct' ? 'Direct' : click.referrer || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
