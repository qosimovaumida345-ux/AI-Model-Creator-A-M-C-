import { Link } from 'react-router-dom';
import { Github, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-forge-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <svg viewBox="0 0 40 40" className="w-8 h-8">
                <defs>
                  <linearGradient id="fLogo" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00D4FF" />
                    <stop offset="100%" stopColor="#9D4EDD" />
                  </linearGradient>
                </defs>
                <rect width="40" height="40" rx="10" fill="#0A0A0F" stroke="url(#fLogo)" strokeWidth="1.5" />
                <path d="M10 20L20 10L30 20L20 30Z" fill="url(#fLogo)" opacity="0.9" />
                <circle cx="20" cy="20" r="3.5" fill="#000" />
              </svg>
              <span className="text-lg font-bold gradient-text">AI Model Forge</span>
            </Link>
            <p className="text-forge-muted text-sm max-w-md leading-relaxed">
              Build, fine-tune, and deploy 500+ AI models. Run locally or in the cloud.
              The open platform for AI model creation and experimentation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-forge-muted">
              <li><Link to="/gallery" className="hover:text-forge-blue transition-colors">Browse Models</Link></li>
              <li><Link to="/my-models" className="hover:text-forge-blue transition-colors">My Models</Link></li>
              <li><Link to="/gallery" className="hover:text-forge-blue transition-colors">Model Forge</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-white mb-4">Community</h4>
            <div className="flex gap-3">
              <a href="#" className="p-2 glass rounded-lg hover:bg-white/[0.08] transition-all" aria-label="GitHub">
                <Github className="w-5 h-5 text-forge-muted hover:text-white" />
              </a>
              <a href="#" className="p-2 glass rounded-lg hover:bg-white/[0.08] transition-all" aria-label="Twitter">
                <Twitter className="w-5 h-5 text-forge-muted hover:text-white" />
              </a>
              <a href="#" className="p-2 glass rounded-lg hover:bg-white/[0.08] transition-all" aria-label="Discord">
                <MessageCircle className="w-5 h-5 text-forge-muted hover:text-white" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.06] mt-8 pt-8 text-center text-xs text-forge-muted">
          AI Model Forge — Open Platform for AI Models
        </div>
      </div>
    </footer>
  );
}