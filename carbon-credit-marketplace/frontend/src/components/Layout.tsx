import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/store';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary-600">
                Carbon Market
              </Link>
            </div>
            
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link to="/education" className="text-gray-700 hover:text-primary-600">
                  Learn
                </Link>
                <Link to="/calculator" className="text-gray-700 hover:text-primary-600">
                  Calculator
                </Link>
                <Link to="/matching" className="text-gray-700 hover:text-primary-600">
                  Match
                </Link>
                <Link to="/marketplace" className="text-gray-700 hover:text-primary-600">
                  Marketplace
                </Link>
                <Link to="/formalities" className="text-gray-700 hover:text-primary-600">
                  Formalities
                </Link>
                <div className="text-gray-700">
                  {user?.company_name}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
