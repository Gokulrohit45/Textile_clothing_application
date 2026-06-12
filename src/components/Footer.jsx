import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';
import { Instagram, Facebook, Twitter, Youtube } from './BrandIcons';
import { useSettings } from '../context/SettingsContext';

const Footer = () => {
  const { settings } = useSettings();

  const socialIcons = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    youtube: Youtube,
  };

  return (
    <footer className="bg-primary text-white mt-20">
      {/* Main Footer */}
      <div className="container-main py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.siteName} className="w-8 h-8 rounded-lg object-contain bg-white p-0.5" />
              ) : (
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                </div>
              )}
              <span className="font-display font-bold text-xl">{settings.siteName}</span>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-5">
              {settings.tagline}. Discover premium clothing for Men, Women, and Kids.
            </p>
            <div className="flex items-center gap-3">
              {Object.entries(settings.socialLinks).map(([platform, url]) => {
                const Icon = socialIcons[platform];
                return url && Icon ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-primary transition-all duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ) : null;
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-5 text-accent">
              Shop
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Men', to: '/category/men' },
                { label: 'Women', to: '/category/women' },
                { label: 'Kids', to: '/category/kids' },
                { label: 'New Arrivals', to: '/search?q=new' },
                { label: 'Sale', to: '/sale' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-neutral-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-5 text-accent">
              Help
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'My Account', to: '/profile' },
                { label: 'Track Order', to: '/orders' },
                { label: 'Wishlist', to: '/wishlist' },
                { label: 'Return Policy', to: '/policy/returns' },
                { label: 'Privacy Policy', to: '/policy/privacy' },
                { label: 'Terms & Conditions', to: '/policy/terms' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-neutral-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-5 text-accent">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-neutral-400 text-sm">{settings.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <a href={`tel:${settings.phone}`} className="text-neutral-400 text-sm hover:text-white transition-colors">
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="text-neutral-400 text-sm hover:text-white transition-colors">
                  {settings.email}
                </a>
              </li>
            </ul>

            {/* Payment Badges */}
            <div className="mt-6">
              <p className="text-xs text-neutral-500 mb-2">We Accept</p>
              <div className="flex gap-2 flex-wrap">
                {['GPay', 'UPI', 'COD'].map(m => (
                  <span key={m} className="px-2.5 py-1 bg-white/10 rounded-md text-xs text-neutral-300 font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-neutral-500 text-xs">
            © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/policy/privacy" className="text-neutral-500 text-xs hover:text-neutral-300 transition-colors">Privacy Policy</Link>
            <Link to="/policy/terms" className="text-neutral-500 text-xs hover:text-neutral-300 transition-colors">Terms</Link>
            <Link to="/policy/returns" className="text-neutral-500 text-xs hover:text-neutral-300 transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
