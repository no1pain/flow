import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { Demo } from '@/components/landing/demo';
import { CTA } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <Demo />
      <CTA />
      <Footer />
    </div>
  );
}
