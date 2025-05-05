import { FiCamera, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { RefObject, useRef, useState } from "react";
import useImageUpload from "../../hooks/useImageUpload";
import useFileHandler from "../../hooks/useFileHandler";
import { putRequest } from "../../services/apiRequests";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

type ProfilePicUploadProps = {
  profile: any;
  setShowPicOptions: (show: boolean) => void;
  picOptionsRef: any;
  cardBg: string;
  setProfile: any;
  darkMode: boolean;
};

const ProfilePicUpload = ({
  profile,
  setShowPicOptions,
  picOptionsRef,
  cardBg,
  setProfile,
  darkMode,
}: ProfilePicUploadProps) => {
  const auth = useContext(AuthContext);
  if (!auth) {
    return;
  }
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const { selectedFile, previewUrl, handleFileChange } = useFileHandler();
  const { uploadImage, isLoading, error, progress } = useImageUpload();

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e);
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImage(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const profilePic = await uploadImage(selectedFile);

    console.log("DASDASDASDASD: ", profilePic);
    if (profilePic) {
      const url = "/update/uploads-profilepic/" + auth.user?.id;
      const response = await putRequest({ profilePic }, url);
      setProfile({
        ...profile,
        profilePic: profilePic,
      });

      setTempImage(null);
      setShowPicOptions(false);
    }
  };

  const handleDeletePic = async () => {
    if (profile) {
      const url = "/update/remove-profile-pic";
      const response = await putRequest({ userId: auth.user?.id }, url);

      if (response) {
        setProfile({
          ...profile,
          profilePic: undefined,
        });
      }
    }
    setShowPicOptions(false);
  };

  const cancelSelection = () => {
    setTempImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setShowPicOptions(false)}
      ></div>

      <div
        ref={picOptionsRef}
        className={`relative z-10 ${cardBg} rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Profile Picture</h3>
          <button
            onClick={() => setShowPicOptions(false)}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-center mt-2 text-gray-600 dark:text-gray-300">
                Uploading... {progress}%
              </p>
            </div>
          )}

          <div className="flex flex-col items-center mb-4">
            <div
              onClick={triggerFileInput}
              className="relative h-40 w-40 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 mb-3 cursor-pointer"
              title="Click to choose new photo"
            >
              <img
                src={tempImage || profile.profilePic || "/default-profile.png"}
                alt="Current Profile"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <FiCamera className="text-white text-2xl" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {tempImage
                ? "New photo selected"
                : profile.profilePic
                  ? "Current profile picture"
                  : "No profile picture"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileSelection}
              accept="image/*"
            />
          </div>

          <div className="space-y-3">
            {tempImage ? (
              <>
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-md ${
                    darkMode
                      ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
                      : "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400"
                  } text-white disabled:opacity-70`}
                >
                  <FiUpload className="mr-2" />
                  {isLoading ? "Uploading..." : "Upload Selected Photo"}
                </button>
                <button
                  onClick={cancelSelection}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-md ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800"
                      : "bg-gray-200 hover:bg-gray-300 disabled:bg-gray-400"
                  } text-gray-800 dark:text-gray-100 disabled:opacity-70`}
                >
                  Cancel Selection
                </button>
              </>
            ) : (
              <button
                onClick={triggerFileInput}
                disabled={isLoading}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-md ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
                    : "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400"
                } text-white disabled:opacity-70`}
              >
                <FiUpload className="mr-2" />
                Select New Photo
              </button>
            )}

            {profile.profilePic && !tempImage && (
              <>
                <a
                  href={profile.profilePic}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center px-4 py-3 rounded-md ${
                    darkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  View Full Size
                </a>
                <button
                  onClick={handleDeletePic}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center px-4 py-3 rounded-md ${
                    darkMode
                      ? "bg-red-600 hover:bg-red-700 disabled:bg-red-800"
                      : "bg-red-500 hover:bg-red-600 disabled:bg-red-400"
                  } text-white disabled:opacity-70`}
                >
                  <FiTrash2 className="mr-2" />
                  Remove Photo
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePicUpload;
