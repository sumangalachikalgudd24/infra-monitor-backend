import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCamera, FaPaperPlane, FaMapMarkerAlt, FaMicrophone, FaStop } from 'react-icons/fa';

const ReportForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    category: 'Other',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');

          setFormData(prev => ({
            ...prev,
            description: transcript
          }));
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          setMessage({
            text: 'Error: Could not process voice input',
            type: 'error'
          });
        };

        setSpeechRecognition(recognition);
      }
    }

    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      try {
        setFormData(prev => ({
          ...prev,
          description: prev.description ? prev.description + ' ' : ''
        }));
        speechRecognition.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
        setMessage({
          text: 'Error: Could not access microphone. Please check permissions.',
          type: 'error'
        });
      }
    }
  };

  const categories = [
    'Electrical',
    'Plumbing',
    'Structural',
    'Furniture',
    'HVAC',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('Auth token:', token ? 'Token exists' : 'No token found');

    if (!token) {
      setMessage({ 
        text: 'You need to be logged in to submit a report. Redirecting to login...', 
        type: 'error' 
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    // Basic validation
    if (!formData.title.trim()) {
      setMessage({ text: 'Title is required', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    // Create FormData object
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('location', formData.location || 'Unknown');
    formDataToSend.append('category', formData.category || 'Other');
    formDataToSend.append('priority', 'medium');
    
    if (image) {
      console.log('Image selected:', image.name, 'Type:', image.type, 'Size:', image.size);
      formDataToSend.append('image', image);
    } else {
      console.log('No image selected');
    }

    try {
      // Token already checked at the start

      const response = await axios.post('http://localhost:5000/api/reports', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      setMessage({
        text: 'Report submitted successfully!',
        type: 'success'
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        category: 'Other',
      });
      setImage(null);
      setPreview('');
      
      // Get user role and redirect accordingly
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userRole = user.role || 'user';
      
      // Redirect after 2 seconds
      setTimeout(() => {
        if (userRole === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (userRole === 'worker') {
          window.location.href = '/worker/dashboard';
        } else {
          window.location.href = '/reports';
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting report:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to submit report. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({
        text: errorMessage,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Report Infrastructure Issue</h2>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <button
              type="button"
              onClick={toggleListening}
              className={`flex items-center text-sm ${
                isListening ? 'text-red-600' : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              {isListening ? (
                <>
                  <FaStop className="mr-1" /> Stop Listening
                </>
              ) : (
                <>
                  <FaMicrophone className="mr-1" /> Voice Input
                </>
              )}
            </button>
          </div>
          <div className="mt-1 relative rounded-md shadow-sm">
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
              required
            ></textarea>
            {isListening && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {isListening ? 'Listening... Speak now.' : 'Click the microphone to use voice input'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              <FaMapMarkerAlt className="inline mr-1" /> Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Building, floor, room number"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Photo (Optional but recommended)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {preview ? (
                <div className="mt-2">
                  <img src={preview} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setPreview('');
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove photo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                        capture="environment"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            onClick={(e) => {
              console.log('Button clicked');
              // The form's onSubmit will handle the submission
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center">
                <FaPaperPlane className="mr-2 h-4 w-4" />
                Submit Report
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
