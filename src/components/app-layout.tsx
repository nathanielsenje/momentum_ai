'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Gauge, PanelLeft } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setOpen, isMobile } = useSidebar();

  React.useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [pathname, isMobile, setOpen]);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setOpen]);

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <h1 className="text-xl font-semibold font-headline">Momentum AI</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/" passHref>
                <SidebarMenuButton
                  as="a"
                  isActive={pathname === '/'}
                  tooltip="Dashboard"
                >
                  <Gauge />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/analytics" passHref>
                <SidebarMenuButton
                  as="a"
                  isActive={pathname === '/analytics'}
                  tooltip="Analytics"
                >
                  <Activity />
                  <span>Analytics</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="p-4 md:p-6 lg:p-8">
        <header className="flex items-center justify-between md:hidden mb-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-7 text-primary" />
            <span className="font-semibold font-headline">Momentum AI</span>
          </Link>
          <SidebarTrigger asChild>
            <Button variant="ghost" size="icon">
              <PanelLeft />
            </Button>
          </SidebarTrigger>
        </header>
        {children}
      </SidebarInset>
    </>
  );
}