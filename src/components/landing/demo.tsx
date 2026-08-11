import { Card, CardContent } from '@/components/ui/card';

export function Demo() {
  return (
    <section id="demo" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">See It in Action</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Experience the power and simplicity of Flow with our interactive demo.
          </p>
        </div>
        <div className="mt-16">
          <Card className="mx-auto max-w-5xl overflow-hidden border-none shadow-2xl">
            <CardContent className="p-0">
              <div className="aspect-video bg-gradient-to-br from-primary/10 via-primary/5 to-muted/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/20">
                    <svg
                      className="size-10 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    Interactive Demo Coming Soon
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Watch this space for an immersive product tour
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
