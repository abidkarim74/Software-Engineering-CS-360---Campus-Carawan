import React, { useState, useContext, useEffect } from 'react';
import { FaCar, FaMotorcycle, FaTruck, FaUpload, FaSave, FaSpinner } from 'react-icons/fa';
import { useTheme } from '../context/themeContext';
import useImageUpload from '../hooks/useImageUpload';
import useFileHandler from '../hooks/useFileHandler';
import { AuthContext } from '../context/authContext';
import { putRequest } from '../services/apiRequests';

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
  
  // State for form data and UI
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

  // Custom hooks for file handling
  const { selectedFile, previewUrl, handleFileChange } = useFileHandler();
  const { imageUrl, isLoading: isUploading, error: uploadError, uploadImage } = useImageUpload();

  // Update vehiclePic when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setVehicleData(prev => ({ ...prev, vehiclePic: imageUrl }));
    }
  }, [imageUrl]);

  console.log(imageUrl);
  // Handle image upload separately
  const handleImageUpload = async () => {
    if (selectedFile) {
      try {
        setError(null);
        await uploadImage(selectedFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Image upload failed');
        throw err;
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth?.user) {
      return;
    };

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);



    try {
      // 1. First upload the image if a new one was selected
      if (selectedFile) {
        await handleImageUpload();
      }

      // 2. Prepare the data for API submission
      const submissionData = {
        ...vehicleData,
        // Use the new image URL if available, otherwise keep the existing one
        vehiclePic: imageUrl || null
      };

      // 3. Submit to your backend API
      if (!auth?.accessToken) {
        throw new Error('Authentication required');
      }
      console.log("Data: ", submissionData);
      const response = await putRequest(
        {data: submissionData},
        '/update/update-vehicle-info',
        // Your API endpoint
      );

      if (response) {
        setSuccessMessage('Vehicle information updated successfully!');
        // Reset file selection after successful submission
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update vehicle information');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Dynamic styles based on dark mode
  const containerStyles = darkMode 
    ? 'bg-gray-900 text-gray-100'
    : 'bg-white text-gray-900';

  const cardStyles = darkMode
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';

  const inputStyles = darkMode
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500';

  const buttonStyles = darkMode
    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600';

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'TWO_WHEEL': return <FaMotorcycle className="text-xl" />;
      case 'THREE_WHEEL': return <FaCar className="text-xl" />;
      case 'FOUR_WHEEL': return <FaCar className="text-xl" />;
      case 'HEAVY': return <FaTruck className="text-xl" />;
      default: return <FaCar className="text-xl" />;
    }
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${containerStyles} transition-colors duration-300`}>
      <div className={`max-w-2xl mx-auto p-6 rounded-xl shadow-lg border ${cardStyles} transition-colors duration-300`}>
        <div className="flex items-center gap-3 mb-6">
          <FaCar className={`text-3xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className="text-2xl font-bold">Update Vehicle Information</h2>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className={`mb-4 p-3 rounded-lg ${
            darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
          }`}>
            {successMessage}
          </div>
        )}
        {(error || uploadError) && (
          <div className={`mb-4 p-3 rounded-lg ${
            darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-800'
          }`}>
            {error || uploadError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Type */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Vehicle Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['TWO_WHEEL', 'THREE_WHEEL', 'FOUR_WHEEL', 'HEAVY'] as VehicleType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVehicleData(prev => ({ ...prev, type }))}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    vehicleData.type === type 
                      ? darkMode 
                        ? 'border-blue-500 bg-blue-900/30' 
                        : 'border-blue-500 bg-blue-100'
                      : darkMode 
                        ? 'border-gray-600 hover:bg-gray-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {getVehicleIcon(type)}
                  <span className="mt-2 text-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">Vehicle Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={vehicleData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${inputStyles}`}
                required
                placeholder="e.g., Toyota Corolla"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="numberPlate" className="block text-sm font-medium">Number Plate</label>
              <input
                type="text"
                id="numberPlate"
                name="numberPlate"
                value={vehicleData.numberPlate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${inputStyles}`}
                required
                placeholder="e.g., ABC-1234"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="model" className="block text-sm font-medium">Model</label>
              <input
                type="text"
                id="model"
                name="model"
                value={vehicleData.model}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${inputStyles}`}
                required
                placeholder="e.g., 2022"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="color" className="block text-sm font-medium">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={vehicleData.color}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none ${inputStyles}`}
                required
                placeholder="e.g., Red"
              />
            </div>
          </div>

          {/* Vehicle Picture */}
          <div className="space-y-4">
            <label className="block text-sm font-medium">Vehicle Picture</label>
            <label className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer ${
              darkMode 
                ? 'border-gray-600 hover:border-blue-500 bg-gray-700/50' 
                : 'border-gray-300 hover:border-blue-500 bg-gray-50'
            } ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              <div className="flex flex-col items-center justify-center">
                {isUploading ? (
                  <FaSpinner className="text-2xl mb-2 animate-spin" />
                ) : (
                  <FaUpload className={`text-2xl mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {isUploading ? 'Uploading...' : previewUrl ? 'Change image' : 'Upload an image'}
                </p>
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
              <div className="mt-4 flex justify-center">
                <img 
                  src={previewUrl || vehicleData.vehiclePic} 
                  alt="Vehicle preview" 
                  className="rounded-lg max-h-48 object-contain border shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className={`w-full py-3 px-4 text-white rounded-lg font-semibold shadow-md transition-all duration-300 hover:shadow-lg ${
              buttonStyles
            } ${
              (isSubmitting || isUploading) ? 'opacity-70 cursor-not-allowed' : ''
            } flex items-center justify-center gap-2`}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FaSave />
                Update Vehicle Information
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateVehicleInfo;