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
  Shield,
  LayoutGrid,
  Network,
  Menu,
  BookOpen,
  Briefcase,
  DollarSign,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
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
import { BottomNav } from './BottomNav';
import { NotificationsMenu } from './NotificationsMenu';
import { collection, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { FriendRequest } from '@/lib/types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { isUserAdmin } from '@/lib/auth-utils';
import { useEffect } from 'react';


const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'chat', label: 'Messages', icon: MessageSquare, path: '/chat' },
  { id: 'community', label: 'Community Feed', icon: LayoutGrid, path: '/community' },
  { id: 'network', label: 'My Network', icon: Network, path: '/network' },
  { id: 'directory', label: 'Member Directory', icon: Users, path: '/directory' },
  { id: 'events', label: 'Events', icon: Calendar, path: '/community/events' },
  { id: 'fundraise', label: 'Fundraise', icon: Heart, path: '/community/causes' },
  { id: 'matchmaking', label: 'Matchmaking', icon: Sparkles, path: '/matchmaking' },
  { id: 'cohorts', label: 'My Cohorts', icon: Users, path: '/cohorts' },
  { id: 'impact', label: 'Impact', icon: BarChart3, path: '/impact' },
  { id: 'programs', label: 'Programs', icon: GraduationCap, path: '/programs' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, path: '/marketplace' },
  { id: 'ads', label: 'Ad Manager', icon: Megaphone, path: '/ads' },
  { id: 'certification', label: 'Certification', icon: Award, path: '/certification' },
  { id: 'referrals', label: 'Referrals', icon: Share2, path: '/referrals' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/wallet' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings/profile' },
];

const ADMIN_NAV_ITEMS = [
  { id: 'admin-dashboard', label: 'Dashboard', icon: Shield, path: '/admin/dashboard' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
  { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
  { id: 'kyc', label: 'KYC', icon: ShieldCheck, path: '/admin/kyc' },
  { id: 'programs', label: 'Programs', icon: BookOpen, path: '/admin/programs' },
  { id: 'events', label: 'Events', icon: Calendar, path: '/admin/events' },
  { id: 'products', label: 'Products', icon: ShoppingBag, path: '/admin/products' },
  { id: 'sectors', label: 'Sectors', icon: Briefcase, path: '/admin/sectors' },
  { id: 'causes', label: 'Fundraisers', icon: Heart, path: '/admin/causes' },
  { id: 'ads', label: 'Ad Campaigns', icon: Megaphone, path: '/admin/ads' },
  { id: 'withdrawals', label: 'Withdrawals', icon: DollarSign, path: '/admin/withdrawals' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const auth = useAuth();
  const { profile } = useMemberProfile();
  const userName = profile?.name || user?.displayName || 'Member';
  const firestore = useFirestore();

  useEffect(() => {
    if (!user || !firestore) return;
    const userStatusRef = doc(firestore, 'users', user.uid);
    
    const updateLastSeen = () => {
        // We don't want to show an error for this, as it's a background task
        // and can fail if offline.
        updateDoc(userStatusRef, { lastSeen: serverTimestamp() }).catch(() => {});
    };
    
    updateLastSeen(); // Update once on mount

    window.addEventListener('focus', updateLastSeen);
    
    // Also update periodically
    const intervalId = setInterval(updateLastSeen, 5 * 60 * 1000); // every 5 minutes

    return () => {
        window.removeEventListener('focus', updateLastSeen);
        clearInterval(intervalId);
    };
}, [user, firestore]);

  const requestsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'friend_requests'), where('recipientId', '==', user.uid), where('status', '==', 'pending')) : null,
    [user, firestore]
  );
  const { data: pendingRequests } = useCollection<FriendRequest>(requestsQuery);
  const notificationCount = pendingRequests?.length || 0;
  
  const profilePath = profile ? `/member/${profile.tgnMemberId || profile.id}` : '/member';

  const handleLogout = () => {
    signOut(auth);
  };
  
  const isAdmin = isUserAdmin(profile);
  const isAdminPage = pathname.startsWith('/admin');
  const navItems = isAdminPage ? ADMIN_NAV_ITEMS : NAV_ITEMS;


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
          {navItems.map((item) => (
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
           {isAdmin && isAdminPage && (
                <>
                    <DropdownMenuSeparator className="my-4" />
                    <Button
                        variant='outline'
                        onClick={() => router.push('/dashboard')}
                        className="w-full flex items-center justify-start gap-3 px-3 py-2.5"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        Back to Main Site
                    </Button>
                </>
            )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3 lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="p-4 border-b border-border">
                    <Link href="/dashboard">
                      <Logo className="h-10 object-contain" />
                    </Link>
                  </div>
                  <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                    {navItems.map((item) => (
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
                    {isAdmin && isAdminPage && (
                        <>
                            <DropdownMenuSeparator className="my-4" />
                            <Button
                                variant='outline'
                                onClick={() => router.push('/dashboard')}
                                className="w-full flex items-center justify-start gap-3 px-3 py-2.5"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                Back to Main Site
                            </Button>
                        </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-1 lg:w-full lg:justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-2 hover:bg-muted rounded-lg relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                     {notificationCount > 0 && (
                      <span className="absolute top-1 right-1 h-4 w-4 text-xs flex items-center justify-center bg-accent text-accent-foreground rounded-full">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <NotificationsMenu />
                </DropdownMenuContent>
              </DropdownMenu>

               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={profile?.avatarUrl ?? user?.photoURL ?? ""} alt={userName} />
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
                    {isAdmin && !isAdminPage && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
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
