import { Link } from 'react-router-dom';
import { useState } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-amazon-dark text-white">
      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className="w-full bg-amazon-dark-hover py-4 text-center text-sm font-medium hover:bg-amazon-dark-hover transition-colors"
      >
        Back to top
      </button>

      {/* Main footer links */}
      <div className="px-8 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Get to Know Us */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Get to Know Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-300 hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-300 hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/press" className="text-gray-300 hover:underline">
                  Press Releases
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:underline">
                  Nexus Hub Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Connect with Us */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Connect with Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:underline">
                  Instagram
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:underline">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Make Money with Us */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Make Money with Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/vendor/register" className="text-gray-300 hover:underline">
                  Sell on Nexus Hub
                </Link>
              </li>
              <li>
                <Link to="/vendor/protection" className="text-gray-300 hover:underline">
                  Protect and Build Your Brand
                </Link>
              </li>
              <li>
                <Link to="/affiliate" className="text-gray-300 hover:underline">
                  Affiliate Program
                </Link>
              </li>
              <li>
                <Link to="/advertise" className="text-gray-300 hover:underline">
                  Advertise Your Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Let Us Help You */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Let Us Help You</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/orders" className="text-gray-300 hover:underline">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:underline">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-300 hover:underline">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:underline">
                  Shipping Rates & Policies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-amazon-dark-hover">
        <div className="px-8 py-8">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-sm text-gray-300 mb-4">
              Subscribe to our newsletter for personalized recommendations
            </p>
            {subscribed ? (
              <div className="text-amazon-green font-medium">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-amazon-blue"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-amazon-yellow hover:bg-yellow-500 text-black rounded-md text-sm font-bold transition-colors"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-amazon-dark-hover py-6 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <Link to="/" className="text-xl font-bold">
              <span className="text-white">nexus</span>
              <span className="text-amazon-yellow">hub</span>
            </Link>
            <p className="text-xs text-gray-400 mt-1">
              © {currentYear} Nexus Hub. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <Link to="/conditions" className="hover:text-white transition-colors">
              Conditions of Use
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Notice
            </Link>
            <Link to="/ads" className="hover:text-white transition-colors">
              Ads Privacy Choices
            </Link>
          </div>
        </div>
      </div>

      {/* Country info */}
      <div className="border-t border-amazon-dark-hover py-4 px-8 bg-amazon-dark">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-gray-400">
            Nigeria | Ghana | Kenya | South Africa | Egypt
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
