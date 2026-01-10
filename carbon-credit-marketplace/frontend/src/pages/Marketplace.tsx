import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { marketplaceAPI } from '../api/client';
import { Listing } from '../types';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '',
    price_per_credit: '',
    vintage: new Date().getFullYear().toString(),
    project_type: '',
    description: '',
  });
  const { user } = useAuthStore();
  const { showToast } = useToast();

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

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await marketplaceAPI.createListing({
        quantity: parseInt(formData.quantity),
        price_per_credit: parseFloat(formData.price_per_credit),
        vintage: parseInt(formData.vintage),
        project_type: formData.project_type,
        description: formData.description || undefined,
      });
      // Reset form
      setFormData({
        quantity: '',
        price_per_credit: '',
        vintage: new Date().getFullYear().toString(),
        project_type: '',
        description: '',
      });
      setShowAddForm(false);
      // Reload listings
      await loadListings();
      alert('Listing created successfully!');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create listing. Please try again.');
    } finally {
      setFormLoading(false);
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
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              {showAddForm ? 'Cancel' : 'List Credits'}
            </button>
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
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Create New Listing</h2>
            <form onSubmit={handleSubmitListing} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity (credits) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Credit (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price_per_credit}
                    onChange={(e) => setFormData({ ...formData, price_per_credit: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vintage (Year) *
                  </label>
                  <input
                    type="number"
                    min="2020"
                    max="2030"
                    value={formData.vintage}
                    onChange={(e) => setFormData({ ...formData, vintage: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type *
                  </label>
                  <select
                    value={formData.project_type}
                    onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    required
                  >
                    <option value="">Select project type</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="Add any additional details about your credit listing..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {formLoading ? 'Creating...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        )}

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
