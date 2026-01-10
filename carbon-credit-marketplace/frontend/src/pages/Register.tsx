import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../api/client';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import { registerSchema, RegisterFormData } from '../schemas/register.schema';
import AnimatedInput from '../components/AnimatedInput';
import AnimatedButton from '../components/AnimatedButton';
import { shake, slideUp } from '../utils/animations';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      user_type: 'buyer',
      email: '',
      password: '',
      company_name: '',
      sector: '',
    },
  });

  const userType = watch('user_type');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await authAPI.register(data);
      const { user, access_token } = response.data;
      setAuth(user, access_token);
      showToast('Registration successful!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Registration failed';
      setFormError('root', { message: errorMessage });
      showToast(errorMessage, 'error');
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12"
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
        <h2 className="text-3xl font-bold text-center mb-8">Register</h2>
        
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Type
            </label>
            <Controller
              name="user_type"
              control={control}
              render={({ field }) => (
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="buyer"
                      checked={field.value === 'buyer'}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="mr-2"
                    />
                    Buyer
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="seller"
                      checked={field.value === 'seller'}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="mr-2"
                    />
                    Seller
                  </label>
                </div>
              )}
            />
            {errors.user_type && (
              <motion.p
                className="mt-1 text-sm text-red-600"
                variants={fieldError}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {errors.user_type.message}
              </motion.p>
            )}
          </div>

          <AnimatedInput
            {...register('company_name')}
            type="text"
            label="Company Name"
            error={errors.company_name?.message}
          />

          <AnimatePresence>
            {userType === 'buyer' && (
              <motion.div
                variants={slideUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector
                </label>
                <motion.select
                  {...register('sector')}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                    errors.sector ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  whileFocus={{ scale: 1.01 }}
                >
                  <option value="">Select Sector</option>
                  <option value="cement">Cement</option>
                  <option value="iron_steel">Iron & Steel</option>
                  <option value="textiles">Textiles</option>
                  <option value="fertilizer">Fertilizer</option>
                  <option value="aluminium">Aluminium</option>
                </motion.select>
                {errors.sector && (
                  <motion.p
                    className="mt-1 text-sm text-red-600"
                    variants={fieldError}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {errors.sector.message}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

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
            autoComplete="new-password"
          />

          <AnimatedButton
            type="submit"
            isLoading={isSubmitting}
            className="w-full py-2"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </AnimatedButton>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
}
