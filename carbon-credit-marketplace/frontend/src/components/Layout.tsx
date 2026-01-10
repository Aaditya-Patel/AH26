import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import Toast from './Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Calculator, 
  Users, 
  ShoppingBag, 
  FileText, 
  LogOut,
  Leaf,
  User,
  ArrowLeftRight,
  Wallet,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { GradientText } from './GradientText';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/marketplace', icon: ShoppingBag, label: 'Marketplace' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { path: '/portfolio', icon: Wallet, label: 'Portfolio' },
  { path: '/compliance', icon: ClipboardCheck, label: 'Compliance' },
  { path: '/calculator', icon: Calculator, label: 'Calculator' },
  { path: '/matching', icon: Users, label: 'Match' },
  { path: '/education', icon: BookOpen, label: 'Learn' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toasts, dismissToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      
      {/* Gradient Orbs */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-swachh-green-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-swachh-marigold-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Glassmorphism Navbar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Leaf className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold font-display hidden sm:block whitespace-nowrap">
                <GradientText>Carbon Market</GradientText>
              </span>
            </Link>
            
            {isAuthenticated && (
              <>
                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center space-x-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive(item.path)
                          ? "bg-swachh-green-500/10 text-swachh-green-600 dark:text-swachh-green-400"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {isActive(item.path) && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-swachh-green-500"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </Link>
                  ))}
                </div>

                {/* Right side controls */}
                <div className="flex items-center space-x-3">
                  <ThemeToggle />
                  
                  {/* User info - Desktop */}
                  <div className="hidden md:flex items-center space-x-2 glass px-3 py-1.5 rounded-lg">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium truncate max-w-[120px]">
                      {user?.company_name}
                    </span>
                  </div>
                  
                  {/* Logout button */}
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="hidden md:flex"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>

                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Toggle menu"
                  >
                    <motion.div
                      animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {mobileMenuOpen ? (
                        <X className="h-6 w-6" />
                      ) : (
                        <Menu className="h-6 w-6" />
                      )}
                    </motion.div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isAuthenticated && mobileMenuOpen && (
              <motion.div
                className="lg:hidden border-t border-border/50 py-4 glass-card rounded-b-xl -mx-4 px-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col space-y-1">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                          isActive(item.path)
                            ? "bg-swachh-green-500/10 text-swachh-green-600 dark:text-swachh-green-400"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {/* Mobile user info */}
                  <div className="border-t border-border/50 pt-4 mt-2">
                    <div className="flex items-center space-x-3 px-4 py-2 glass rounded-lg mb-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{user?.company_name}</span>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="destructive"
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </AnimatePresence>
      </div>

      {/* Content */}
      <main className="pt-20 min-h-screen relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
