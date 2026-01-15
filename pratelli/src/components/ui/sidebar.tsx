// This is a heavily modified version of the sidebar component from the shadcn-com-sapper-template
// @see https://github.com/huntabyte/shadcn-com-sapper-template/blob/main/src/lib/components/docs/sidebar.svelte
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  ChevronRight,
  LayoutGrid,
  Settings,
  PanelLeft,
  Search,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type SidebarContext = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

const SidebarProvider = ({
  defaultOpen = true,
  children,
}: {
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  React.useEffect(() => {
    const cookieValue =
      document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
        ?.split('=')[1] ?? 'expanded';
    setOpen(cookieValue === 'expanded');
  }, []);

  const setOpenAndPersist = (newOpenState: boolean) => {
    setOpen(newOpenState);
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${
      newOpenState ? 'expanded' : 'collapsed'
    }; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  };

  const toggleSidebar = React.useCallback(() => {
    isMobile
      ? setOpenMobile((prev) => !prev)
      : setOpenAndPersist(!open);
  }, [isMobile, open]);

  // Keyboard shortcut to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen: setOpenAndPersist,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, isMobile, openMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  );
};


const sidebarVariants = cva(
  'hidden lg:flex flex-col border-r bg-background transition-all duration-300 ease-in-out',
  {
    variants: {
      state: {
        expanded: 'w-64',
        collapsed: 'w-14',
      },
    },
    defaultVariants: {
      state: 'expanded',
    },
  }
);

const Sidebar = ({ className, ...props }: React.ComponentProps<'aside'>) => {
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar();
  
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-64 p-0">
          <aside className={cn('flex flex-col h-full w-full', className)} {...props} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(sidebarVariants({ state }), className)}
      {...props}
    />
  );
};


const SidebarHeader = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => {
  const { state, isMobile } = useSidebar();
  
  return (
    <div
      className={cn(
        'flex items-center p-3',
        (state === 'collapsed' && !isMobile) ? 'justify-center' : '',
        className
      )}
      {...props}
    />
  );
};

const SidebarContent = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => (
  <div
    className={cn(
      'flex-1 overflow-y-auto overflow-x-hidden p-2',
      className
    )}
    {...props}
  />
);

const SidebarFooter = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => {
  const { state, isMobile } = useSidebar();
  return (
    <div
      className={cn(
        'p-3 border-t',
        (state === 'collapsed' && !isMobile) ? 'flex flex-col items-center gap-2' : '',
        className
      )}
      {...props}
    />
  );
};

const SidebarMenu = ({
  className,
  ...props
}: React.ComponentProps<'nav'>) => (
  <nav className={cn('flex flex-col gap-1', className)} {...props} />
);

const SidebarMenuItem = ({
  className,
  ...props
}: React.ComponentProps<'div'>) => (
  <div className={cn('relative', className)} {...props} />
);

const sidebarMenuButtonVariants = cva(
  'flex items-center justify-start gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full',
  {
    variants: {
      isActive: {
        true: 'bg-primary text-primary-foreground',
        false: 'bg-transparent hover:bg-muted',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }
);

const SidebarMenuButton = ({
  className,
  isActive,
  asChild,
  children,
  href,
  ...props
}: React.ComponentProps<typeof Button> & { isActive?: boolean; asChild?: boolean, href?: string }) => {
  const { state, isMobile } = useSidebar();

  const buttonContent = (
    <div className={cn("flex items-center", (state === 'expanded' || isMobile) ? 'gap-3' : 'gap-0')}>
      {React.Children.map(children, (child, index) => {
        // Icon
        if (index === 0 && React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            className: 'h-4 w-4',
          });
        }
        // Label
        if (index === 1 && (state === 'expanded' || isMobile)) {
           return <span className="truncate">{child}</span>;
        }
        return null;
      })}
    </div>
  );
  
  const renderButton = () => (
    <Button
        variant={isActive ? 'default' : 'ghost'}
        className={cn(
            'w-full',
            (state === 'expanded' || isMobile) ? 'justify-start' : 'justify-center',
            className
        )}
        {...props}
    >
        {buttonContent}
    </Button>
  );

  const renderLink = () => (
     <Link href={href || ''} 
        className={cn(
            sidebarMenuButtonVariants({isActive}),
            (state === 'expanded' || isMobile) ? 'justify-start' : 'justify-center',
            className
        )}
     >
        {buttonContent}
     </Link>
  );

  
  if (state === 'collapsed' && !isMobile) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {href ? renderLink() : renderButton()}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={5}>
          {React.Children.toArray(children)[1]}
        </TooltipContent>
      </Tooltip>
    );
  }

  return href ? renderLink() : renderButton();
};

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
};
