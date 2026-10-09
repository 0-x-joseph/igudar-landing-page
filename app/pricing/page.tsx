"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AnimatedSection from '@/components/AnimatedSection';
import GradientText from '@/components/GradientText';

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      period: 'per month',
      features: [
        'AI guidance',
        'Invest starting from 1,000 MAD',
        'Properties listing access',
        'AI recommendation engine',
      ],
      borderColor: 'border-border',
      bgColor: 'bg-card',
      popular: false,
    },
    {
      name: 'Discovery',
      price: '20',
      period: 'per month',
      features: [
        'AI guidance',
        'Invest starting from 1,000 MAD',
        'Properties listing access',
        'AI recommendation engine',
        '24/7 Phone Support',
        'Advanced Analytics',
      ],
      borderColor: 'border-primary/20',
      bgColor: 'bg-card',
      popular: true,
    },
    {
      name: 'Premium',
      price: '150',
      period: 'per month',
      features: [
        'AI guidance',
        'Invest starting from 1,000 MAD',
        'Properties listing access',
        'AI recommendation engine',
        '24/7 Phone Support',
        'Advanced Analytics',
        'Personalized portfolio recommendations',
      ],
      borderColor: 'border-primary/30',
      bgColor: 'bg-accent/50',
      popular: false,
    },
  ];

  const b2bFeatures = [
    'AI guidance',
    'Properties listing access',
    'AI recommendation engine',
    '24/7 Phone Support',
    'Advanced Analytics',
    'Portfolio recommendations',
    'Consulting expert sessions',
    'API Endpoint',
    'Real-time data access',
  ];

  const comparisonFeatures = [
    'AI guidance',
    'Invest starting from 1,000 MAD',
    'Properties listing access',
    'AI recommendation engine',
    '24/7 Phone Support',
    'Advanced Analytics',
    'Personalized portfolio recommendations',
    'Sessions with consulting experts',
    'API Endpoint',
    'Real-time data access',
  ];

  const planComparison: Record<string, boolean[]> = {
    Free: [true, true, true, true, false, false, false, false, false, false],
    Discovery: [true, true, true, true, true, true, false, false, false, false],
    Premium: [true, true, true, true, true, true, true, false, false, false],
    B2B: [true, true, true, true, true, true, true, true, true, true],
  };

  return (
    <div className="min-h-screen bg-card">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-8 lg:pt-36 lg:pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to home
              </Link>

              <h1 className="text-4xl lg:text-[3.5rem] font-extrabold text-foreground leading-tight mb-4">
                Grow your way,{' '}
                <span className="block">
                  <GradientText>Pay your way.</GradientText>
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Simple, transparent pricing that scales with your investment journey.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => (
              <AnimatedSection key={index} delay={index * 120}>
                <div
                  className={`relative ${plan.bgColor} rounded-3xl p-8 border-2 ${plan.borderColor} hover:shadow-xl hover:shadow-foreground/10 transition-all duration-500 h-full`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-full shadow-lg shadow-primary/25">
                        Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-foreground mb-4">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-5xl font-extrabold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">DH / {plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-muted-foreground text-[15px]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="https://app.igudar.tech/auth/register"
                    className={`block w-full text-center py-3.5 rounded-2xl font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-primary text-white hover:bg-accent-foreground shadow-lg shadow-primary/25'
                        : 'bg-muted text-foreground hover:bg-muted'
                    }`}
                  >
                    Get Started
                  </a>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* B2B Plan */}
          {/* <AnimatedSection>
            <div className="gradient-bg rounded-3xl shadow-xl p-10 text-white">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-3xl font-extrabold text-amber-300">B2B Plan</span>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-extrabold">500</span>
                  <span className="text-white/70 ml-1">DH / per month</span>
                </div>
                <p className="text-white/70 text-lg">Enterprise-grade solutions for businesses</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {b2bFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-green-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-white/90 text-[15px]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection> */}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-[2.75rem] font-extrabold text-foreground mb-4">
                Compare <GradientText>Plans</GradientText>
              </h2>
              <p className="text-lg text-muted-foreground">Choose the plan that fits your investment needs</p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-card rounded-3xl shadow-lg overflow-hidden border border-border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-5 text-left text-sm font-semibold text-foreground">Features</th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-foreground">Free</th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-foreground">Discovery</th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-foreground">Premium</th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-foreground bg-accent/50">B2B</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {comparisonFeatures.map((feature, index) => (
                      <tr key={index} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-foreground">{feature}</td>
                        {Object.entries(planComparison).map(([planName, features]) => (
                          <td
                            key={planName}
                            className={`px-6 py-4 text-center ${planName === 'B2B' ? 'bg-accent/30' : ''}`}
                          >
                            {features[index] ? (
                              <svg className="w-5 h-5 text-green-500 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-muted-foreground mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden bg-muted/50 border-y border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(93,24,233,0.08),transparent_55%)]" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <h2 className="text-3xl lg:text-[2.75rem] font-extrabold text-foreground mb-6">
              Ready to Start Investing?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join thousands of Moroccans building wealth through smart real estate investment.
            </p>
            <a
              href="https://app.igudar.tech/auth/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-card text-primary font-semibold rounded-2xl hover:bg-muted/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Get Started Today
            </a>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-foreground pt-16 pb-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Link href="/" className="inline-block mb-6">
                <img
                  src="/images/Logo-IGUDAR-2-Photoroom.png"
                  alt="IGUDAR"
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <p className="text-muted-foreground text-[15px] leading-relaxed">
                Democratizing real estate investment in Morocco through AI-powered, Sharia-compliant fractional ownership.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-5 text-foreground">Platform</h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">How it Works</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">AI Technology</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Properties</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-5 text-foreground">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Contact Us</a></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">FAQ</Link></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-5 text-foreground">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Press</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-[15px]">Partners</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">&copy; 2025 IGUDAR. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

