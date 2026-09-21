import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { PageLoader } from '@/components/feedback/page-loader';
import { useAuth } from '@/features/auth/use-auth';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
