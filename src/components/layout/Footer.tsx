import { Link } from 'react-router-dom';
import { Zap, Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t py-12 px-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" fill="currentColor" />
              </div>
              <span className="font-display font-bold text-lg gradient-text">Snip</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Beautifully short URLs with powerful analytics.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><Link to="/#features" className="hover:text-brand-500 transition-colors">Features</Link></li>
              <li><Link to="/#pricing"  className="hover:text-brand-500 transition-colors">Pricing</Link></li>
              <li><Link to="/dashboard" className="hover:text-brand-500 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-500 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="btn-ghost w-9 h-9 p-0 rounded-lg" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="btn-ghost w-9 h-9 p-0 rounded-lg" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <p className="text-xs">© {new Date().getFullYear()} Snip. All rights reserved.</p>
          <p className="text-xs">Made with love by Harshit Prajapati</p>
        </div>
      </div>
    </footer>
  );
}
