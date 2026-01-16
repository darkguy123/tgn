'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, GraduationCap, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemberProfile } from '@/hooks/useMemberProfile';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
  { href: '/programs', icon: GraduationCap, label: 'Programs' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { profile } = useMemberProfile();
  
  const profileHref = profile ? `/profile/${profile.id}` : '/settings/profile';

  const allNavItems = [...navItems, { href: profileHref, icon: User, label: 'Profile' }];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-40 lg:hidden">
      <div className="grid h-full grid-cols-5">
        {allNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link href={item.href} key={item.label} className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            )}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
