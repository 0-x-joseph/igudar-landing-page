import AnimatedSection from '@/components/AnimatedSection';
import InfiniteSlider from '@/components/smoothui/infinite-slider';

const logos = [
  '/images/um6p.png',
  '/images/mit-sandbox.png',
  '/images/explorer.png',
  '/images/fondation-ocp.svg',
  '/images/um6p-launchpad.png',
  '/images/coe-white.png',
];

export default function BackedBySection() {
  return (
    <section className="py-16 border-y border-border bg-card">
      <div className="max-w-[1120px] mx-auto px-5 sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="text-center text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-12">
            Backed & Supported By
          </h2>
        </AnimatedSection>
        <div className="relative px-4">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

          <InfiniteSlider gap={100} speed={100} reverse={true}>
            {logos.map((src, index) => (
              <div key={index} className="flex items-center justify-center min-w-[200px]">
                <img
                  src={src}
                  alt="partner logo"
                  className="h-16 w-auto object-contain opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110"
                />
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}