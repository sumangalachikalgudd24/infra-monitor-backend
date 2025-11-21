import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiEdit, FiTrash2, FiClock, FiCheckCircle, FiAlertCircle, FiX, FiMessageSquare } from 'react-icons/fi';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    assignedTo: ''
  });

  // Mock data - in a real app, this would be an API call
  const mockReport = {
    id: id,
    title: 'Cracked Wall',
    description: 'Large crack in the west wall of building A, approximately 2 inches wide and 3 feet long. The crack appears to be growing over time.',
    category: 'Structural',
    status: 'in-progress',
    priority: 'high',
    location: 'Building A, West Wall, First Floor',
    date: '2023-11-20T10:30:00',
    updatedAt: '2023-11-21T14:15:00',
    assignedTo: 'Civil Team',
    reporter: 'John Doe (johndoe@example.com)',
    images: [
      'https://images.unsplash.com/photo-1600585154340-6f29d2f1d9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    notes: [
      {
        id: 1,
        text: 'Initial assessment completed. The crack appears to be structural and requires professional evaluation.',
        author: 'Civil Team',
        timestamp: '2023-11-20T14:22:00',
        isInternal: true
      },
      {
        id: 2,
        text: 'Temporary support has been added to prevent further damage. Waiting for structural engineer report.',
        author: 'Civil Team',
        timestamp: '2023-11-21T10:15:00',
        isInternal: true
      }
    ]
  };

  useEffect(() => {
    // Simulate API call
    const fetchReport = async () => {
      try {
        // In a real app: const response = await fetch(`/api/reports/${id}`);
        // const data = await response.json();
        // setReport(data);
        
        // Using mock data for now
        setReport(mockReport);
        setEditData({
          title: mockReport.title,
          description: mockReport.description,
          status: mockReport.status,
          priority: mockReport.priority,
          assignedTo: mockReport.assignedTo
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to load report details');
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleStatusChange = (newStatus) => {
    // In a real app, this would be an API call
    setReport(prev => ({
      ...prev,
      status: newStatus,
      updatedAt: new Date().toISOString()
    }));
    setEditData(prev => ({ ...prev, status: newStatus }));
    
    // Show success message
    alert(`Status updated to ${newStatus}`);
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    const newNoteObj = {
      id: Date.now(),
      text: newNote,
      author: 'Current User', // This would come from auth context
      timestamp: new Date().toISOString(),
      isInternal: true
    };

    // In a real app, this would be an API call
    setReport(prev => ({
      ...prev,
      notes: [newNoteObj, ...prev.notes]
    }));

    setNewNote('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would be an API call
    setReport(prev => ({
      ...prev,
      ...editData,
      updatedAt: new Date().toISOString()
    }));
    setIsEditing(false);
    
    // Show success message
    alert('Report updated successfully');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      // In a real app, this would be an API call
      // await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      alert('Report deleted successfully');
      navigate('/reports');
    }
  };

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiX className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading report</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiX className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Report not found</h3>
          <p className="mt-1 text-sm text-gray-500">The report you're looking for doesn't exist or has been deleted.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiArrowLeft className="h-6 w-6" aria-hidden="true" />
              </button>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Report' : 'Report Details'}
              </h1>
            </div>
            <div className="flex space-x-3">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiEdit className="mr-2 h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {isEditing ? (
            <form onSubmit={handleEditSubmit}>
              <div className="px-4 py-5 sm:px-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      value={editData.description}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        value={editData.status}
                        onChange={(e) => setEditData({...editData, status: e.target.value})}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="priority"
                        value={editData.priority}
                        onChange={(e) => setEditData({...editData, priority: e.target.value})}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                        Assigned To
                      </label>
                      <select
                        id="assignedTo"
                        value={editData.assignedTo}
                        onChange={(e) => setEditData({...editData, assignedTo: e.target.value})}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="Civil Team">Civil Team</option>
                        <option value="Electrical Team">Electrical Team</option>
                        <option value="Plumbing Team">Plumbing Team</option>
                        <option value="Maintenance Team">Maintenance Team</option>
                        <option value="Unassigned">Unassigned</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="px-4 py-5 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {report.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Reported by {report.reporter} on {formatDate(report.date)}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-0 flex space-x-2">
                    {getStatusBadge(report.status)}
                    {getPriorityBadge(report.priority)}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="mt-1 text-sm text-gray-900">{report.category}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">{report.location}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                    <dd className="mt-1 text-sm text-gray-900">{report.assignedTo || 'Unassigned'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(report.updatedAt || report.date)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{report.description}</dd>
                  </div>
                </dl>
              </div>

              {report.images && report.images.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Images</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {report.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`${report.title} - ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <a
                            href={image}
                            download={`report-${report.id}-${index + 1}.jpg`}
                            className="p-2 bg-white bg-opacity-80 rounded-full text-gray-800 hover:bg-opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiDownload className="h-5 w-5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Notes & Updates</h3>
                  <div className="flex space-x-2">
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className="block w-full pl-3 pr-10 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="pending">Mark as Pending</option>
                      <option value="in-progress">Mark as In Progress</option>
                      <option value="resolved">Mark as Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <form onSubmit={handleNoteSubmit} className="flex">
                    <div className="flex-1">
                      <label htmlFor="newNote" className="sr-only">Add a note</label>
                      <input
                        type="text"
                        id="newNote"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Add a note or update..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Note
                    </button>
                  </form>

                  <div className="flow-root">
                    <ul className="-mb-8">
                      {report.notes && report.notes.length > 0 ? (
                        report.notes.map((note, index) => (
                          <li key={note.id || index}>
                            <div className="relative pb-8">
                              {index !== report.notes.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              ) : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                    note.isInternal ? 'bg-blue-500' : 'bg-green-500'
                                  }`}>
                                    <FiMessageSquare className="h-5 w-5 text-white" aria-hidden="true" />
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-gray-800">
                                      {note.text}
                                    </p>
                                    {note.isInternal && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                        Internal Note
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    <time dateTime={note.timestamp}>
                                      {formatDate(note.timestamp)}
                                    </time>
                                    <p className="text-xs text-gray-400">{note.author}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <div className="text-center py-4 text-sm text-gray-500">
                          No notes or updates yet. Add the first note above.
                        </div>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
