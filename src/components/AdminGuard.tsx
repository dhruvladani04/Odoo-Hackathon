import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      
      if (!adminToken) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const adminData = JSON.parse(adminToken);
      
      // Check if token is still valid (24 hours)
      const tokenAge = Date.now() - adminData.loginTime;
      const isTokenValid = tokenAge < 24 * 60 * 60 * 1000; // 24 hours
      
      if (!isTokenValid) {
        localStorage.removeItem('admin_token');
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
    } catch (error) {
      localStorage.removeItem('admin_token');
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-gray-50 to-red-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/auth" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;