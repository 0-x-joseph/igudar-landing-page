"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import WaitlistModal from './WaitlistModal';
type SectionId = 'how-it-works' | 'ai-powered' | 'ai-engine';

const navLinks: { label: string; type: 'section' | 'page'; id: SectionId | string }[] = [
  { label: 'How It Works', type: 'section', id: 'how-it-works' },
  { label: 'Features', type: 'section', id: 'ai-powered' },
  { label: 'AI Engine', type: 'section', id: 'ai-engine' },
  { label: 'Pricing', type: 'page', id: 'pricing' },
  { label: 'FAQ', type: 'page', id: 'faq' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | ''>('');
  const navigate = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (pathname === '/') {
        const sections: SectionId[] = ['how-it-works', 'ai-powered', 'ai-engine'];
        const scrollPosition = window.scrollY + 120;

        let found = false;
        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const { offsetTop, offsetHeight } = element;
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(sectionId);
              found = true;
              break;
            }
          }
        }
        if (!found) setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    if (pathname === '/' && window.location.hash) {
      const sectionId = window.location.hash.slice(1);
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleSectionClick = (sectionId: SectionId) => {
    setIsMenuOpen(false);
    if (pathname !== '/') {
      navigate.push(`/#${sectionId}`);
    } else {
      window.history.replaceState(null, '', `#${sectionId}`);
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (item: typeof navLinks[0]) => {
    if (item.type === 'section') return pathname === '/' && activeSection === item.id;
    return pathname === `/${item.id}`;
  };

  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      {/* Top Banner */}
      <AnimatePresence>
        {isBannerVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-slate-200 w-full flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-10 relative overflow-hidden shadow-sm"
          >
            <p className="text-slate-600 text-[13px] font-medium text-center">
              Igudar early access is now live!
            </p>
            <a href="https://app.igudar.tech/auth/register" className="text-[#7B3FFF] text-[13px] font-semibold hover:text-[#9B6FFF] transition-colors whitespace-nowrap">
              Get Started →
            </a>
            <button 
              onClick={() => setIsBannerVisible(false)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 transition-colors"
              aria-label="Close banner"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm'
            : 'bg-transparent'
        }`}
      >
      <div className="max-w-[1120px] mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center"
          >
            <img
              src="/images/Logo-IGUDAR-2-Photoroom.png"
              alt="IGUDAR"
              className="h-20 sm:h-24 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((item) =>
              item.type === 'section' ? (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id as SectionId)}
                  className={`relative text-[13px] font-medium transition-colors ${
                      isActive(item) ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive(item) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-[#5D18E9] rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={`/${item.id}`}
                  className={`relative text-[13px] font-medium transition-colors ${
                      isActive(item) ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive(item) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-[#5D18E9] rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              )
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center">
            <button 
              onClick={() => setIsWaitlistOpen(true)}
              className="px-5 text-[13px] font-medium text-white bg-[#5D18E9] hover:bg-[#4A13BA] transition-colors h-9 rounded-full flex items-center justify-center cursor-pointer shadow-lg shadow-[#5D18E9]/15"
            >
              Join Waitlist
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 flex flex-col gap-[5px]">
              <span
                className={`block h-[1.5px] bg-slate-800 rounded-full transition-all duration-300 origin-center ${
                  isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                }`}
              />
              <span
                className={`block h-[1.5px] bg-slate-800 rounded-full transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0 scale-0' : ''
                }`}
              />
              <span
                className={`block h-[1.5px] bg-slate-800 rounded-full transition-all duration-300 origin-center ${
                  isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden bg-white rounded-b-xl shadow-lg shadow-slate-200/70 absolute left-0 right-0 border-b border-slate-200"
            >
              <div className="py-3 px-4 sm:px-6 space-y-0.5">
                {navLinks.map((item) =>
                  item.type === 'section' ? (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id as SectionId)}
                      className={`w-full flex items-center px-4 py-2.5 text-[14px] font-medium rounded-lg transition-colors ${
                        isActive(item) ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ) : (
                    <Link
                      key={item.id}
                      href={`/${item.id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`w-full flex items-center px-4 py-2.5 text-[14px] font-medium rounded-lg transition-colors ${
                        isActive(item) ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                )}
                
                <div className="pt-3 mt-2 border-t border-slate-200">
                  <button 
                    onClick={() => {
                      setIsWaitlistOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-[14px] font-medium text-white bg-[#5D18E9] rounded-lg hover:bg-[#4A13BA] transition-colors flex items-center justify-center"
                  >
                    Join Waitlist
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </header>
      <WaitlistModal isOpen={isWaitlistOpen} onClose={() => setIsWaitlistOpen(false)} />
    </div>
  );
};

export default Navbar;
