import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import ReportForm from './components/ReportForm';
import ReportsList from './components/ReportsList';
import MobileLayout from './components/MobileLayout';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import ReportDetail from './pages/ReportDetail';

// Home component with modern design
const Home = ({ navigate }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">IW</div>
                <span className="ml-2 text-xl font-bold text-gray-800">InfraWatch</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/admin/login')}
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin Login
              </button>
              <button
                onClick={() => navigate('/report')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-300"
              >
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div className="mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                <span className="block">Transforming Infrastructure</span>
                <span className="block text-blue-600">Management</span>
              </h1>
              <p className="mt-3 text-xl text-gray-600">
                Report, track, and resolve infrastructure issues in real-time with our comprehensive management platform.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/report')}
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition duration-300 transform hover:scale-105"
                >
                  Report an Issue
                </button>
                <button
                  onClick={() => navigate('/reports')}
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition duration-300"
                >
                  View Reports
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative mx-auto w-full max-w-md">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg blur opacity-25"></div>
                  <div className="relative bg-white p-8 rounded-lg shadow-xl">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Reporting</h3>
                    <p className="text-gray-600">Report infrastructure issues in seconds with our intuitive interface.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose InfraWatch?
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              A comprehensive solution for all your infrastructure management needs
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'Real-time Updates',
                  description: 'Get instant notifications and updates on reported issues.',
                  icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                },
                {
                  name: 'Easy Tracking',
                  description: 'Track the status of all your reports in one place.',
                  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                },
                {
                  name: 'Mobile Friendly',
                  description: 'Access the platform from any device, anywhere.',
                  icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
                },
              ].map((feature) => (
                <div key={feature.name} className="pt-6">
                  <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-blue-500 rounded-md shadow-lg">
                          <svg
                            className="h-6 w-6 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={feature.icon}
                            />
                          </svg>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                        {feature.name}
                      </h3>
                      <p className="mt-5 text-base text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to improve your infrastructure?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Join thousands of users who trust InfraWatch for their infrastructure management needs.
          </p>
          <button
            onClick={() => navigate('/report')}
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-base text-gray-500">
            &copy; {new Date().getFullYear()} InfraWatch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
);

// Wrapper component to provide MobileLayout to all routes
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Don't show MobileLayout for admin pages
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/worker');
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" />
      
      <Routes>
        {/* Admin Routes */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/reports/:id" element={<ReportDetail />} />
        <Route path="/worker/dashboard" element={<WorkerDashboard />} />
        
        {/* Public Routes */}
        <Route path="/*" element={
          <MobileLayout>
            <Routes>
              <Route path="/" element={<Home navigate={navigate} />} />
              <Route path="/report" element={<ReportForm />} />
              <Route path="/reports" element={<ReportsList />} />
              <Route path="/reports/:id" element={<ReportDetail />} />
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </MobileLayout>
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
