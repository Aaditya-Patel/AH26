import { Link } from 'react-router-dom';
 
export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-200">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">
              Carbon Market
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
 
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
 
        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Education Agent</h3>
            <p className="text-gray-600 leading-relaxed">
              Learn about carbon credits, regulations, and market dynamics
            </p>
          </div>
         
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Calculator Agent</h3>
            <p className="text-gray-600 leading-relaxed">
              Calculate your emissions and credit requirements
            </p>
          </div>
         
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Matching Agent</h3>
            <p className="text-gray-600 leading-relaxed">
              Find the perfect sellers based on your needs
            </p>
          </div>
         
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Formalities Advisor</h3>
            <p className="text-gray-600 leading-relaxed">
              Navigate government procedures and compliance
            </p>
          </div>
        </div>
      </div>
 
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Carbon Credit Marketplace. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}