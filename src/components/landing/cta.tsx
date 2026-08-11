import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 sm:py-32 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-primary-foreground/90">
            Join thousands of developers who are already building faster with Flow. Start your free
            trial today.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Free Trial
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="mailto:sales@flow.dev">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10"
              >
                Contact Sales
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
