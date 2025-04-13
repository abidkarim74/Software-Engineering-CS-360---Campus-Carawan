import { useEffect, useState, useContext } from "react";
import useFileHandler from "../hooks/useFileHandler";
import useImageUpload from "../hooks/useImageUpload";
import { AuthContext } from "../context/authContext";
import { putRequest } from "../services/apiRequests";

const UpdateProfile = () => {
  const auth = useContext(AuthContext);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { selectedFile, previewUrl, handleFileChange } = useFileHandler();
  const { imageUrl, isLoading, error, uploadImage, setError} = useImageUpload();

  const handleUpload = async () => {
    if (selectedFile) {
      try {
        setSuccessMessage(null);
        await uploadImage(selectedFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      }
    }
  };

  useEffect(() => {
    const storeImageInDb = async () => {
      if (!imageUrl || !auth?.user?.id) return;
      
      try {
        const res = await putRequest(
          { profilePic: imageUrl },
          `/update/uploads-profilepic/${auth.user.id}`
        );
        
        console.log("Result: ", res);
        setSuccessMessage('Profile picture updated successfully!');
        window.location.assign(`/${auth.user.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update profile');
      }
    };

    storeImageInDb();
  }, [imageUrl, auth?.user?.id]);

  if (!auth) {
    return null; 
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Update Profile Picture</h2>
      
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        disabled={isLoading}
        className="block mb-4"
      />
      
      {previewUrl && (
        <div className="mt-4">
          <p className="font-medium">Selected Image Preview:</p>
          <img src={previewUrl} alt="Preview" className="mt-2 max-w-[300px] h-auto" />
          <button 
            onClick={handleUpload}
            disabled={isLoading}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isLoading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      )}

      {imageUrl && (
        <div className="mt-4">
          <p className="font-medium">Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" className="mt-2 max-w-[300px] h-auto" />
        </div>
      )}

      {error && (
        <div className="mt-4 p-2 text-red-500 bg-red-50 rounded">
          Error: {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-2 text-green-500 bg-green-50 rounded">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default UpdateProfile;