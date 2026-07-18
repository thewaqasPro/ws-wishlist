import React, { useState, useEffect } from 'react';
import {
  Heart, Menu, X, Lock, TrendingUp, CheckCircle2, Flame, Users,
  BarChart3, Paintbrush, ShoppingBag, RefreshCw, Lightbulb, Zap,
  UserCircle, Grid, LayoutTemplate, Sidebar, Palette, LineChart,
  Store, Search, Brush, Bookmark, Info, Trophy, DollarSign,
  Calendar, HelpCircle
} from 'lucide-react';

const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    body {
      font-family: 'Inter', system-ui, sans-serif;
      color: #334155;
      background-color: #F8FAFC;
    }
    .gradient-bg {
      background: linear-gradient(135deg, #EFF6FF 0%, #ECFDF5 100%);
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.8s ease-out forwards;
      opacity: 0;
    }
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(20px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `}} />
);

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-b border-gray-100"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Heart className="fill-emerald-500 text-emerald-500 w-8 h-8" />
            <span className="font-bold text-xl text-slate-900 tracking-tight">WS Wishlist</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-500 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-emerald-500 transition-colors">How it works</a>
            <a href="#analytics" className="text-sm font-medium text-gray-600 hover:text-emerald-500 transition-colors">Analytics</a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-emerald-500 transition-colors">Pricing</a>
            <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-emerald-500 transition-colors">FAQ</a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors">Contact support</a>
            <a href="#" className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-sm shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5">
              Install on Shopify
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-slate-900 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <a href="#features" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md">Features</a>
            <a href="#how-it-works" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md">How it works</a>
            <a href="#analytics" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md">Analytics</a>
            <a href="#pricing" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md">Pricing</a>
            <a href="#faq" onClick={closeMobileMenu} className="block px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-50 rounded-md">FAQ</a>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
              <a href="#contact" onClick={closeMobileMenu} className="block text-center px-3 py-2 text-base font-medium text-gray-600 border border-gray-200 rounded-md">Contact support</a>
              <a href="#" onClick={closeMobileMenu} className="block text-center px-3 py-2 text-base font-medium text-white bg-emerald-500 rounded-md">Install on Shopify</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const Hero = () => {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden gradient-bg">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Turn product interest into <br className="hidden sm:block"/> <span className="text-emerald-500">saved wishlists</span>
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Give shoppers a fast, customizable way to save products for later while gaining insights into the products they want most.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <a href="#" className="w-full sm:w-auto px-8 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-1">
            Install on Shopify
          </a>
          <a href="#how-it-works" className="w-full sm:w-auto px-8 py-3.5 border border-gray-300 text-base font-medium rounded-full text-slate-900 bg-white hover:bg-gray-50 transition-all shadow-sm">
            See how it works
          </a>
        </div>

        <p className="mt-6 text-sm text-gray-500 font-medium animate-fade-in-up flex items-center justify-center gap-2" style={{ animationDelay: '0.4s' }}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Built for Shopify storefronts. No external customer account required.
        </p>

        {/* Complex Mockup Assembly */}
        <div className="mt-16 relative max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="relative rounded-xl shadow-2xl bg-white border border-gray-200 overflow-hidden z-10 mx-auto w-full md:w-11/12 aspect-[16/9] flex flex-col text-left">
            {/* Browser Header */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="mx-auto bg-white rounded-md text-xs text-gray-400 px-4 py-1 flex items-center gap-2 w-1/2 justify-center border border-gray-200">
                <Lock className="w-3 h-3 text-gray-400" /> admin.shopify.com/store/wswishlist
              </div>
            </div>
            {/* Dashboard Content Mockup */}
            <div className="p-6 bg-gray-50 flex-1 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-900">Dashboard Overview</h3>
                <div className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-600">Last 30 Days</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Active Wishlists</div>
                  <div className="text-2xl font-bold text-slate-900">1,248</div>
                  <div className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12%</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Products Saved</div>
                  <div className="text-2xl font-bold text-slate-900">4,592</div>
                  <div className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +8%</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">Potential Value</div>
                  <div className="text-2xl font-bold text-slate-900">$142k</div>
                  <div className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +15%</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex-1">
                <div className="text-sm font-medium text-slate-900 mb-4">Top Saved Products</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-200 rounded"></div><div className="h-2 bg-gray-200 rounded w-1/3"></div><div className="ml-auto text-sm text-gray-500">342 saves</div></div>
                  <div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-200 rounded"></div><div className="h-2 bg-gray-200 rounded w-1/4"></div><div className="ml-auto text-sm text-gray-500">215 saves</div></div>
                  <div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-200 rounded"></div><div className="h-2 bg-gray-200 rounded w-2/5"></div><div className="ml-auto text-sm text-gray-500">189 saves</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute -right-4 md:-right-12 top-1/4 w-48 md:w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 transform rotate-3 hidden sm:block text-left">
            <div className="flex items-center gap-3 mb-2 border-b border-gray-100 pb-2">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-emerald-500"><Heart className="fill-emerald-500 w-4 h-4"/></div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Recent Wishlist</div>
                <div className="text-xs text-gray-500">Guest Shopper</div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <img src="https://placehold.co/40x40/f1f5f9/94a3b8?text=P1" alt="Product" className="rounded object-cover" />
              <img src="https://placehold.co/40x40/f1f5f9/94a3b8?text=P2" alt="Product" className="rounded object-cover" />
              <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded flex items-center justify-center text-xs text-gray-500">+3</div>
            </div>
          </div>

          <div className="absolute -left-4 md:-left-12 bottom-1/4 w-48 md:w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 transform -rotate-2 hidden sm:block text-left">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">High Intent</div>
            <div className="flex items-start gap-3">
              <img src="https://placehold.co/50x50/f8fafc/64748b?text=Shoe" alt="Trending Product" className="rounded-md" />
              <div>
                <div className="text-sm font-medium text-slate-900 line-clamp-1">Classic Leather Sneaker</div>
                <div className="text-xs text-emerald-500 flex items-center gap-1 mt-1"><Flame className="fill-emerald-500 w-3 h-3"/> Added 45 times today</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Benefits = () => {
  return (
    <section className="py-12 bg-white relative -mt-20 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center transform transition hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Guest & Customer Wishlists</h3>
            <p className="text-gray-600 text-sm">Save items instantly without logging in. Syncs smoothly when they do.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center transform transition hover:-translate-y-1">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Top Product Insights</h3>
            <p className="text-gray-600 text-sm">Discover what your shoppers truly desire and optimize your inventory.</p>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center transform transition hover:-translate-y-1">
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-4">
              <Paintbrush className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Easy Storefront Setup</h3>
            <p className="text-gray-600 text-sm">No coding required. Use Shopify app embeds to match your theme perfectly.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProblemSolution = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Help shoppers save now and buy when they are ready</h2>
          <p className="text-lg text-gray-600">
            Customers often leave without purchasing because they are comparing products, waiting for payday, or planning a future purchase. WS Wishlist lets them save products instantly and return later without interrupting their shopping experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center mb-4">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Reduce lost product interest</h3>
            <p className="text-gray-600">Stop relying entirely on immediate add-to-carts. Give hesitant buyers a clear action to take instead of bouncing.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Encourage repeat visits</h3>
            <p className="text-gray-600">A saved wishlist gives shoppers a concrete reason to return to your store when they are ready to complete the purchase.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-green-50 text-emerald-500 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">Understand shopper demand</h3>
            <p className="text-gray-600">Gain visibility into high-intent products before they are purchased, helping you manage stock and marketing efforts.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    { icon: <Zap className="w-5 h-5" />, title: "Instant wishlist actions", desc: "Products appear in the wishlist immediately while updates sync securely in the background." },
    { icon: <UserCircle className="w-5 h-5" />, title: "Guest & logged-in", desc: "Support shoppers before and after account login seamlessly." },
    { icon: <Grid className="w-5 h-5" />, title: "Product & collection", desc: "Add customizable wishlist hearts to product pages and product cards." },
    { icon: <LayoutTemplate className="w-5 h-5" />, title: "Header wishlist icon", desc: "Place a wishlist icon and item count inside the storefront header." },
    { icon: <Sidebar className="w-5 h-5" />, title: "Drawer and page", desc: "Let shoppers review, remove, share, or move saved products to the cart." },
    { icon: <Palette className="w-5 h-5" />, title: "Custom design controls", desc: "Adjust icon position, colors, text, appearance, and custom CSS." },
    { icon: <LineChart className="w-5 h-5" />, title: "Top product analytics", desc: "See the products shoppers add to wishlists most often." },
    { icon: <Store className="w-5 h-5" />, title: "Theme-friendly install", desc: "Use Shopify app embeds, theme blocks, automatic placement, or Liquid." },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-emerald-500 font-semibold tracking-wider uppercase text-sm mb-2 block">Powerful Features</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Everything you need for a perfect wishlist</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {features.map((feature, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -inset-2 bg-gray-50 rounded-xl opacity-0 group-hover:opacity-100 transition duration-200 -z-10"></div>
              <div className="w-10 h-10 bg-slate-50 border border-gray-200 text-slate-800 rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[100px] opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Up and running in minutes</h2>
          <p className="text-lg text-gray-300">Simple setup designed for modern Shopify themes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="hidden md:block absolute top-10 left-[60%] w-full border-t-2 border-dashed border-gray-700"></div>
            <div className="w-20 h-20 bg-slate-800 border-2 border-emerald-500 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-500 mb-6 relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              1
            </div>
            <h3 className="text-xl font-semibold mb-3">Enable the app</h3>
            <p className="text-gray-400">Turn on the WS Wishlist app embed directly from your Shopify theme editor.</p>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="hidden md:block absolute top-10 left-[60%] w-full border-t-2 border-dashed border-gray-700"></div>
            <div className="w-20 h-20 bg-slate-800 border-2 border-emerald-500 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-500 mb-6 relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              2
            </div>
            <h3 className="text-xl font-semibold mb-3">Match your brand</h3>
            <p className="text-gray-400">Customize the heart icon, position, colors, display text, and layout to fit your store.</p>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-800 border-2 border-emerald-500 rounded-full flex items-center justify-center text-2xl font-bold text-emerald-500 mb-6 relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              3
            </div>
            <h3 className="text-xl font-semibold mb-3">Track shopper interest</h3>
            <p className="text-gray-400">Review recent wishlists and identify the products shoppers save most often.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const StorefrontExperience = () => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Part 1: Storefront Experience */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">A fast, shopper-friendly wishlist experience</h2>
            <ul className="space-y-4 mb-8">
              {[
                "Immediate visual feedback: Hearts fill instantly on click.",
                "No page reload required: Keeps shoppers in the flow.",
                "Works for guest shoppers: Removes friction to saving items.",
                "Add saved items directly to cart: From drawer or dedicated page.",
                "Mobile-friendly interface: Designed for touch screens first."
              ].map((item, idx) => {
                const [bold, normal] = item.split(': ');
                return (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700"><strong>{bold}:</strong> {normal}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Visual Product Grid Mockup */}
          <div className="lg:w-1/2 w-full relative">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg relative">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                <div className="text-lg font-bold font-serif">STORE</div>
                <div className="flex items-center gap-4 text-xl">
                  <Search className="w-5 h-5" />
                  <div className="relative cursor-pointer">
                    <Heart className="w-6 h-6 text-emerald-600" />
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
                  </div>
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm relative group">
                  <div className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center cursor-pointer shadow-sm text-emerald-500 transition-transform hover:scale-110">
                    <Heart className="w-4 h-4 fill-emerald-500" />
                  </div>
                  <div className="aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                    <img src="https://placehold.co/200x200/e2e8f0/64748b?text=Shirt" alt="Product" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm font-medium text-slate-900">Linen Shirt</div>
                  <div className="text-sm text-gray-500">$45.00</div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-100 shadow-sm relative group">
                  <div className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center cursor-pointer shadow-sm text-gray-400 hover:text-emerald-500 transition-transform hover:scale-110">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="aspect-square bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                    <img src="https://placehold.co/200x200/e2e8f0/64748b?text=Pants" alt="Product" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-sm font-medium text-slate-900">Chino Pants</div>
                  <div className="text-sm text-gray-500">$60.00</div>
                </div>
              </div>

              {/* Drawer Mock Overlay */}
              <div className="absolute top-0 right-0 w-2/3 h-full bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] rounded-r-2xl border-l border-gray-200 flex flex-col p-4 transform translate-x-4 opacity-90">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-slate-900">My Wishlist (3)</h4>
                  <X className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex gap-3 mb-4 items-center border-b border-gray-100 pb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                    <img src="https://placehold.co/60x60/e2e8f0/64748b?text=Shirt" alt="Product" className="w-full h-full object-cover rounded" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">Linen Shirt</div>
                    <div className="text-xs text-gray-500">$45.00</div>
                  </div>
                  <button className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-medium">Add</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Part 2: Customization */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16 pt-16 border-t border-gray-100">
          <div className="lg:w-1/2 w-full">
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-6">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <Brush className="w-5 h-5 text-slate-900" />
                <h3 className="font-semibold text-slate-900">Button Customization</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Icon Style</label>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 border-2 border-emerald-500 bg-emerald-500/10 rounded flex items-center justify-center text-emerald-500 cursor-pointer"><Heart className="w-5 h-5 fill-emerald-500"/></div>
                    <div className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center text-gray-600 cursor-pointer"><Heart className="w-5 h-5"/></div>
                    <div className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center text-gray-600 cursor-pointer"><Bookmark className="w-5 h-5"/></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Active Color</label>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full ring-2 ring-offset-2 ring-emerald-500 cursor-pointer"></div>
                    <div className="w-8 h-8 bg-red-500 rounded-full cursor-pointer"></div>
                    <div className="w-8 h-8 bg-slate-900 rounded-full cursor-pointer"></div>
                    <div className="w-8 h-8 bg-black rounded-full cursor-pointer"></div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Collection Page Placement</label>
                  <select className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    <option>Top Right Corner</option>
                    <option>Top Left Corner</option>
                    <option>Below Product Title</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3 text-gray-500" /> The icon always remains safely positioned inside the product image area.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Designed to fit your storefront</h2>
            <p className="text-lg text-gray-600 mb-8">
              Your wishlist should look like it belongs to your brand, not an invasive third-party widget. Take full control over how and where wishlist buttons appear.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Heart icon styles", "Horizontal/vertical placement",
                "Colors and button text", "Header placement",
                "Theme app blocks", "Custom CSS support"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Analytics = () => {
  return (
    <section id="analytics" className="py-24 bg-slate-50 border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">See what your shoppers want</h2>
          <p className="text-lg text-gray-600">
            Review recent wishlists, saved product values, and the products receiving the most interest to make data-driven inventory and marketing decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            {[
              { icon: <Trophy className="w-6 h-6" />, color: "text-indigo-600", bg: "bg-indigo-50", title: "Top 10 saved products", desc: "Know your most desired items" },
              { icon: <Users className="w-6 h-6" />, color: "text-emerald-600", bg: "bg-emerald-50", title: "Recent shopper wishlists", desc: "View individual customer intent" },
              { icon: <DollarSign className="w-6 h-6" />, color: "text-blue-600", bg: "bg-blue-50", title: "Wishlist value overview", desc: "Track potential revenue stored" },
              { icon: <Calendar className="w-6 h-6" />, color: "text-purple-600", bg: "bg-purple-50", title: "Performance metrics", desc: "Compare all-time vs recent data" }
            ].map((card, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{card.title}</h4>
                  <p className="text-xs text-gray-500">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Analytics Mockup */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">Analytics Dashboard</h3>
              <div className="text-sm bg-white border border-gray-300 px-3 py-1 rounded shadow-sm text-gray-600">Export CSV</div>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Top Wishlist Products</h4>
                <div className="border border-gray-100 rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[400px]">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3 text-right">Times Saved</th>
                        <th className="px-4 py-3 text-right">Potential Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { name: "Minimalist Watch", saves: 142, value: "$18,460" },
                        { name: "Leather Tote Bag", saves: 98, value: "$12,250" },
                        { name: "Ceramic Mug Set", saves: 76, value: "$2,660" }
                      ].map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0"></div>
                            <span className="text-slate-900 font-medium whitespace-nowrap">{row.name}</span>
                          </td>
                          <td className="px-4 py-3 text-right">{row.saves}</td>
                          <td className="px-4 py-3 text-right text-gray-500">{row.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-gray-600">Start for free, upgrade when you need more capacity. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Free Forever</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-extrabold text-slate-900">$0</span>
              <span className="text-gray-500 font-medium">/month</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                "Up to 1,000 active wishlists per month",
                "Product and collection wishlist buttons",
                "Wishlist drawer and dedicated page",
                "Header wishlist icon",
                "Custom styling and CSS",
                "Top product analytics"
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <a href="#" className="block w-full text-center px-6 py-3 border-2 border-emerald-500 text-emerald-500 font-semibold rounded-full hover:bg-emerald-500 hover:text-white transition-colors">
              Start free
            </a>
          </div>

          {/* Growth Plan */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col relative transform md:-translate-y-4 mt-8 md:mt-0">
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-emerald-500 text-white px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide">
              Most Popular
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Growth</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-extrabold text-white">$9.99</span>
              <span className="text-gray-400 font-medium">/month</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                <span key="1"><strong className="text-white">Unlimited</strong> active wishlists</span>,
                <span key="2">Everything in Free Forever</span>,
                <span key="3">Higher-volume synchronization</span>,
                <span key="4">Priority email support</span>
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <a href="#" className="block w-full text-center px-6 py-3 bg-emerald-500 text-white font-semibold rounded-full hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
              Choose Growth
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">No additional usage charges. Cancel anytime.</p>
      </div>
    </section>
  );
};

const FAQ = () => {
  const faqs = [
    { q: "Does the app support guest shoppers?", a: "Yes. Shoppers can save products without signing in, removing barriers to using the wishlist." },
    { q: "Will guest wishlists remain after login?", a: "The app can associate and synchronize saved products automatically when the shopper signs into their customer account." },
    { q: "Does it work with every Shopify theme?", a: "The app supports theme app embeds, app blocks, automatic placement, and a manual Liquid snippet. Some theme-specific styling may require custom CSS, which is supported." },
    { q: "Can merchants customize the wishlist design?", a: "Yes. Merchants can adjust icon styles, position, colors, text, and add custom CSS to ensure it perfectly matches their brand." },
    { q: "Does the app slow down wishlist actions?", a: "Wishlist actions update locally first in the browser for immediate visual feedback to the shopper, and synchronize with the server in the background." },
    { q: "Is there a free plan?", a: "Yes. A Free Forever plan is available for stores with up to 1,000 active wishlists per month." },
    { q: "Does the app collect customer contact information?", a: "No. The app does not require or collect customer names, email addresses, phone numbers, or physical addresses for standard wishlist functionality." }
  ];

  return (
    <section id="faq" className="py-24 bg-gray-50 border-t border-gray-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                {faq.q}
              </h3>
              <p className="text-gray-600 ml-7">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-[#0F172A] z-0"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Start turning shopper interest into future purchases</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Add a fast, customizable wishlist to your Shopify store in minutes. Join merchants who are already capturing lost intent.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a href="#" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-full text-slate-900 bg-white hover:bg-gray-50 transition-colors shadow-lg">
              Install WS Wishlist
            </a>
            <a href="#contact" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold rounded-full text-white border border-gray-600 hover:border-gray-400 hover:bg-white/5 transition-colors">
              Contact support
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="fill-emerald-500 text-emerald-500 w-6 h-6" />
                <span className="font-bold text-lg text-slate-900">WS Wishlist</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                The fast, customizable wishlist app built exclusively for modern Shopify storefronts.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-gray-600 hover:text-emerald-500 transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-gray-600 hover:text-emerald-500 transition-colors">Pricing</a></li>
                <li><a href="#faq" className="text-sm text-gray-600 hover:text-emerald-500 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-500 transition-colors">Help center</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-500 transition-colors">Installation guide</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-500 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-500 transition-colors">Privacy policy</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-emerald-500 transition-colors">Terms of service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} WS Wishlist. All rights reserved.
            </p>
            <div className="text-xs text-gray-400">
              Not affiliated with Shopify Inc.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default function App() {
  return (
    <div className="antialiased overflow-x-hidden min-h-screen">
      <GlobalStyles />
      <Header />
      <main className="pt-20">
        <Hero />
        <Benefits />
        <ProblemSolution />
        <Features />
        <HowItWorks />
        <StorefrontExperience />
        <Analytics />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
