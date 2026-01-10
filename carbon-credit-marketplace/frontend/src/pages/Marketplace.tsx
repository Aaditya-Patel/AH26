import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiX } from 'react-icons/hi';
import Layout from '../components/Layout';
import { marketplaceAPI } from '../api/client';
import { Listing } from '../types';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import { listingSchema, ListingFormData } from '../schemas/listing.schema';
import AnimatedInput from '../components/AnimatedInput';
import AnimatedButton from '../components/AnimatedButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { slideInRight, slideUp } from '../utils/animations';

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
      // Backend returns array directly
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

  const projectTypes = [
    'Renewable Energy',
    'Forestry',
    'Energy Efficiency',
    'Green Hydrogen',
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          {user?.user_type === 'seller' && (
            <AnimatedButton
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2"
            >
              {showAddForm ? (
                <>
                  <HiX className="w-5 h-5" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <HiPlus className="w-5 h-5" />
                  <span>List Credits</span>
                </>
              )}
            </AnimatedButton>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filter Listings</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vintage (Year)
              </label>
              <input
                type="number"
                min="2020"
                max="2030"
                value={filters.vintage}
                onChange={(e) => setFilters({ ...filters, vintage: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type
              </label>
              <select
                value={filters.project_type}
                onChange={(e) => setFilters({ ...filters, project_type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="">All Types</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.min_price}
                onChange={(e) => setFilters({ ...filters, min_price: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Any"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.max_price}
                onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Any"
              />
            </div>
          </div>
          <button
            onClick={() => setFilters({ vintage: '', project_type: '', min_price: '', max_price: '' })}
            className="mt-4 text-sm text-primary-600 hover:text-primary-700"
          >
            Clear Filters
          </button>
        </div>

        {/* Create Listing Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              className="bg-white rounded-lg shadow p-6 mb-8"
              variants={slideInRight}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h2 className="text-2xl font-semibold mb-6">Create New Listing</h2>
              <AnimatePresence>
                {errors.root && (
                  <motion.div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {errors.root.message}
                  </motion.div>
                )}
              </AnimatePresence>
              <form onSubmit={handleSubmit(onSubmitListing)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatedInput
                    {...register('quantity', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    label="Quantity (credits) *"
                    error={errors.quantity?.message}
                  />

                  <AnimatedInput
                    {...register('price_per_credit', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    label="Price per Credit (₹) *"
                    error={errors.price_per_credit?.message}
                  />

                  <AnimatedInput
                    {...register('vintage', { valueAsNumber: true })}
                    type="number"
                    min="2000"
                    max={new Date().getFullYear()}
                    label="Vintage (Year) *"
                    error={errors.vintage?.message}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Type *
                    </label>
                    <Controller
                      name="project_type"
                      control={control}
                      render={({ field }) => (
                        <motion.select
                          {...field}
                          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 ${
                            errors.project_type ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                          }`}
                          whileFocus={{ scale: 1.01 }}
                        >
                          <option value="">Select project type</option>
                          {projectTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </motion.select>
                      )}
                    />
                    {errors.project_type && (
                      <motion.p
                        className="mt-1 text-sm text-red-600"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {errors.project_type.message}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <motion.textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    placeholder="Add any additional details about your credit listing..."
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>

                <div className="flex space-x-4">
                  <AnimatedButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAddForm(false);
                      reset();
                    }}
                    disabled={isSubmitting}
                    className="flex-1 py-3"
                  >
                    Cancel
                  </AnimatedButton>
                  <AnimatedButton
                    type="submit"
                    isLoading={isSubmitting}
                    className="flex-1 py-3"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Listing'}
                  </AnimatedButton>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{listing.seller_name}</h3>
                    <p className="text-gray-600">{listing.project_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      ₹{listing.price_per_credit.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">per credit</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-lg font-semibold">{listing.quantity} credits</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vintage</p>
                    <p className="text-lg font-semibold">{listing.vintage}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {listing.verification_status}
                  </span>
                </div>

                {listing.description && (
                  <p className="text-gray-600 text-sm mb-4">{listing.description}</p>
                )}

                <button
                  onClick={() => showToast('Contact seller feature coming soon!', 'error')}
                  className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
                >
                  Contact Seller
                </button>
              </div>
            ))}
          </div>
        )}

        {listings.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-600">
            No listings available at the moment.
          </div>
        )}
      </div>
    </Layout>
  );
}
