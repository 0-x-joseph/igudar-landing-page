import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ZelligeBand } from '@/components/brand';

type FooterLink = { key: string; href: string; isLink?: boolean };

// Headings and labels live in common.footer.*; the order and the targets stay here.
const columns: { key: 'platform' | 'support' | 'company'; links: FooterLink[] }[] = [
  {
    key: 'platform',
    links: [
      { key: 'howItWorks', href: '/#how-it-works', isLink: true },
      { key: 'features', href: '/#ai-powered', isLink: true },
      { key: 'pricing', href: '/pricing', isLink: true },
      { key: 'simulator', href: '/simulator', isLink: true },
      { key: 'beta', href: '/beta', isLink: true },
    ],
  },
  {
    key: 'support',
    links: [
      { key: 'helpCenter', href: '#' },
      { key: 'contact', href: '#' },
      { key: 'faq', href: '/faq', isLink: true },
      { key: 'privacyPolicy', href: '#' },
    ],
  },
  {
    key: 'company',
    links: [
      { key: 'about', href: '#' },
      { key: 'careers', href: '#' },
      { key: 'press', href: '#' },
      { key: 'partners', href: '#' },
    ],
  },
];

export default function SiteFooter() {
  const t = useTranslations('common');

  return (
    <footer className="relative bg-background text-foreground pt-16 pb-8 border-t border-border">
      <div className="max-w-[1120px] mx-auto px-5 sm:px-6 lg:px-8">
        <ZelligeBand className="mb-12" />
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <img
                src="/images/Logo-IGUDAR-2-Photoroom.png"
                alt="IGUDAR"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.key}>
              <h3 className="text-sm font-semibold text-foreground mb-4">{t(`footer.columns.${col.key}`)}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.key}>
                    {link.isLink ? (
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t(`footer.links.${link.key}`)}</Link>
                    ) : (
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t(`footer.links.${link.key}`)}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p role="note" className="mb-6 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          {t('notice.indicative')}
        </p>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">{t('footer.copyright')}</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('footer.terms')}</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('footer.privacy')}</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">{t('footer.cookies')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
