import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/store';

export default function Dashboard() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Welcome, {user.company_name}
        </h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">User Type</p>
            <p className="text-2xl font-bold capitalize">{user.user_type}</p>
          </div>
          {user.sector && (
            <div className="bg-white p-6 rounded-lg shadow">
              <p className="text-sm text-gray-600">Sector</p>
              <p className="text-2xl font-bold capitalize">{user.sector}</p>
            </div>
          )}
        </div>

        {/* Agent Links */}
        <h2 className="text-2xl font-bold mb-4">AI Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/education"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold mb-2">Education</h3>
            <p className="text-gray-600">Learn about carbon credits</p>
          </Link>

          <Link
            to="/calculator"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Calculator</h3>
            <p className="text-gray-600">Calculate your emissions</p>
          </Link>

          <Link
            to="/matching"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Matching</h3>
            <p className="text-gray-600">Find matched sellers</p>
          </Link>

          <Link
            to="/formalities"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Formalities</h3>
            <p className="text-gray-600">Government procedures</p>
          </Link>
        </div>

        {/* Marketplace Link */}
        <div className="mt-8">
          <Link
            to="/marketplace"
            className="block bg-primary-600 text-white text-center py-4 rounded-lg text-xl font-semibold hover:bg-primary-700"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    </Layout>
  );
}
