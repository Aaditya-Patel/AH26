import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { authAPI } from '../api/client';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import { loginSchema, LoginFormData } from '../schemas/login.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authAPI.login(data);
      const { user, access_token } = response.data;
      setAuth(user, access_token);
      showToast('Login successful!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed';
      setFormError('root', { message: errorMessage });
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-swachh-green-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-swachh-marigold-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-swachh-saffron/5 rounded-full blur-3xl pointer-events-none" />

      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Back to Home */}
      <Link 
        to="/" 
        className="fixed top-4 left-4 z-50 flex items-center space-x-2 glass px-4 py-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
      >
        <Leaf className="w-5 h-5 text-swachh-green-500" />
        <span className="font-medium">Carbon Market</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8" hover={false}>
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center mb-4 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            >
              <Leaf className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold font-display">
              Welcome <GradientText>Back</GradientText>
            </h2>
            <p className="text-muted-foreground mt-2">
              Sign in to continue trading carbon credits
            </p>
          </div>
          
          {/* Error Message */}
          <AnimatePresence>
            {errors.root && (
              <motion.div
                className="flex items-center space-x-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{errors.root.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className={cn(
                    "pl-10",
                    errors.email && "border-destructive focus:border-destructive"
                  )}
                  autoComplete="email"
                />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p
                    className="text-sm text-destructive flex items-center space-x-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.email.message}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  {...register('password')}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "pl-10",
                    errors.password && "border-destructive focus:border-destructive"
                  )}
                  autoComplete="current-password"
                />
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p
                    className="text-sm text-destructive flex items-center space-x-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.password.message}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-swachh-green-500 hover:text-swachh-green-600 font-medium hover:underline transition-colors"
            >
              Create Account
            </Link>
          </p>
        </GlassCard>

        {/* Swachh Bharat Badge */}
        <motion.div 
          className="flex items-center justify-center mt-6 space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-sm text-muted-foreground">Supporting</span>
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded-full bg-swachh-saffron" />
            <div className="w-4 h-4 rounded-full bg-white border border-border" />
            <div className="w-4 h-4 rounded-full bg-swachh-green-500" />
          </div>
          <span className="text-sm text-muted-foreground">Swachh Bharat</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
