import { useState, useEffect, useRef } from 'react';
import { FiAlertCircle, FiSend, FiX } from 'react-icons/fi';
import { postRequest } from '../../services/apiRequests';
import { AuthContext } from '../../context/authContext';
import { useContext } from 'react';

interface ComplainFormProps {
  targetId: string;
  darkMode: boolean;
  onClose: () => void;
}

const ComplainForm = ({ targetId, darkMode, onClose }: ComplainFormProps) => {
  const auth = useContext(AuthContext);

  if (!auth) {
    return null;
  }

  const [complain, setComplain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!complain.trim()) {
      setError('Please enter your complaint');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    const url = "/general/create-complain";
  
    try {
      await postRequest({targetId, complain}, url, auth.accessToken, setIsLoading, setError);
      setIsSubmitted(true);
      setComplain('');
      setTimeout(onClose, 1500);
    } catch (err) {
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Blue-themed styling variables
  const bgColor = darkMode ? 'bg-gray-900' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = darkMode ? 'bg-gray-800 focus:ring-blue-500 focus:border-blue-500' : 'bg-white focus:ring-blue-400 focus:border-blue-400';
  const buttonBg = darkMode 
    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white';
  const disabledButtonBg = darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500';
  const headerBg = darkMode ? 'bg-gradient-to-r from-blue-800 to-blue-900' : 'bg-gradient-to-r from-blue-600 to-blue-700';
  const successBg = darkMode ? 'bg-green-900/30 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-300';
  const errorBg = darkMode ? 'bg-red-900/30 text-red-300 border-red-700' : 'bg-red-100 text-red-800 border-red-300';

  return (
    <>
      {/* Blurred Background Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
      
      {/* Form Container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div 
          ref={formRef}
          className={`${bgColor} ${textColor} rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative border ${borderColor} transform transition-all duration-300 scale-95 hover:scale-100`}
        >
          {/* Header with gradient background */}
          <div className={`p-4 rounded-t-xl ${headerBg} text-white`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <FiAlertCircle className="text-xl mr-2 text-blue-200" />
                <h2 className="text-xl font-semibold">File a Complaint</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-full hover:bg-blue-800/50 transition-colors"
                aria-label="Close complaint form"
              >
                <FiX className="w-5 h-5 text-blue-200" />
              </button>
            </div>
            <p className="text-blue-100 text-sm mt-1">Help us improve by sharing your concerns</p>
          </div>
          
          {/* Form Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="complain" className={`block text-sm font-medium mb-2 ${textColor}`}>
                  Your Complaint
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  id="complain"
                  rows={4}
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${inputBg} ${textColor} placeholder-gray-500`}
                  placeholder="Please describe your complaint in detail..."
                  value={complain}
                  onChange={(e) => {
                    setComplain(e.target.value);
                    setError(null);
                  }}
                  required
                />
              </div>

              {/* Status messages */}
              {error && (
                <div className={`p-3 rounded-lg border ${errorBg} flex items-start`}>
                  <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-2" />
                  <span>{error}</span>
                </div>
              )}

              {isSubmitted && !isLoading && !error && (
                <div className={`p-3 rounded-lg border ${successBg} flex items-start`}>
                  <svg className="flex-shrink-0 mt-0.5 mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Complaint submitted successfully! This window will close shortly.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !complain.trim()}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                  isLoading || !complain.trim() ? disabledButtonBg : buttonBg
                } shadow-md hover:shadow-lg flex items-center justify-center`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend className="mr-2" />
                    Submit Complaint
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplainForm;