import { useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, BarChart2, QrCode, Shield, Globe, MousePointerClick,
  Clock, Link2, Check, ArrowRight, Sparkles
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import UrlShortenerForm from '@/components/dashboard/UrlShortenerForm';
import { useAuthStore } from '@/store/authStore';

const features = [
  { icon: Zap,             title: 'Instant Shortening',  desc: 'Paste a URL and get a short link in milliseconds. No friction, no waiting.' },
  { icon: BarChart2,       title: 'Rich Analytics',      desc: 'Track every click. See devices, locations, and traffic trends with beautiful charts.' },
  { icon: QrCode,          title: 'QR Code Generator',   desc: 'Every link automatically gets a downloadable QR code for offline sharing.' },
  { icon: Shield,          title: 'Secure & Private',    desc: 'Password-protect links. Auto-expire them. Your data stays yours.' },
  { icon: Globe,           title: 'Custom Slugs',        desc: 'Choose memorable names for your links instead of random characters.' },
  { icon: Clock,           title: 'Link Expiration',     desc: 'Set expiry dates for time-sensitive campaigns and promotions.' },
];

const pricingPlans = [
  {
    name: 'Free', price: '$0', period: '/forever',
    features: ['50 links/month', '30-day analytics', 'QR codes', 'Basic analytics'],
    cta: 'Get Started', highlight: false,
  },
  {
    name: 'Pro', price: '$9', period: '/month',
    features: ['Unlimited links', '1-year analytics', 'Custom slugs', 'Password protection', 'Priority support', 'API access'],
    cta: 'Start Free Trial', highlight: true,
  },
  {
    name: 'Team', price: '$29', period: '/month',
    features: ['Everything in Pro', 'Team members', 'Admin dashboard', 'Custom domain', 'SSO / SAML', 'SLA guarantee'],
    cta: 'Contact Sales', highlight: false,
  },
];

const stats = [
  { value: '2M+', label: 'Links Created' },
  { value: '50M+', label: 'Clicks Tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '180+', label: 'Countries' },
];

export default function LandingPage() {
  const { user } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const formRef   = useRef<HTMLDivElement>(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Handle hash scrolling on mount or when hash changes (e.g., from footer links)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen">
      <Navbar transparent />

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Mesh background */}
        <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark opacity-60 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(14,165,233,0.15),transparent)] pointer-events-none" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 glass border"
            style={{ borderColor: 'rgba(14,165,233,0.3)', color: 'var(--text)' }}>
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Introducing Snip 2.0 — Now with real-time analytics
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="font-display font-bold text-5xl sm:text-7xl leading-[1.05] mb-6">
            Short links.<br />
            <span className="gradient-text">Big impact.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: 'var(--text-muted)' }}>
            Create beautiful short URLs in seconds. Track clicks, generate QR codes,
            and understand your audience — all in one elegant dashboard.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            {user ? (
              <button onClick={() => navigate('/dashboard')} className="btn-primary px-8 py-3.5 text-base">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
                  Start for Free <ArrowRight className="w-4 h-4" />
                </Link>
                <button onClick={scrollToForm} className="btn-ghost px-8 py-3.5 text-base">
                  Try it now
                </button>
              </>
            )}
          </motion.div>

          {/* Inline form */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="max-w-xl mx-auto glass rounded-2xl p-6"
            style={{ border: '1px solid rgba(14,165,233,0.2)' }}>
            <UrlShortenerForm compact />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display font-bold text-3xl gradient-text">{s.value}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section id="features" className="py-24 px-4" style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">
              Everything you need
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
              Built for marketers, developers, and anyone who shares links professionally.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card p-6 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center mb-4 group-hover:shadow-glow-brand transition-all">
                  <f.icon className="w-5 h-5 text-brand-500" />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-4">Simple pricing</h2>
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>No surprises. Start free, scale when ready.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card p-6 relative ${plan.highlight ? 'border-brand-500/50 shadow-glow-brand' : ''}`}
                style={{ borderColor: plan.highlight ? '#0ea5e9' : undefined }}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="font-display font-bold text-4xl">{plan.price}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={plan.highlight ? 'btn-primary w-full' : 'btn-ghost w-full'}>
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────── */}
      <section className="py-20 px-4 relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(14,165,233,0.1),transparent)] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6">
            Ready to <span className="gradient-text">snip</span> your links?
          </h2>
          <p className="text-lg mb-10" style={{ color: 'var(--text-muted)' }}>
            Join thousands of creators and marketers shortening links with Snip.
          </p>
          <Link to="/register" className="btn-primary px-10 py-4 text-base shadow-glow-brand">
            <Zap className="w-5 h-5" fill="currentColor" />
            Get started for free
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
