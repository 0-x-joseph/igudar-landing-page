import Link from 'next/link';

export default function SiteFooter() {
  const columns = [
    {
      heading: 'Platform',
      links: [
        { label: 'How it Works', href: '#how-it-works' },
        { label: 'Features', href: '#ai-powered' },
        { label: 'Sharia Compliance', href: '#sharia-compliant' },
        { label: 'Pricing', href: '/pricing', isLink: true },
      ],
    },
    {
      heading: 'Support',
      links: [
        { label: 'Help Center', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'FAQ', href: '/faq', isLink: true },
        { label: 'Privacy Policy', href: '#' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Press', href: '#' },
        { label: 'Partners', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-muted text-foreground pt-16 pb-8 border-t border-border">
      <div className="max-w-[1120px] mx-auto px-5 sm:px-6 lg:px-8">
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
              Democratizing real estate investment in Morocco through
              Sharia-compliant fractional ownership.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.isLink ? (
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link>
                    ) : (
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">&copy; 2025 IGUDAR. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}