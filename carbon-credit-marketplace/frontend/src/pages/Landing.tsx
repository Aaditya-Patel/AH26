import { Link } from 'react-router-dom';
 
export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Carbon Credit Marketplace
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
            AI-powered platform for carbon credit trading with intelligent agents
            to guide you through emissions calculation, seller matching, and compliance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-primary-600 text-white px-10 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white text-primary-600 px-10 py-4 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-all shadow-md hover:shadow-lg"
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