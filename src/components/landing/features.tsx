import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Shield, Users, BarChart3, Globe, Smartphone } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized for speed with instant loading times and smooth interactions.',
  },
  {
    icon: Shield,
    title: 'Secure by Default',
    description: 'Built-in security features to protect your data and users.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together seamlessly with real-time collaboration tools.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track performance and gain insights with comprehensive analytics.',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Deploy worldwide with edge computing and CDN integration.',
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Responsive design that works perfectly on any device.',
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed to help you build, deploy, and scale your applications with
            ease.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-none shadow-sm py-6">
              <CardHeader>
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
