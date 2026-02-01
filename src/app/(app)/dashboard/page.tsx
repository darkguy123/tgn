'use client';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { Skeleton } from '@/components/ui/skeleton';
import { MenteeDashboard, MentorDashboard, PartnerDashboard, AdminDashboard } from '@/components/dashboards';
import { isUserAdmin } from '@/lib/auth-utils';

const Dashboard = () => {
  const { profile, isLoading: isProfileLoading } = useMemberProfile();
  
  if (isProfileLoading || !profile) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
      </div>
    );
  }

  const isAdmin = isUserAdmin(profile);
  
  const renderDashboardByRole = () => {
    switch (profile.role) {
      case 'mentee':
        return <MenteeDashboard />;
      case 'mentor-candidate':
      case 'associate-mentor':
        return <MentorDashboard />;
      case 'collaborator':
      case 'sponsor':
      case 'volunteer':
      case 'media':
      case 'country-manager':
        // A country manager might also be a partner, so they see both views.
        return <PartnerDashboard />;
      default:
        return <MenteeDashboard />; // Default to mentee dashboard
    }
  };

  return (
      <>
        {isAdmin && <AdminDashboard />}
        {renderDashboardByRole()}
      </>
  );
};

export default Dashboard;
