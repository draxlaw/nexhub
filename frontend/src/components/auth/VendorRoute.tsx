import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../../store';
import LoadingSpinner from '../ui/LoadingSpinner';

interface VendorRouteProps {
  children: React.ReactNode;
}

const VendorRoute = ({ children }: VendorRouteProps) => {
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'vendor') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default VendorRoute;
