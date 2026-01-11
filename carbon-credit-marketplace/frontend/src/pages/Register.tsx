import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail, Lock, Building2, ArrowRight, AlertCircle, User, Factory, FileText } from 'lucide-react';
import { authAPI } from '../api/client';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import { registerSchema, RegisterFormData } from '../schemas/register.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { ThemeToggle } from '@/components/ThemeToggle';
import DocumentUpload from '@/components/DocumentUpload';
import { cn } from '@/lib/utils';

const sectors = [
  { value: 'cement', label: 'Cement' },
  { value: 'iron_steel', label: 'Iron & Steel' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'aluminium', label: 'Aluminium' },
];

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
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
      pan_number: '',
      gstin: '',
      gci_registration_id: '',
    },
  });

  const userType = watch('user_type');

  const handleDocumentExtracted = (documentType: string, extractedData: any) => {
    // Auto-fill form fields from extracted data
    if (extractedData) {
      if (documentType === 'pan_card') {
        if (extractedData.pan_number) {
          setValue('pan_number', extractedData.pan_number.toUpperCase());
        }
      } else if (documentType === 'gstin') {
        if (extractedData.gstin) {
          setValue('gstin', extractedData.gstin.toUpperCase());
        }
      } else if (documentType === 'gci_certificate') {
        if (extractedData.registration_id) {
          setValue('gci_registration_id', extractedData.registration_id);
        }
      }
    }
  };

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-swachh-green-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-swachh-marigold-500/20 rounded-full blur-3xl pointer-events-none" />
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
        <span className="font-medium whitespace-nowrap">Carbon Market</span>
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
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold font-display">
              Create <GradientText>Account</GradientText>
            </h2>
            <p className="text-muted-foreground mt-2">
              Join the carbon credit marketplace
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
            {/* User Type Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account Type</Label>
              <Controller
                name="user_type"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'buyer', label: 'Buyer', icon: Building2, desc: 'Purchase credits' },
                      { value: 'seller', label: 'Seller', icon: Factory, desc: 'Sell credits' },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => field.onChange(option.value)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all duration-200 text-left",
                          field.value === option.value
                            ? "border-swachh-green-500 bg-swachh-green-500/10"
                            : "border-border hover:border-swachh-green-500/50 hover:bg-muted/50"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <option.icon className={cn(
                          "w-6 h-6 mb-2",
                          field.value === option.value ? "text-swachh-green-500" : "text-muted-foreground"
                        )} />
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.desc}</div>
                        {field.value === option.value && (
                          <motion.div
                            layoutId="user-type-indicator"
                            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-swachh-green-500"
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-sm font-medium">
                Company Name
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  {...register('company_name')}
                  id="company_name"
                  type="text"
                  placeholder="Your company name"
                  className={cn(
                    "pl-10",
                    errors.company_name && "border-destructive focus:border-destructive"
                  )}
                />
              </div>
              <AnimatePresence>
                {errors.company_name && (
                  <motion.p
                    className="text-sm text-destructive flex items-center space-x-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    <span>{errors.company_name.message}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Sector Field - Only for buyers */}
            <AnimatePresence>
              {userType === 'buyer' && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Label htmlFor="sector" className="text-sm font-medium">
                    Industry Sector
                  </Label>
                  <Controller
                    name="sector"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className={cn(
                          errors.sector && "border-destructive focus:border-destructive"
                        )}>
                          <Factory className="w-5 h-5 text-muted-foreground mr-2" />
                          <SelectValue placeholder="Select your sector" />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map((sector) => (
                            <SelectItem key={sector.value} value={sector.value}>
                              {sector.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <AnimatePresence>
                    {errors.sector && (
                      <motion.p
                        className="text-sm text-destructive flex items-center space-x-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.sector.message}</span>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

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
                  autoComplete="new-password"
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

            {/* Document Upload Section */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4 pt-4 border-t border-border"
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-swachh-green-500" />
                <h3 className="font-medium">Verification Documents</h3>
                <span className="text-xs text-muted-foreground">(Optional - can be added later)</span>
              </div>

              {/* PAN Card Upload */}
              <DocumentUpload
                documentType="pan_card"
                label="PAN Card"
                required={false}
                onExtractedData={(data) => handleDocumentExtracted('pan_card', data)}
              />

              {/* GSTIN Upload */}
              <DocumentUpload
                documentType="gstin"
                label="GSTIN Certificate"
                required={false}
                onExtractedData={(data) => handleDocumentExtracted('gstin', data)}
              />

              {/* GCI Certificate (Seller only) */}
              <AnimatePresence>
                {userType === 'seller' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <DocumentUpload
                      documentType="gci_certificate"
                      label="GCI Registry Certificate"
                      required={false}
                      onExtractedData={(data) => handleDocumentExtracted('gci_certificate', data)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Manual Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="pan_number" className="text-sm font-medium">
                    PAN Number
                  </Label>
                  <Input
                    {...register('pan_number')}
                    id="pan_number"
                    type="text"
                    placeholder="ABCDE1234F"
                    className={cn(
                      errors.pan_number && "border-destructive focus:border-destructive"
                    )}
                    onChange={(e) => setValue('pan_number', e.target.value.toUpperCase())}
                  />
                  {errors.pan_number && (
                    <p className="text-sm text-destructive">{errors.pan_number.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gstin" className="text-sm font-medium">
                    GSTIN
                  </Label>
                  <Input
                    {...register('gstin')}
                    id="gstin"
                    type="text"
                    placeholder="29ABCDE1234F1Z5"
                    className={cn(
                      errors.gstin && "border-destructive focus:border-destructive"
                    )}
                    onChange={(e) => setValue('gstin', e.target.value.toUpperCase())}
                  />
                  {errors.gstin && (
                    <p className="text-sm text-destructive">{errors.gstin.message}</p>
                  )}
                </div>

                {userType === 'seller' && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="gci_registration_id" className="text-sm font-medium">
                      GCI Registration ID
                    </Label>
                    <Input
                      {...register('gci_registration_id')}
                      id="gci_registration_id"
                      type="text"
                      placeholder="GCI Registration ID"
                    />
                  </div>
                )}
              </div>
            </motion.div>

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
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-muted-foreground">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-swachh-green-500 hover:text-swachh-green-600 font-medium hover:underline transition-colors"
            >
              Sign In
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
