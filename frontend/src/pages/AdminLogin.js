import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiLock, 
  FiUser, 
  FiShield, 
  FiTool, 
  FiDroplet, 
  FiZap,
  FiSettings,
  FiThermometer,
  FiTruck,
  FiArrowLeft
} from 'react-icons/fi';
import axios from 'axios';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('admin'); // 'admin' or specific worker type
  const [workerType, setWorkerType] = useState('plumber'); // Default worker type
  const navigate = useNavigate();

  const workerTypes = [
    { id: 'plumber', name: 'Plumber', icon: <FiDroplet /> },
    { id: 'electrician', name: 'Electrician', icon: <FiZap /> },
    { id: 'carpenter', name: 'Carpenter', icon: <FiTool /> },
    { id: 'hvac', name: 'HVAC Technician', icon: <FiThermometer /> },
    { id: 'handyman', name: 'Handyman', icon: <FiSettings /> }
  ];

  const getWorkerCredentials = (type) => {
    const credentials = {
      plumber: { username: 'plumber1', password: 'plumber123' },
      electrician: { username: 'electrician1', password: 'electrician123' },
      carpenter: { username: 'carpenter1', password: 'carpenter123' },
      hvac: { username: 'hvac1', password: 'hvac123' },
      handyman: { username: 'handyman1', password: 'handyman123' }
    };
    return credentials[type] || {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    let loginUsername = username;
    let loginPassword = password;
    
    // If logging in as a worker, use the predefined credentials for the selected type
    if (loginType === 'worker') {
      const credentials = getWorkerCredentials(workerType);
      loginUsername = credentials.username || '';
      loginPassword = credentials.password || '';
    }
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username: loginUsername,
        password: loginPassword
      });
      
      if (response.data.success) {
        // Store the token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', response.data.user.role);
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/worker/dashboard');
        }
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {loginType === 'admin' ? 'Admin' : 'Worker'} Sign In
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Login Type Toggle */}
          <div className="mb-6">
            <div className="flex rounded-md shadow-sm mb-4">
              <button
                type="button"
                onClick={() => setLoginType('admin')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md ${
                  loginType === 'admin' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiShield className="inline mr-2" />
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => setLoginType('worker')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md ${
                  loginType === 'worker'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiTool className="inline mr-2" />
                Worker Login
              </button>
            </div>
            
            {loginType === 'worker' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Worker Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {workerTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setWorkerType(type.id)}
                      className={`flex items-center justify-center p-3 rounded-md border ${
                        workerType === type.id
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-2">{type.icon}</span>
                      {type.name}
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">Note:</span> Click on the worker type above to select your role.
                    {workerType && (
                      <span className="block mt-1">
                        Logging in as: <span className="font-semibold">
                          {workerTypes.find(t => t.id === workerType)?.name}
                        </span>
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder={loginType === 'admin' ? 'Enter admin username' : 'Enter worker username'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loginType === 'admin' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  loginType === 'admin' ? 'focus:ring-blue-500' : 'focus:ring-green-500'
                }`}
              >
                Sign in as {loginType === 'admin' ? 'Admin' : 'Worker'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
