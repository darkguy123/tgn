'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import {
  Home,
  Users,
  Sparkles,
  ShoppingBag,
  Award,
  Menu,
  Bell,
  LogOut,
  GraduationCap,
  MessageSquare,
  Settings,
  User as UserIcon,
  Share2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { members } from '@/lib/data';


const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'directory', label: 'Member Directory', icon: Users, path: '/directory' },
  { id: 'community', label: 'Community', icon: MessageSquare, path: '/community' },
  { id: 'matchmaking', label: 'Matchmaking', icon: Sparkles, path: '/matchmaking' },
  { id: 'programs', label: 'Programs', icon: GraduationCap, path: '/programs' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
  { id: 'certification', label: 'Certification', icon: Award, path: '/certification' },
  { id: 'referrals', label: 'Referrals', icon: Share2, path: '/referrals' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const { profile } = useMemberProfile();
  const userName = user?.displayName || 'Member';
  
  const member = members.find(m => m.tgnId === profile?.tgnMemberId);
  const profilePath = member ? `/profile/${member.id}` : '#';

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 lg:translate-x-0 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-4 border-b border-border">
          <Link href="/dashboard">
            <Logo className="h-10 object-contain" />
          </Link>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.id}
              variant={pathname === item.path ? 'default' : 'ghost'}
              onClick={() => {
                router.push(item.path);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center justify-start gap-3 px-3 py-2.5"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          {/* Logout moved to user dropdown */}
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-muted rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="lg:hidden">
                <Link href="/dashboard">
                  <Logo className="h-8 object-contain" />
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="p-2 hover:bg-muted rounded-lg relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full" />
              </Button>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL ?? ""} alt={userName} />
                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                                {userName[0]}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{userName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user?.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href={profilePath}>
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 max-w-7xl mx-auto">{children}</main>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-8">
          <p>Transcend Global Network © All rights reserved</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
