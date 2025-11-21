import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock, 
  FiLogOut, 
  FiMenu, 
  FiDownload, 
  FiTool, 
  FiDroplet, 
  FiZap, 
  FiHome,
  FiUser
} from 'react-icons/fi';
import axios from 'axios';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);

  // Check if user is authenticated as a worker
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    
    if (!isAuthenticated || userRole !== 'worker') {
      navigate('/admin/login');
      return;
    }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/reports', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.success && Array.isArray(response.data.reports)) {
          const mappedTasks = response.data.reports.map((report) => ({
            id: report.id,
            title: report.title,
            description: report.description,
            category: report.category,
            status: report.status,
            priority: report.priority || 'medium',
            location: report.location,
            date: report.created_at,
            dueDate: report.created_at,
            completedDate: report.completed_at,
            image: report.image_path ? `http://localhost:5000${report.image_path}` : null,
            notes: '',
          }));

          setTasks(mappedTasks);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/admin/login');
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}/status`,
        { status: newStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { 
            ...task, 
            status: newStatus,
            updated_at: new Date().toISOString(),
            ...(newStatus === 'completed' && {
              completed_at: new Date().toISOString(),
              completed_by: JSON.parse(localStorage.getItem('user'))?.name
            })
          } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status');
    }
  };

  const addNoteToTask = (taskId) => {
    if (!newNote.trim()) return;
    
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedNotes = task.notes 
          ? `${task.notes}\n${new Date().toLocaleString()}: ${newNote}`
          : `${new Date().toLocaleString()}: ${newNote}`;
        return { ...task, notes: updatedNotes };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    setNewNote('');
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    return task.status === activeTab;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      'completed': {
        text: 'Completed',
        icon: <FiCheckCircle className="mr-1" />,
        className: 'bg-green-100 text-green-800'
      },
      'in-progress': {
        text: 'In Progress',
        icon: <FiClock className="mr-1" />,
        className: 'bg-blue-100 text-blue-800'
      },
      'pending': {
        text: 'Pending',
        icon: <FiAlertCircle className="mr-1" />,
        className: 'bg-yellow-100 text-yellow-800'
      }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.icon} {config.text}
      </span>
    );
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const viewTaskDetails = (task) => {
    setSelectedTask(task);
  };

  const closeTaskDetails = () => {
    setSelectedTask(null);
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
            <h1 className="text-xl font-bold text-gray-900">Worker Dashboard</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <FiAlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{tasks.length}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <FiClock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {tasks.filter(t => t.status === 'in-progress').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <FiCheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {tasks.filter(t => t.status === 'completed').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <FiAlertCircle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">High Priority</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {tasks.filter(t => t.priority === 'high').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'pending' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FiClock className="mr-1.5 h-4 w-4" />
              Pending
              <span className="ml-1.5 py-0.5 px-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                {tasks.filter(t => t.status === 'pending').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('in-progress')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'in-progress' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FiAlertCircle className="mr-1.5 h-4 w-4" />
              In Progress
              <span className="ml-1.5 py-0.5 px-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {tasks.filter(t => t.status === 'in-progress').length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'completed' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              <FiCheckCircle className="mr-1.5 h-4 w-4" />
              Completed
              <span className="ml-1.5 py-0.5 px-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {tasks.filter(t => t.status === 'completed').length}
              </span>
            </button>
          </nav>
        </div>

        {/* Task List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {filteredTasks.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <li key={task.id} className="hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(task.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(task.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {task.status === 'pending' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in-progress')}
                            className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Start Task
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="px-2 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <FiAlertCircle className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          {task.category}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <FiClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          Due: {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {task.description}
                      </p>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex space-x-3">
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'in-progress')}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded ${task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'text-blue-700 bg-blue-50 hover:bg-blue-100'}`}
                          >
                            Start Work
                          </button>
                        )}
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                          >
                            Mark Complete
                          </button>
                        )}
                        <button
                          onClick={() => viewTaskDetails(task)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Details
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        {task.status === 'completed' && (
                          <span>Completed on {formatDate(task.completedDate)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <FiCheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {activeTab === 'all' 
                  ? 'You don\'t have any tasks assigned yet.' 
                  : `You don't have any ${activeTab.replace('-', ' ')} tasks.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedTask.title}
                      </h3>
                      <button
                        type="button"
                        onClick={closeTaskDetails}
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                      >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {selectedTask.description}
                      </p>
                      
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Location</h4>
                          <p className="mt-1 text-sm text-gray-900">{selectedTask.location}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Category</h4>
                          <p className="mt-1 text-sm text-gray-900">{selectedTask.category}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Status</h4>
                          <p className="mt-1">{getStatusBadge(selectedTask.status)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                          <p className="mt-1">{getPriorityBadge(selectedTask.priority)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Reported On</h4>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTask.date)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTask.dueDate)}</p>
                        </div>
                      </div>
                      
                      {selectedTask.image && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Image</h4>
                          <img 
                            src={selectedTask.image} 
                            alt={selectedTask.title} 
                            className="h-48 w-full object-cover rounded-md"
                          />
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                        {selectedTask.notes ? (
                          <div className="bg-gray-50 p-3 rounded-md">
                            {selectedTask.notes.split('\n').map((note, i) => (
                              <p key={i} className="text-sm text-gray-700 mb-1">{note}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No notes available</p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <label htmlFor="newNote" className="block text-sm font-medium text-gray-700">
                          Add Note
                        </label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            name="newNote"
                            id="newNote"
                            className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                            placeholder="Add a note about this task..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addNoteToTask(selectedTask.id)}
                          />
                          <button
                            type="button"
                            onClick={() => addNoteToTask(selectedTask.id)}
                            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedTask.status !== 'completed' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        updateTaskStatus(selectedTask.id, 'completed');
                        closeTaskDetails();
                      }}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Mark as Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateTaskStatus(selectedTask.id, 'in-progress');
                        closeTaskDetails();
                      }}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {selectedTask.status === 'in-progress' ? 'Working On It' : 'Start Working'}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={closeTaskDetails}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
