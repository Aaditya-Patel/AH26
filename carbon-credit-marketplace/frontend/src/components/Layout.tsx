import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import Toast from './Toast';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { toasts, dismissToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
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
              <>
                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-4">
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
                  <div className="text-gray-700 text-sm">
                    {user?.company_name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                  >
                    Logout
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-gray-700 hover:text-primary-600 p-2"
                    aria-label="Toggle menu"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {mobileMenuOpen ? (
                        <path d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          {isAuthenticated && mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-2">
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-primary-600 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/education"
                  className="text-gray-700 hover:text-primary-600 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Learn
                </Link>
                <Link
                  to="/calculator"
                  className="text-gray-700 hover:text-primary-600 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Calculator
                </Link>
                <Link
                  to="/matching"
                  className="text-gray-700 hover:text-primary-600 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Match
                </Link>
                <Link
                  to="/marketplace"
                  className="text-gray-700 hover:text-primary-600 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Marketplace
                </Link>
                <Link
                  to="/formalities"
                  className="text-gray-700 hover:text-primary-600 px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Formalities
                </Link>
                <div className="text-gray-700 px-2 py-1 text-sm border-t border-gray-200 pt-2 mt-2">
                  {user?.company_name}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
