import useFileHandler from "../hooks/useFileHandler";
import useImageUpload from "../hooks/useImageUpload";


const UploadImage = () => {
  const { selectedFile, previewUrl, handleFileChange } = useFileHandler();
  const { imageUrl, isLoading, error, uploadImage } = useImageUpload();

  const handleUpload = async () => {
    if (selectedFile) {
      await uploadImage(selectedFile);
    }
  };

  return (
    <div className="p-4">
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        disabled={isLoading}
      />
      
      {previewUrl && (
        <div className="mt-4">
          <p>Selected Image Preview:</p>
          <img src={previewUrl} alt="Preview" width="300" />
          <button 
            onClick={handleUpload}
            disabled={isLoading}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isLoading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      )}

      {imageUrl && (
        <div className="mt-4">
          <p>Uploaded Image:</p>
          <img src={imageUrl} alt="Uploaded" width="300" />
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-500">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default UploadImage;