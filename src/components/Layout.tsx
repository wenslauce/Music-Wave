import { Outlet } from 'react-router-dom';
import { MobileHeader } from './MobileHeader';
import { Sidebar } from './Sidebar';
import { Player } from './Player';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

interface LayoutProps {
  className?: string;
}

export function Layout({ className }: LayoutProps) {
  const { isLoading } = useQuery({
    queryKey: ['layout'],
    queryFn: async () => {
      // Simulate loading for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true; // Return a value instead of undefined
    },
    staleTime: Infinity,
  });

  return (
    <div className={cn("relative min-h-screen", className)}>
      <MobileHeader isLoading={isLoading} />
      <div className="flex">
        <Sidebar className="hidden md:block w-[300px] shrink-0 border-r" />
        <main className="flex-1 overflow-hidden">
          <div className={cn(
            "container py-4 md:py-6 min-h-[calc(100vh-4rem)]",
            "pb-32 md:pb-8" // Account for player height
          )}>
            <Outlet />
          </div>
        </main>
      </div>
      <Player isLoading={isLoading} />
    </div>
  );
} 