import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import SellerCard from '../components/SellerCard';
import { matchingAPI } from '../api/client';
import { SellerMatch } from '../types';
import { useToast } from '../context/ToastContext';

export default function Matching() {
  const location = useLocation();
  const [formData, setFormData] = useState({
    credits_needed: '',
    max_price: '',
    preferred_vintage: '',
    preferred_project_type: '',
  });
  const [matches, setMatches] = useState<SellerMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Pre-fill form if navigated from Calculator
  useEffect(() => {
    if (location.state?.creditsNeeded) {
      setFormData((prev) => ({
        ...prev,
        credits_needed: location.state.creditsNeeded.toString(),
        max_price: location.state.costEstimate ? Math.ceil(location.state.costEstimate / location.state.creditsNeeded).toString() : '',
      }));
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await matchingAPI.find({
        credits_needed: parseInt(formData.credits_needed),
        max_price: formData.max_price ? parseFloat(formData.max_price) : undefined,
        preferred_vintage: formData.preferred_vintage ? parseInt(formData.preferred_vintage) : undefined,
        preferred_project_type: formData.preferred_project_type || undefined,
      });
      setMatches(response.data.matches || []);
      if ((response.data.matches || []).length === 0) {
        showToast('No matches found. Try adjusting your criteria.', 'error');
      }
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to find matches. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Find Matched Sellers</h1>

        {/* Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credits Needed *
              </label>
              <input
                type="number"
                value={formData.credits_needed}
                onChange={(e) => setFormData({ ...formData, credits_needed: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price (₹/credit)
              </label>
              <input
                type="number"
                value={formData.max_price}
                onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Vintage
              </label>
              <input
                type="number"
                value={formData.preferred_vintage}
                onChange={(e) => setFormData({ ...formData, preferred_vintage: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type
              </label>
              <select
                value={formData.preferred_project_type}
                onChange={(e) => setFormData({ ...formData, preferred_project_type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">Any</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Forestry">Forestry</option>
                <option value="Energy Efficiency">Energy Efficiency</option>
                <option value="Green Hydrogen">Green Hydrogen</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Finding matches...' : 'Find Matches'}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {matches.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Found {matches.length} Matches
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match, index) => (
                <SellerCard
                  key={match.listing_id}
                  seller={match}
                  index={index}
                  onContact={() => alert('Contact feature coming soon!')}
                />
              ))}
            </div>
          </div>
        )}

        {!loading && matches.length === 0 && formData.credits_needed && (
          <div className="text-center py-12 text-gray-600">
            No matches found. Try adjusting your criteria.
          </div>
        )}
      </div>
    </Layout>
  );
}
