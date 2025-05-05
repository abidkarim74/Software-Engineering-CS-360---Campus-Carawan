import { useState } from 'react';

interface CloudinaryResponse {
  secure_url: string;
  url?: string;
  [key: string]: any;
}

const useImageUpload = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) {
      setError('No file provided');
      return null;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload an image (JPEG, PNG, WEBP, GIF)');
      return null;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "carawan");

      const xhr = new XMLHttpRequest();
      
      const promise = new Promise<CloudinaryResponse>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText) as CloudinaryResponse;
              resolve(response);
            } catch (err) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            reject(new Error(xhr.statusText || 'Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', 'https://api.cloudinary.com/v1_1/dntypynfu/image/upload');
        xhr.send(data);
      });

      const result = await promise;
      const url = result.secure_url || result.url;
      
      if (!url) {
        throw new Error('No URL returned from Cloudinary');
      }

      setImageUrl(url);
      setProgress(100);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setImageUrl(null);
    setError(null);
    setProgress(0);
  };

  return { 
    imageUrl, 
    isLoading, 
    error, 
    progress,
    uploadImage, 
    reset,
    setError 
  };
};

export default useImageUpload;