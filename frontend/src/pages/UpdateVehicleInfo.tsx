import React, { useState, useContext, useEffect } from 'react';
import { FaCar, FaMotorcycle, FaTruck, FaUpload, FaSave, FaSpinner } from 'react-icons/fa';
import { useTheme } from '../context/themeContext';
import useImageUpload from '../hooks/useImageUpload';
import useFileHandler from '../hooks/useFileHandler';
import { AuthContext } from '../context/authContext';
import { putRequest } from '../services/apiRequests';
import { useNavigate } from 'react-router-dom';

type VehicleType = 'TWO_WHEEL' | 'THREE_WHEEL' | 'FOUR_WHEEL' | 'HEAVY';

interface VehicleData {
  type: VehicleType;
  name: string;
  numberPlate: string;
  model: string;
  color: string;
  vehiclePic: string;
}

const UpdateVehicleInfo: React.FC = () => {
  const auth = useContext(AuthContext);
  const { darkMode } = useTheme();
  
  const [vehicleData, setVehicleData] = useState<VehicleData>({
    type: 'FOUR_WHEEL',
    name: '',
    numberPlate: '',
    model: '',
    color: '',
    vehiclePic: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { selectedFile, previewUrl, handleFileChange } = useFileHandler();
  const { imageUrl, isLoading: isUploading, error: uploadError, uploadImage } = useImageUpload();

  useEffect(() => {
    if (imageUrl) {
      setVehicleData(prev => ({ ...prev, vehiclePic: imageUrl }));
    }
  }, [imageUrl]);

  const navigate = useNavigate();

  const handleImageUpload = async () => {
    if (!selectedFile) return null;
    
    try {
      setError(null);
      const url = await uploadImage(selectedFile);
      if (!url) throw new Error('Image upload failed');
      return url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed');
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!auth?.user || !auth?.accessToken) {
      setError('Authentication required');
      return;
    };
  
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
  
    try {
      let finalImageUrl = vehicleData.vehiclePic || '';
      
      if (selectedFile) {
        const uploadedUrl = await handleImageUpload();
        if (!uploadedUrl) {
          throw new Error('Image upload failed');
        }
        finalImageUrl = uploadedUrl;
      }
  
      if (finalImageUrl === null) {
        finalImageUrl = '';
      }
  
      const submissionData = {
        ...vehicleData,
        vehiclePic: finalImageUrl
      };
  
      const response = await putRequest(
        { data: submissionData },
        '/update/update-vehicle-info',
      );
  
      if (response) {
        setSuccessMessage('Vehicle information updated successfully!');
        navigate("/profile/"+auth.user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle information');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Dynamic styles
  const bgColor = darkMode 
    ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
    : 'bg-gradient-to-br from-blue-50 to-gray-50';

  const cardBg = darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const inputBg = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:border-blue-400';

  const buttonBg = darkMode
    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg'
    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg';

  const headerBg = darkMode
    ? 'bg-gradient-to-r from-blue-800 to-blue-900'
    : 'bg-gradient-to-r from-blue-600 to-blue-700';

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'TWO_WHEEL': return <FaMotorcycle className="text-2xl" />;
      case 'THREE_WHEEL': return <FaCar className="text-2xl" />;
      case 'FOUR_WHEEL': return <FaCar className="text-2xl" />;
      case 'HEAVY': return <FaTruck className="text-2xl" />;
      default: return <FaCar className="text-2xl" />;
    }
  };

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${bgColor} transition-colors duration-300`}>
      <div className="max-w-3xl mx-auto">
        <div className={`rounded-xl shadow-2xl overflow-hidden border ${cardBg} transition-all duration-300`}>
          {/* Header with gradient */}
          <div className={`px-8 py-6 ${headerBg} border-b border-blue-500/20`}>
            <div className="flex items-center gap-4">
              <FaCar className="text-3xl text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">Vehicle Information</h1>
                <p className="text-blue-100 text-sm">Update your vehicle details</p>
              </div>
            </div>
          </div>

          {/* Form content */}
          <div className="px-8 py-8">
            {/* Status Messages */}
            {successMessage && (
              <div className={`mb-6 p-4 rounded-lg border ${
                darkMode ? 'bg-green-900/30 border-green-700 text-green-200' : 'bg-green-100 border-green-300 text-green-800'
              }`}>
                {successMessage}
              </div>
            )}
            {(error || uploadError) && (
              <div className={`mb-6 p-4 rounded-lg border ${
                darkMode ? 'bg-red-900/30 border-red-700 text-red-200' : 'bg-red-100 border-red-300 text-red-800'
              }`}>
                {error || uploadError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Vehicle Type Selection */}
              <div>
                <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Vehicle Type
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['TWO_WHEEL', 'THREE_WHEEL', 'FOUR_WHEEL', 'HEAVY'] as VehicleType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVehicleData(prev => ({ ...prev, type }))}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        vehicleData.type === type 
                          ? darkMode 
                            ? 'border-blue-500 bg-blue-900/30 text-blue-300' 
                            : 'border-blue-500 bg-blue-100 text-blue-700'
                          : darkMode 
                            ? 'border-gray-600 hover:bg-gray-700 text-gray-300' 
                            : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {getVehicleIcon(type)}
                      <span className="mt-2 text-sm font-medium">
                        {type === 'TWO_WHEEL' && 'Two Wheel'}
                        {type === 'THREE_WHEEL' && 'Three Wheel'}
                        {type === 'FOUR_WHEEL' && 'Four Wheel'}
                        {type === 'HEAVY' && 'Heavy Vehicle'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-6">
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Vehicle Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Vehicle Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={vehicleData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${inputBg}`}
                      required
                      placeholder="e.g., Toyota Corolla"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="numberPlate" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Number Plate
                    </label>
                    <input
                      type="text"
                      id="numberPlate"
                      name="numberPlate"
                      value={vehicleData.numberPlate}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${inputBg}`}
                      required
                      placeholder="e.g., ABC-1234"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="model" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Model Year
                    </label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={vehicleData.model}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${inputBg}`}
                      required
                      placeholder="e.g., 2022"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="color" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Color
                    </label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      value={vehicleData.color}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 ${inputBg}`}
                      required
                      placeholder="e.g., Red"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Image Upload */}
              <div className="space-y-4">
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  Vehicle Image
                </h2>
                <label className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                  darkMode 
                    ? 'border-gray-600 hover:border-blue-500 bg-gray-700/30 hover:bg-gray-700/50' 
                    : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-gray-100'
                } ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  <div className="flex flex-col items-center justify-center text-center">
                    {isUploading ? (
                      <>
                        <FaSpinner className="text-3xl mb-3 animate-spin text-blue-500" />
                        <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Uploading Image...</p>
                      </>
                    ) : (
                      <>
                        <FaUpload className={`text-3xl mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {previewUrl ? 'Change vehicle image' : 'Upload vehicle image'}
                        </p>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          PNG, JPG or JPEG (Max. 5MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    disabled={isUploading}
                    accept="image/*" 
                  />
                </label>
                {(previewUrl || vehicleData.vehiclePic) && (
                  <div className="mt-6 flex justify-center">
                    <div className="relative group">
                      <img 
                        src={previewUrl || vehicleData.vehiclePic} 
                        alt="Vehicle preview" 
                        className="rounded-xl max-h-64 object-contain border shadow-sm"
                      />
                      <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-xl transition-all duration-300 flex items-center justify-center ${
                        darkMode ? 'border-gray-600' : 'border-gray-300'
                      }`}>
                        <FaUpload className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting || isUploading}
                  className={`w-full py-4 px-6 text-white rounded-xl font-semibold transition-all duration-300 ${
                    buttonBg
                  } ${
                    (isSubmitting || isUploading) ? 'opacity-80 cursor-not-allowed' : 'hover:shadow-xl transform hover:-translate-y-0.5'
                  } flex items-center justify-center gap-3`}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Updating Vehicle...</span>
                    </>
                  ) : (
                    <>
                      <FaSave />
                      <span>Save Vehicle Information</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateVehicleInfo;