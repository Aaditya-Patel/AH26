import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Plus, 
  X, 
  Filter, 
  Leaf, 
  IndianRupee, 
  Calendar,
  Building2,
  CheckCircle,
  Mail,
  AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { marketplaceAPI } from '../api/client';
import { Listing } from '../types';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import { listingSchema, ListingFormData } from '../schemas/listing.schema';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '../utils/animations';

const projectTypes = [
  'Renewable Energy',
  'Forestry',
  'Energy Efficiency',
  'Green Hydrogen',
];

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filters, setFilters] = useState({
    vintage: '',
    project_type: '',
    min_price: '',
    max_price: '',
  });
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      quantity: 0,
      price_per_credit: 0,
      vintage: new Date().getFullYear(),
      project_type: '',
      description: '',
    },
  });

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const response = await marketplaceAPI.getListings();
      setListings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitListing = async (data: ListingFormData) => {
    try {
      await marketplaceAPI.createListing({
        quantity: data.quantity,
        price_per_credit: data.price_per_credit,
        vintage: data.vintage,
        project_type: data.project_type,
        description: data.description || undefined,
      });
      reset();
      setShowAddForm(false);
      await loadListings();
      showToast('Listing created successfully!', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to create listing. Please try again.';
      setFormError('root', { message: errorMessage });
      showToast(errorMessage, 'error');
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (filters.vintage && listing.vintage !== parseInt(filters.vintage)) return false;
    if (filters.project_type && listing.project_type !== filters.project_type) return false;
    if (filters.min_price && listing.price_per_credit < parseFloat(filters.min_price)) return false;
    if (filters.max_price && listing.price_per_credit > parseFloat(filters.max_price)) return false;
    return true;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-swachh-green-500 to-swachh-green-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">
                <GradientText>Marketplace</GradientText>
              </h1>
              <p className="text-muted-foreground">Browse and list carbon credits</p>
            </div>
          </div>
          
          {user?.user_type === 'seller' && (
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? 'outline' : 'gradient'}
            >
              {showAddForm ? (
                <>
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  List Credits
                </>
              )}
            </Button>
          )}
        </motion.div>

        {/* Filters */}
        <GlassCard className="p-6 mb-6" hover={false}>
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="w-5 h-5 text-swachh-green-500" />
            <h2 className="text-lg font-semibold font-display">Filter Listings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-swachh-marigold-500" />
                <span>Vintage (Year)</span>
              </Label>
              <Input
                type="number"
                min="2020"
                max="2030"
                value={filters.vintage}
                onChange={(e) => setFilters({ ...filters, vintage: e.target.value })}
                placeholder="Any"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-swachh-green-600" />
                <span>Project Type</span>
              </Label>
              <Select
                value={filters.project_type}
                onValueChange={(value) => setFilters({ ...filters, project_type: value === 'all' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <IndianRupee className="w-4 h-4 text-swachh-saffron" />
                <span>Min Price (₹)</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={filters.min_price}
                onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                placeholder="Any"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <IndianRupee className="w-4 h-4 text-swachh-saffron" />
                <span>Max Price (₹)</span>
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={filters.max_price}
                onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                placeholder="Any"
              />
            </div>
          </div>

          <button
            onClick={() => setFilters({ vintage: '', project_type: '', min_price: '', max_price: '' })}
            className="mt-4 text-sm text-swachh-green-500 hover:text-swachh-green-600 transition-colors"
          >
            Clear Filters
          </button>
        </GlassCard>

        {/* Create Listing Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <GlassCard className="p-6" hover={false}>
                <h2 className="text-2xl font-bold font-display mb-6">
                  Create New <GradientText>Listing</GradientText>
                </h2>
                
                <AnimatePresence>
                  {errors.root && (
                    <motion.div
                      className="flex items-center space-x-2 bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span>{errors.root.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmitListing)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="flex items-center space-x-2">
                        <Leaf className="w-4 h-4 text-swachh-green-500" />
                        <span>Quantity (credits) *</span>
                      </Label>
                      <Input
                        {...register('quantity', { valueAsNumber: true })}
                        id="quantity"
                        type="number"
                        min="1"
                        className={cn(errors.quantity && "border-destructive")}
                      />
                      {errors.quantity && (
                        <p className="text-sm text-destructive">{errors.quantity.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price" className="flex items-center space-x-2">
                        <IndianRupee className="w-4 h-4 text-swachh-marigold-500" />
                        <span>Price per Credit (₹) *</span>
                      </Label>
                      <Input
                        {...register('price_per_credit', { valueAsNumber: true })}
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        className={cn(errors.price_per_credit && "border-destructive")}
                      />
                      {errors.price_per_credit && (
                        <p className="text-sm text-destructive">{errors.price_per_credit.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vintage" className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-swachh-saffron" />
                        <span>Vintage (Year) *</span>
                      </Label>
                      <Input
                        {...register('vintage', { valueAsNumber: true })}
                        id="vintage"
                        type="number"
                        min="2000"
                        max={new Date().getFullYear()}
                        className={cn(errors.vintage && "border-destructive")}
                      />
                      {errors.vintage && (
                        <p className="text-sm text-destructive">{errors.vintage.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center space-x-2">
                        <Building2 className="w-4 h-4 text-swachh-green-600" />
                        <span>Project Type *</span>
                      </Label>
                      <Controller
                        name="project_type"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={cn(errors.project_type && "border-destructive")}>
                              <SelectValue placeholder="Select project type" />
                            </SelectTrigger>
                            <SelectContent>
                              {projectTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.project_type && (
                        <p className="text-sm text-destructive">{errors.project_type.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <textarea
                      {...register('description')}
                      id="description"
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-swachh-green-500/20 focus:border-swachh-green-500 transition-all"
                      placeholder="Add any additional details about your credit listing..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        reset();
                      }}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      ) : (
                        <Plus className="w-5 h-5 mr-2" />
                      )}
                      {isSubmitting ? 'Creating...' : 'Create Listing'}
                    </Button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <GlassCard key={i} className="p-6" hover={false}>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Listings Grid */}
        {!loading && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredListings.map((listing, index) => (
              <motion.div key={listing.id} variants={staggerItem}>
                <GlassCard className="p-6 h-full" glow={index % 3 === 0 ? 'green' : index % 3 === 1 ? 'orange' : 'none'}>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold font-display">{listing.seller_name}</h3>
                      <p className="text-sm text-muted-foreground">{listing.project_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        <GradientText>₹{listing.price_per_credit.toLocaleString()}</GradientText>
                      </p>
                      <p className="text-xs text-muted-foreground">per credit</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="glass rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-swachh-green-500">{listing.quantity}</p>
                      <p className="text-xs text-muted-foreground">Credits Available</p>
                    </div>
                    <div className="glass rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-swachh-marigold-500">{listing.vintage}</p>
                      <p className="text-xs text-muted-foreground">Vintage Year</p>
                    </div>
                  </div>

                  {/* Verification Badge */}
                  <div className="mb-4">
                    <Badge variant="default" className="flex items-center space-x-1 w-fit">
                      <CheckCircle className="w-3 h-3" />
                      <span>{listing.verification_status}</span>
                    </Badge>
                  </div>

                  {/* Description */}
                  {listing.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  {/* Contact Button */}
                  <Button
                    variant="gradient"
                    className="w-full"
                    onClick={() => showToast('Contact seller feature coming soon!', 'error')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Button>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredListings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Listings Found</h3>
            <p className="text-muted-foreground mb-6">
              {Object.values(filters).some(Boolean)
                ? 'Try adjusting your filters to see more listings'
                : 'No listings available at the moment'}
            </p>
            {Object.values(filters).some(Boolean) && (
              <Button
                variant="outline"
                onClick={() => setFilters({ vintage: '', project_type: '', min_price: '', max_price: '' })}
              >
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
