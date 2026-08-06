import * as React from 'react';
import { Menu } from '@base-ui/react/menu';

import { cn } from '@/lib/utils';

function DropdownMenu({ ...props }: React.ComponentProps<typeof Menu.Root>) {
  return <Menu.Root {...props} />;
}

function DropdownMenuTrigger({ ...props }: React.ComponentProps<typeof Menu.Trigger>) {
  return <Menu.Trigger {...props} />;
}

function DropdownMenuPortal({ ...props }: React.ComponentProps<typeof Menu.Portal>) {
  return <Menu.Portal {...props} />;
}

function DropdownMenuPositioner({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Positioner>) {
  return (
    <Menu.Positioner
      className={cn('fixed z-50 flex min-w-8 flex-col items-center', className)}
      {...props}
    />
  );
}

function DropdownMenuPopup({ className, ...props }: React.ComponentProps<typeof Menu.Popup>) {
  return (
    <Menu.Popup
      className={cn(
        'z-50 min-w-32 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-top-2',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('p-1', className)} {...props} />;
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Separator>) {
  return <Menu.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />;
}

function DropdownMenuLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('px-2 py-1.5 text-sm font-semibold', className)} {...props} />;
}

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof Menu.Popup>,
  React.ComponentPropsWithoutRef<typeof Menu.Popup>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPortal>
    <DropdownMenuPositioner>
      <DropdownMenuPopup ref={ref} className={className} {...props}>
        {children}
      </DropdownMenuPopup>
    </DropdownMenuPositioner>
  </DropdownMenuPortal>
));
DropdownMenuContent.displayName = Menu.Popup.displayName;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
