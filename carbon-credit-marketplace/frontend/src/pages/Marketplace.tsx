import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { marketplaceAPI } from '../api/client';
import { Listing } from '../types';
import { useAuthStore } from '../store/store';

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const response = await marketplaceAPI.getListings();
      setListings(response.data);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <div className="text-center py-12">Loading...</div>
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
                  onClick={() => alert('Contact seller feature coming soon!')}
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
