import { useAuth } from '../context/AuthContext';
import { useOutlet as useOutletContext } from '../context/OutletContext';

export function useOutlet() {
  const { userProfile, user, isAuthenticated } = useAuth();
  const { outlet, loading: outletLoading, refreshOutlet } = useOutletContext();

  return {
    outlet,
    outletId: userProfile?.outlet_id || null,
    userId: user?.id || null,
    userRole: userProfile?.role || null,
    userName: userProfile?.name || null,
    isAuthenticated,
    userEmail: user?.email || null,
    loading: outletLoading,
    refreshOutlet
  };
}
