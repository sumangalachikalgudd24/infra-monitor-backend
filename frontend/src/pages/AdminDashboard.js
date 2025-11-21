import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiFilter, FiSearch, FiDownload, FiPlus, FiAlertCircle, FiCheckCircle, FiClock, FiX, FiMenu, FiLogOut } from 'react-icons/fi';

// Mock data for demonstration
const mockReports = [
  {
    id: 1,
    title: 'Cracked Wall',
    description: 'Large crack in the west wall of building A',
    category: 'Structural',
    status: 'pending',
    priority: 'high',
    location: 'Building A, West Wall',
    date: '2023-11-20T10:30:00',
    image: 'https://images.unsplash.com/photo-1600585154340-6f29d2f1d9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    assignedTo: 'Civil Team',
  },
  {
    id: 2,
    title: 'Leaking Pipe',
    description: 'Water leakage in the first floor bathroom',
    category: 'Plumbing',
    status: 'in-progress',
    priority: 'high',
    location: 'First Floor, Men\'s Bathroom',
    date: '2023-11-19T14:15:00',
    image: 'https://images.unsplash.com/photo-1600566752225-6fdc6a7d6bf3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    assignedTo: 'Plumbing Team',
  },
  {
    id: 3,
    title: 'Broken Light',
    description: 'Light fixture not working in the hallway',
    category: 'Electrical',
    status: 'resolved',
    priority: 'medium',
    location: 'Second Floor, Main Hallway',
    date: '2023-11-18T09:45:00',
    image: 'https://images.unsplash.com/photo-1517991100323-030b3a3d4c5e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    assignedTo: 'Electrical Team',
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [workers, setWorkers] = useState([]);

  // Check if user is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    
    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/admin/login');
      return;
    }

    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/reports', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.success && Array.isArray(response.data.reports)) {
          const mappedReports = response.data.reports.map((report) => ({
            id: report.id,
            title: report.title,
            description: report.description,
            category: report.category,
            status: report.status,
            priority: report.priority || 'medium',
            location: report.location,
            date: report.created_at,
            image: report.image_path ? `http://localhost:5000${report.image_path}` : null,
            assignedTo: report.assigned_to,
          }));

          setReports(mappedReports);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      }
    };

    const fetchWorkers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/workers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.success && Array.isArray(response.data.workers)) {
          setWorkers(response.data.workers);
        }
      } catch (err) {
        console.error('Error fetching workers:', err);
      }
    };

    fetchReports();
    fetchWorkers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/admin/login');
  };

  const handleStatusChange = (reportId, newStatus) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: newStatus } : report
    ));
  };

  const handleAssign = async (reportId, workerName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !workerName) {
        return;
      }

      await axios.put(
        `http://localhost:5000/api/reports/${reportId}`,
        { assigned_to: workerName },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setReports(reports.map(report => 
        report.id === reportId ? { ...report, assignedTo: workerName } : report
      ));
    } catch (err) {
      console.error('Error assigning report:', err);
    }
  };

  const filteredReports = reports.filter(report => {
    // Filter by search term
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = filters.status === 'all' || report.status === filters.status;
    
    // Filter by priority
    const matchesPriority = filters.priority === 'all' || report.priority === filters.priority;
    
    // Filter by category
    const matchesCategory = filters.category === 'all' || report.category === filters.category;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'in-progress':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">In Progress</span>;
      case 'resolved':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Resolved</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">High</span>;
      case 'medium':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'low':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Low</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="mr-4 md:hidden text-gray-500 hover:text-gray-700"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-gray-700 hover:text-gray-900"
            >
              <FiLogOut className="mr-1" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-lg m-2 p-4">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Filters</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                >
                  <option value="all">All Categories</option>
                  <option value="Structural">Structural</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 pb-8">
          {/* Stats */}
          <div className="bg-white shadow">
            <div className="px-4 sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-8">
              <div className="py-6 md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    Reported Issues
                  </h2>
                </div>
                <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4">
                  <button
                    type="button"
                    className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => navigate('/report')}
                  >
                    <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                    New Report
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Search and filters */}
              <div className="mb-4 bg-white shadow rounded-lg p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="relative rounded-md shadow-sm flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2 border"
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={filters.priority}
                      onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <select
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                    >
                      <option value="all">All Categories</option>
                      <option value="Structural">Structural</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Reports list */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report) => (
                      <li key={report.id} className="hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-blue-600 truncate">
                              {report.title}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              {getStatusBadge(report.status)}
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                <FiAlertCircle className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                {report.category}
                              </p>
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <FiClock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                {new Date(report.date).toLocaleString()}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              {getPriorityBadge(report.priority)}
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {report.description}
                            </p>
                          </div>
                          <div className="mt-2 flex justify-between items-center">
                            <div className="flex items-center">
                              <p className="text-xs text-gray-500">
                                Assigned to: <span className="font-medium">{report.assignedTo}</span>
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <select
                                className="text-xs border border-gray-300 rounded-md p-1"
                                value={report.assignedTo || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setReports(reports.map(r => 
                                    r.id === report.id ? { ...r, assignedTo: value } : r
                                  ));
                                }}
                              >
                                <option value="">Unassigned</option>
                                {workers.map((worker) => (
                                  <option key={worker.id} value={worker.name}>
                                    {worker.name}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssign(report.id, report.assignedTo)}
                                className="text-xs text-green-600 hover:text-green-800 border border-green-600 px-2 py-1 rounded-md"
                              >
                                Assign
                              </button>
                              <button
                                onClick={() => navigate(`/admin/reports/${report.id}`)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-12 text-center">
                      <FiX className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your search or filter to find what you're looking for.
                      </p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
