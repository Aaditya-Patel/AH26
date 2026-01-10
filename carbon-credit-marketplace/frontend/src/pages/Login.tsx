import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../api/client';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import { loginSchema, LoginFormData } from '../schemas/login.schema';
import AnimatedInput from '../components/AnimatedInput';
import AnimatedButton from '../components/AnimatedButton';
import { shake, fieldError } from '../utils/animations';

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
    <motion.div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="max-w-md w-full bg-white rounded-lg shadow-md p-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
        
        <AnimatePresence>
          {errors.root && (
            <motion.div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              variants={shake}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {errors.root.message}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatedInput
            {...register('email')}
            type="email"
            label="Email"
            error={errors.email?.message}
            autoComplete="email"
          />

          <AnimatedInput
            {...register('password')}
            type="password"
            label="Password"
            error={errors.password?.message}
            autoComplete="current-password"
          />

          <AnimatedButton
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-2"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </AnimatedButton>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
