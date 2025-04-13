import { useState } from 'react';


const useImageUpload = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    if (!file) {
      return; 
    }
    setIsLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "carawan");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dntypynfu/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) {
        throw new Error("Image upload failed");
      }

      const result = await res.json();
      setImageUrl(result.secure_url);
      return result.secure_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
      console.error("Upload error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { imageUrl, isLoading, error, uploadImage, setError, setIsLoading };
};

export default useImageUpload;