import * as React from 'react';
import { Dialog } from '@base-ui/react/dialog';

import { cn } from '@/lib/utils';

function DialogRoot({ ...props }: React.ComponentProps<typeof Dialog.Root>) {
  return <Dialog.Root {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof Dialog.Trigger>) {
  return <Dialog.Trigger {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof Dialog.Portal>) {
  return <Dialog.Portal {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof Dialog.Close>) {
  return <Dialog.Close {...props} />;
}

function DialogBackdrop({ className, ...props }: React.ComponentProps<typeof Dialog.Backdrop>) {
  return (
    <Dialog.Backdrop
      className={cn(
        'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:duration-200',
        className
      )}
      {...props}
    />
  );
}

function DialogPopup({ className, ...props }: React.ComponentProps<typeof Dialog.Popup>) {
  return (
    <Dialog.Popup
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg -translate-x-1/_2 -translate-y-1/_2 gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-2 sm:rounded-xl',
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof Dialog.Title>) {
  return (
    <Dialog.Title
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Description>) {
  return (
    <Dialog.Description className={cn('text-sm text-muted-foreground', className)} {...props} />
  );
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Popup>,
  React.ComponentPropsWithoutRef<typeof Dialog.Popup>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogBackdrop />
    <DialogPopup ref={ref} className={className} {...props}>
      {children}
      <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
        <span className="sr-only">Close</span>
      </Dialog.Close>
    </DialogPopup>
  </DialogPortal>
));
DialogContent.displayName = Dialog.Popup.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

export {
  DialogRoot as Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
