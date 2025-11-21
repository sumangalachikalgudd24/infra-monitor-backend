import React from 'react';
import { FiHome, FiPlusCircle, FiUser, FiMenu } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-500' : 'text-gray-600';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-2 shadow-lg">
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center p-2 ${isActive('/')}`}
        >
          <FiHome className="text-xl" />
          <span className="text-xs mt-1">Home</span>
        </button>
        
        <button
          onClick={() => navigate('/report')}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 text-white -mt-6 shadow-lg"
        >
          <FiPlusCircle className="text-2xl" />
        </button>
        
        <button
          onClick={() => navigate('/admin/login')}
          className={`flex flex-col items-center p-2 ${isActive('/admin/login')}`}
        >
          <FiUser className="text-xl" />
          <span className="text-xs mt-1">Admin</span>
        </button>
      </nav>

      {/* Mobile Menu Toggle (for future use) */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <button
          className="p-2 rounded-full bg-white shadow-lg"
          onClick={() => {
            // Add mobile menu toggle functionality here
            console.log('Menu clicked');
          }}
        >
          <FiMenu className="text-gray-700 text-xl" />
        </button>
      </div>
    </div>
  );
};

export default MobileLayout;
