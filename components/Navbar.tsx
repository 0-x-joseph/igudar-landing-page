"use client";
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useRouter, usePathname } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import WaitlistModal from './WaitlistModal';
type SectionId = 'how-it-works' | 'ai-powered';

// The closed-beta sign-up (approval is manual).
const BETA_URL = 'https://app.igudar.tech/auth/register';

type NavKey = 'howItWorks' | 'features' | 'simulator' | 'calculator' | 'pricing' | 'beta' | 'faq';

// Labels live in common.nav.<key>; the order and the targets stay here.
const navLinks: { key: NavKey; type: 'section' | 'page'; id: SectionId | string }[] = [
  { key: 'howItWorks', type: 'section', id: 'how-it-works' },
  { key: 'features', type: 'section', id: 'ai-powered' },
  { key: 'simulator', type: 'page', id: 'simulator' },
  { key: 'calculator', type: 'page', id: 'calculator' },
  { key: 'pricing', type: 'page', id: 'pricing' },
  { key: 'beta', type: 'page', id: 'beta' },
  { key: 'faq', type: 'page', id: 'faq' },
];

const Navbar = () => {
  const t = useTranslations('common');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId | ''>('');
  const navigate = useRouter();
  // Locale-free: "/fr/pricing" reads as "/pricing", so the home check below holds in every language.
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (pathname === '/') {
        const sections: SectionId[] = ['how-it-works', 'ai-powered'];
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
    <div className="fixed top-0 inset-x-0 z-50 flex flex-col">
      {/* Top Banner */}
      <AnimatePresence>
        {isBannerVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-card border-b border-border w-full flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-10 relative overflow-hidden"
          >
            <p className="text-muted-foreground text-[13px] font-medium text-center">
              {t('banner.text')}
            </p>
            <Link href="/beta" className="text-primary text-[13px] font-semibold hover:text-primary/80 transition-colors whitespace-nowrap">
              {t('banner.cta')}
            </Link>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="absolute end-3 sm:end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
              aria-label={t('banner.close')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className={`w-full transition-colors duration-200 ease-out ${
          isScrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-border'
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
            className="flex shrink-0 items-center"
          >
            <img
              src="/images/Logo-IGUDAR-2-Photoroom.png"
              alt="IGUDAR"
              className="h-20 sm:h-24 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 whitespace-nowrap">
            {navLinks.map((item) =>
              item.type === 'section' ? (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id as SectionId)}
                  className={`relative text-[13px] font-medium transition-colors ${
                      isActive(item) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(`nav.${item.key}`)}
                  {isActive(item) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 inset-x-0 h-[2px] bg-primary rounded-full"
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    />
                  )}
                </button>
              ) : (
                <Link
                  key={item.id}
                  href={`/${item.id}`}
                  className={`relative text-[13px] font-medium transition-colors ${
                      isActive(item) ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(`nav.${item.key}`)}
                  {isActive(item) && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1.5 inset-x-0 h-[2px] bg-primary rounded-full"
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    />
                  )}
                </Link>
              )
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSwitcher compact className="me-1" />
            <button type="button"
              onClick={() => setIsWaitlistOpen(true)}
              className="hidden 2xl:flex px-4 text-[13px] font-medium text-foreground border border-border bg-card hover:bg-muted transition-colors h-9 rounded-full items-center justify-center cursor-pointer whitespace-nowrap"
            >
              {t('cta.joinWaitlist')}
            </button>
            <a
              href={BETA_URL}
              className="px-5 text-[13px] font-medium text-primary-foreground bg-primary hover:bg-accent-foreground transition-colors h-9 rounded-full flex items-center justify-center whitespace-nowrap"
            >
              {t('cta.betaAccess')}
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={t('nav.toggleMenu')}
            aria-expanded={isMenuOpen}
          >
            <div className="w-5 flex flex-col gap-[5px]">
              <span
                className={`block h-[1.5px] bg-foreground rounded-full transition-all duration-200 ease-out origin-center ${
                  isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                }`}
              />
              <span
                className={`block h-[1.5px] bg-foreground rounded-full transition-all duration-200 ease-out ${
                  isMenuOpen ? 'opacity-0 scale-0' : ''
                }`}
              />
              <span
                className={`block h-[1.5px] bg-foreground rounded-full transition-all duration-200 ease-out origin-center ${
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
              className="lg:hidden overflow-hidden bg-card rounded-b-xl shadow-sm absolute inset-x-0 border-b border-border"
            >
              <div className="py-3 px-4 sm:px-6 space-y-0.5">
                {navLinks.map((item) =>
                  item.type === 'section' ? (
                    <button
                      key={item.id}
                      onClick={() => handleSectionClick(item.id as SectionId)}
                      className={`w-full flex items-center px-4 py-2.5 text-[14px] font-medium rounded-lg transition-colors ${
                        isActive(item) ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {t(`nav.${item.key}`)}
                    </button>
                  ) : (
                    <Link
                      key={item.id}
                      href={`/${item.id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className={`w-full flex items-center px-4 py-2.5 text-[14px] font-medium rounded-lg transition-colors ${
                        isActive(item) ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  )
                )}

                <div className="pt-3 mt-2 border-t border-border space-y-2">
                  <a
                    href={BETA_URL}
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-4 py-2.5 text-[14px] font-medium text-primary-foreground bg-primary rounded-lg hover:bg-accent-foreground transition-colors flex items-center justify-center"
                  >
                    {t('cta.betaAccess')}
                  </a>
                  <button
                    onClick={() => {
                      setIsWaitlistOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-[14px] font-medium text-foreground border border-border bg-card rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                  >
                    {t('cta.joinWaitlist')}
                  </button>
                  <div className="flex justify-center pt-1">
                    <LanguageSwitcher />
                  </div>
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
