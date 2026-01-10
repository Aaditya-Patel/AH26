import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Carbon Credit Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI-powered platform for carbon credit trading with intelligent agents
            to guide you through emissions calculation, seller matching, and compliance.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold mb-2">Education Agent</h3>
            <p className="text-gray-600">
              Learn about carbon credits, regulations, and market dynamics
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Calculator Agent</h3>
            <p className="text-gray-600">
              Calculate your emissions and credit requirements
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Matching Agent</h3>
            <p className="text-gray-600">
              Find the perfect sellers based on your needs
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Formalities Advisor</h3>
            <p className="text-gray-600">
              Navigate government procedures and compliance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
