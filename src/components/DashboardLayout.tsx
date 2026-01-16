'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import {
  Home,
  Users,
  Sparkles,
  ShoppingBag,
  Award,
  Bell,
  LogOut,
  GraduationCap,
  MessageSquare,
  Settings,
  User as UserIcon,
  Share2,
  Wallet,
  Heart,
  Calendar,
  BarChart3,
  Megaphone,
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
import placeholderImages from '@/lib/placeholder-images.json';
import { BottomNav } from './BottomNav';


const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'directory', label: 'Member Directory', icon: Users, path: '/directory' },
  { id: 'community', label: 'Community Feed', icon: MessageSquare, path: '/community' },
  { id: 'events', label: 'Events', icon: Calendar, path: '/community/events' },
  { id: 'causes', label: 'Causes', icon: Heart, path: '/community/causes' },
  { id: 'matchmaking', label: 'Matchmaking', icon: Sparkles, path: '/matchmaking' },
  { id: 'cohorts', label: 'My Cohorts', icon: Users, path: '/cohorts' },
  { id: 'impact', label: 'Impact', icon: BarChart3, path: '/impact' },
  { id: 'programs', label: 'Programs', icon: GraduationCap, path: '/programs' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
  { id: 'ads', label: 'Ad Manager', icon: Megaphone, path: '/ads' },
  { id: 'certification', label: 'Certification', icon: Award, path: '/certification' },
  { id: 'referrals', label: 'Referrals', icon: Share2, path: '/referrals' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/wallet' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getImage = (imageId?: string) => {
  if (!imageId) return null;
  // If imageId is a full URL, return it directly
  if (imageId.startsWith('http')) {
    return { imageUrl: imageId };
  }
  // Otherwise, find it in the placeholder data
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};


const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const { profile } = useMemberProfile();
  const userName = profile?.name || user?.displayName || 'Member';
  
  const profilePath = profile ? `/profile/${profile.id}` : '#';
  const avatarImage = getImage(profile?.imageId || 'default-male-avatar');

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 hidden lg:flex flex-col'
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
              variant={pathname.startsWith(item.path) ? 'default' : 'ghost'}
              onClick={() => {
                router.push(item.path);
              }}
              className="w-full flex items-center justify-start gap-3 px-3 py-2.5"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 lg:hidden">
              <Link href="/dashboard">
                <Logo className="h-8 object-contain" />
              </Link>
            </div>

            <div className="flex items-center gap-3 lg:w-full lg:justify-end">
              <Button variant="ghost" size="icon" className="p-2 hover:bg-muted rounded-lg relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full" />
              </Button>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={avatarImage?.imageUrl ?? user?.photoURL ?? ""} alt={userName} />
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
                    <DropdownMenuItem asChild>
                        <Link href="/settings/profile">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Profile Settings</span>
                        </Link>
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
        <main className="p-4 lg:p-6 max-w-7xl mx-auto pb-24 lg:pb-6">{children}</main>

        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border mt-8 hidden lg:block">
          <p>Transcend Global Network © All rights reserved</p>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
