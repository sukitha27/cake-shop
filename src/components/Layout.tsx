import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Cake, ShoppingCart, Menu, X, User as UserIcon, 
  Search, Sun, Moon, Loader2, Heart, FileText, 
  ShieldCheck, Facebook, Instagram, Twitter, ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  cartCount: number;
  isDark: boolean;
  toggleTheme: () => void;
  currency: 'LKR' | 'USD';
  setCurrency: (c: 'LKR' | 'USD') => void;
  handleLogin: () => void;
  isAdminUser: boolean;
  isAuthReady: boolean;
  onOpenCart: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children, user, cartCount, isDark, toggleTheme, 
  currency, setCurrency, handleLogin, isAdminUser, 
  isAuthReady, onOpenCart
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Order', path: '/order' },
    { name: 'Products', path: '/products' },
    { name: 'Locations', path: '/locations' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[98%] sm:w-[95%] max-w-[1300px]">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700 shadow-lg rounded-full px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between">
          {/* Left Group: Logo */}
          <div className="flex items-center flex-1">
            <Link 
              to="/"
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <img 
                  src="https://res.cloudinary.com/dilixdvlj/image/upload/f_auto,q_auto/Pink_and_Cream_Modern_Cute_Cake_and_Bakery_Logo_el0ocr" 
                  alt="Magnolia Bakers Logo" 
                  className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full border-2 border-primary/20 group-hover:border-primary/40 transition-all"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase hidden md:block font-display">
                Magnolia Bakers
              </h1>
            </Link>
          </div>

          {/* Center Group: Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 mx-4">
            {navItems.map((item) => (
              <Link 
                key={item.name}
                to={item.path}
                className={`text-sm font-bold px-4 py-1.5 rounded-full transition-all ${
                  location.pathname === item.path 
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' 
                    : 'hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Group: Actions */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 lg:gap-4 flex-1">
            {/* Currency Toggle */}
            <button
              onClick={() => setCurrency(currency === 'LKR' ? 'USD' : 'LKR')}
              className="px-2 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-primary/20 transition-all border border-slate-200/50 dark:border-slate-700/50 flex items-center shrink-0"
            >
              <span className="sm:hidden">{currency}</span>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className={currency === 'LKR' ? 'text-primary' : ''}>LKR</span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className={currency === 'USD' ? 'text-primary' : ''}>USD</span>
              </div>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 border border-slate-200/50 dark:border-slate-700/50">
              <Search className="w-4 h-4 text-slate-500 mr-2" />
              <input className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-24 lg:w-32 placeholder:text-slate-500" placeholder="Search" type="text" />
            </div>

            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
              {!isAuthReady ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : user ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate('/account')}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors flex items-center justify-center bg-slate-100 dark:bg-slate-800"
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                        }}
                      />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-slate-600 dark:text-slate-400"
                >
                  <UserIcon className="w-6 h-6" />
                </button>
              )}
              <button 
                onClick={onOpenCart}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 relative text-slate-600 dark:text-slate-400"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full text-slate-900 shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-background-dark shadow-2xl z-50 flex flex-col lg:hidden"
            >
              <div className="p-4 flex justify-between items-center border-b border-soft-mint dark:border-slate-800">
                <span className="font-black tracking-tighter text-slate-900 dark:text-white uppercase">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-soft-mint dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex flex-col p-4 gap-4">
                {navItems.map((item) => (
                  <Link 
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-semibold hover:text-primary transition-colors text-left"
                  >
                    {item.name}
                  </Link>
                ))}
                {user ? (
                  <>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                    <button 
                      onClick={() => {
                        navigate('/account');
                        setIsMobileMenuOpen(false);
                      }} 
                      className="text-lg font-semibold hover:text-primary transition-colors text-left flex items-center gap-2"
                    >
                      <UserIcon className="w-5 h-5" />
                      My Account
                    </button>
                    {isAdminUser && (
                      <button 
                        onClick={() => {
                          navigate('/admin');
                          setIsMobileMenuOpen(false);
                        }} 
                        className="text-lg font-semibold hover:text-primary transition-colors text-left flex items-center gap-2"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        Admin Dashboard
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                    <button 
                      onClick={() => {
                        handleLogin();
                        setIsMobileMenuOpen(false);
                      }} 
                      className="text-lg font-semibold hover:text-primary transition-colors text-left flex items-center gap-2"
                    >
                      <UserIcon className="w-5 h-5" />
                      Log In
                    </button>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 relative">
        {children}
      </main>

      <footer className="bg-[#B8E2D1] text-slate-900 py-16 px-6 lg:px-20 pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <div className="mb-8">
              <Link 
                to="/"
                className="flex items-center gap-3 cursor-pointer group"
              >
                <img 
                  src="https://res.cloudinary.com/dilixdvlj/image/upload/f_auto,q_auto/Pink_and_Cream_Modern_Cute_Cake_and_Bakery_Logo_el0ocr" 
                  alt="Magnolia Bakers Logo" 
                  className="w-16 h-16 object-contain rounded-full border-2 border-slate-900/20 group-hover:border-slate-900/40 transition-all"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xl font-black tracking-tighter uppercase font-display">Magnolia Bakers</span>
              </Link>
            </div>
            <ul className="space-y-3 text-xs font-bold tracking-wider uppercase">
              <li><a className="hover:opacity-70 transition-opacity" href="#">Careers</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Press</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">U.S. Franchising</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">International Franchising</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Gift Cards</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Giving Back</a></li>
            </ul>
          </div>

          <div className="flex flex-col justify-end">
            <ul className="space-y-3 text-xs font-bold tracking-wider uppercase">
              <li><a className="hover:opacity-70 transition-opacity" href="#">Help Center</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Refunds & Returns</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Loyalty Rewards Program</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Loyalty Rewards Program Terms</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Wholesale</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Newsroom</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2 lg:pl-20">
            <h5 className="font-serif text-2xl mb-6">Have a question?</h5>
            <div className="space-y-4 text-sm mb-8">
              <p>We're always here to lend a helping hand.</p>
              <p>Consumer Care Team hours are<br />Monday-Friday, 9am - 5pm EST</p>
              <a href="#" className="font-bold uppercase tracking-widest block hover:opacity-70 transition-opacity underline underline-offset-4">CONTACT US</a>
            </div>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 text-[#B8E2D1] flex items-center justify-center hover:opacity-80 transition-opacity">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 text-[#B8E2D1] flex items-center justify-center hover:opacity-80 transition-opacity">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 text-[#B8E2D1] flex items-center justify-center hover:opacity-80 transition-opacity">
                <Twitter size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto pt-8 border-t border-slate-900/10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-[10px] font-bold tracking-widest uppercase">
            <p>© 2026 Magnolia Bakers. All rights reserved.</p>
            <a className="hover:opacity-70 transition-opacity" href="#">Privacy Policy</a>
            <a className="hover:opacity-70 transition-opacity" href="#">Terms of Use</a>
            <a className="hover:opacity-70 transition-opacity" href="#">Accessibility</a>
            <a className="hover:opacity-70 transition-opacity" href="#">Sitemap</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 left-6 z-40 p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-2xl border border-soft-mint dark:border-slate-700 hover:bg-primary hover:text-slate-900 transition-all group"
          >
            <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
