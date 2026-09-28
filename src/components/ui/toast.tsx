'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { Check, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col sm:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = {
  default: 'bg-background border-border text-foreground',
  destructive: 'group destructive border-destructive bg-destructive/10 text-destructive',
  success: 'group success border-green-500 bg-green-500/10 text-green-500',
  warning: 'group warning border-orange-500 bg-orange-500/10 text-orange-500',
  info: 'group info border-blue-500 bg-blue-500/10 text-blue-500',
};

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: keyof typeof toastVariants;
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-full data-[swipe=end]:translate-x-full data-[swipe=move]:translate-x-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:animate-out sm:data-[state=closed]:slide-out-to-right-full',
        toastVariants[variant],
        className
      )}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-400',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

export function Toast({
  title,
  description,
  variant = 'default',
  ...props
}: {
  title?: string;
  description?: string;
  variant?: keyof typeof toastVariants;
} & React.ComponentPropsWithoutRef<typeof Toast>) {
  const icons = {
    default: Info,
    destructive: AlertCircle,
    success: Check,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = icons[variant] || icons.default;

  return (
    <Toast variant={variant} {...props}>
      <div className="flex gap-3">
        {variant !== 'default' && (
          <div className="flex items-center justify-center">
            <Icon className="size-4" />
          </div>
        )}
        <div className="flex-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
      </div>
    </Toast>
  );
}

export { ToastProvider, ToastViewport, Toast, ToastAction, ToastClose };
