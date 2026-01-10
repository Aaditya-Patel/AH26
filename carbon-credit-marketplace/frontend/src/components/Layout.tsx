import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import Toast from './Toast';
import { HiMenu, HiX, HiHome, HiBookOpen, HiCalculator, HiUserGroup, HiShoppingBag, HiDocument, HiLogout } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { mobileMenu } from '../utils/animations';

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
                  <Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                    <HiHome className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/education" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                    <HiBookOpen className="w-5 h-5" />
                    <span>Learn</span>
                  </Link>
                  <Link to="/calculator" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                    <HiCalculator className="w-5 h-5" />
                    <span>Calculator</span>
                  </Link>
                  <Link to="/matching" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                    <HiUserGroup className="w-5 h-5" />
                    <span>Match</span>
                  </Link>
                  <Link to="/marketplace" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                    <HiShoppingBag className="w-5 h-5" />
                    <span>Marketplace</span>
                  </Link>
                  <Link to="/formalities" className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors">
                    <HiDocument className="w-5 h-5" />
                    <span>Formalities</span>
                  </Link>
                  <div className="text-gray-700 text-sm">
                    {user?.company_name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <HiLogout className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-gray-700 hover:text-primary-600 p-2 transition-colors"
                    aria-label="Toggle menu"
                  >
                    {mobileMenuOpen ? (
                      <HiX className="h-6 w-6" />
                    ) : (
                      <HiMenu className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isAuthenticated && mobileMenuOpen && (
              <motion.div
                className="md:hidden border-t border-gray-200 py-4"
                variants={mobileMenu}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-2 py-1 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiHome className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/education"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-2 py-1 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiBookOpen className="w-5 h-5" />
                    <span>Learn</span>
                  </Link>
                  <Link
                    to="/calculator"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-2 py-1 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiCalculator className="w-5 h-5" />
                    <span>Calculator</span>
                  </Link>
                  <Link
                    to="/matching"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-2 py-1 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiUserGroup className="w-5 h-5" />
                    <span>Match</span>
                  </Link>
                  <Link
                    to="/marketplace"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-2 py-1 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiShoppingBag className="w-5 h-5" />
                    <span>Marketplace</span>
                  </Link>
                  <Link
                    to="/formalities"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-2 py-1 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiDocument className="w-5 h-5" />
                    <span>Formalities</span>
                  </Link>
                  <div className="text-gray-700 px-2 py-1 text-sm border-t border-gray-200 pt-2 mt-2">
                    {user?.company_name}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-left transition-colors"
                  >
                    <HiLogout className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
