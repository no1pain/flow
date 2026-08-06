import * as React from 'react';

import { cn } from '@/lib/utils';

function Avatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="avatar"
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<'img'>) {
  return (
    <img
      data-slot="avatar-image"
      className={cn('aspect-square h-full w-full', className)}
      {...props}
    />
  );
}

function AvatarFallback({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="avatar-fallback"
      className={cn('flex size-full items-center justify-center rounded-full bg-muted', className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
