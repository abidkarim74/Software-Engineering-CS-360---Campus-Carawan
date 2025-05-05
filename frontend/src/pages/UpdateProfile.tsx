import { useState, useEffect, useContext, FormEvent } from "react";
import { AuthContext } from "../context/authContext";
import { putRequest, getRequest } from "../services/apiRequests";
import { useTheme } from "../context/themeContext";
import { FiUser, FiPhone, FiSave, FiInfo, FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface UserData {
  username: string;
  fullname: string;
  email: string;
  phone: string;
  driver: "yes" | "no";
  type: "STUDENT" | "FACULTY";
}

const UpdateProfile = () => {
  const { darkMode } = useTheme();
  const auth = useContext(AuthContext);
  
  const [userData, setUserData] = useState<UserData>({
    username: "",
    fullname: "",
    email: "",
    phone: "",
    driver: "no",
    type: "STUDENT"
  });
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth?.user?.id) return;
      
      setLoading(true);
      try {
        const data = await getRequest(
          `/general/profile/${auth.user.id}`,
          auth.accessToken,
          setLoading,
          setError
        );
        
        setUserData({
          username: data.username || "",
          fullname: data.fullname || "",
          email: data.email || "",
          phone: data.phone || "",
          driver: data.driver === "yes" ? "yes" : "no",
          type: data.type === "FACULTY" ? "FACULTY" : "STUDENT"
        });
      } catch (err) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [auth?.user?.id, auth?.accessToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDriverChange = (value: "yes" | "no") => {
    setUserData(prev => ({
      ...prev,
      driver: value
    }));
  };

  const handleTypeChange = (value: "STUDENT" | "FACULTY") => {
    setUserData(prev => ({
      ...prev,
      type: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!auth?.user?.id) {
      setError("User not authenticated");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const updateData = {
        fullname: userData.fullname,
        phone: userData.phone,
        driver: userData.driver,
        type: userData.type
      };

      const response = await putRequest(
        updateData,
        `/update/update-user-info`
      );
      
      if (response) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => {
          if (!auth?.user) return;
          
          if (userData.driver === "yes") {
            navigate(`/update-vehicle-info`);
          } else {
            navigate(`/profile/${auth.user.id}`);
          }
        }, 2000);
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Blue-themed styling variables
  const bgColor = darkMode ? "bg-gray-900" : "bg-white";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const cardShadow = darkMode ? "shadow-xl" : "shadow-xl shadow-blue-100/50";
  const inputBg = darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-400 focus:ring-blue-500" : "bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-300";
  const disabledInputBg = darkMode ? "bg-gray-700 border-gray-600 text-gray-400" : "bg-blue-50 border-blue-100 text-blue-800";
  const buttonBg = darkMode ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700";
  const radioSelected = darkMode ? "bg-blue-600 border-blue-600 text-white" : "bg-blue-500 border-blue-500 text-white";
  const radioUnselected = darkMode ? "border-gray-600 bg-gray-700 hover:bg-gray-600" : "border-blue-200 bg-white hover:bg-blue-50";
  const headerBg = darkMode ? "bg-gradient-to-r from-blue-800 to-blue-900" : "bg-gradient-to-r from-blue-600 to-blue-700";
  const infoIconColor = darkMode ? "text-blue-400" : "text-blue-500";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";

  if (!auth) {
    return null;
  }

  return (
    <div className={`min-h-screen ${bgColor} py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300`}>
      <div className="max-w-2xl mx-auto">
        <div className={`${cardBg} ${cardShadow} rounded-xl overflow-hidden border border-blue-200/50 transition-all duration-300`}>
          {/* Header with gradient */}
          <div className={`px-6 py-6 ${headerBg} border-b border-blue-500/20`}>
            <h1 className="text-2xl font-bold text-white">Update Profile</h1>
            <p className="text-blue-100 text-sm mt-1">Manage your personal information</p>
          </div>

          {loading && !userData.username ? (
            <div className="flex justify-center items-center py-16">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400`}></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
              {/* Status Messages */}
              {successMessage && (
                <div className={`bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg relative ${darkMode ? "bg-opacity-20" : ""}`}>
                  <span className="block sm:inline">{successMessage}</span>
                </div>
              )}

              {error && (
                <div className={`bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg relative ${darkMode ? "bg-opacity-20" : ""}`}>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              {/* Readonly Fields */}
              <div className="space-y-4">
                {/* Username */}
                <div className="group">
                  <label className={`block text-sm font-medium ${textColor} mb-1`}>
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className={infoIconColor} />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={userData.username}
                      readOnly
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg ${disabledInputBg} cursor-not-allowed`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="relative">
                        <FiInfo className={`${infoIconColor} group-hover:text-blue-300 transition-colors`} />
                        <span className={`absolute hidden group-hover:block w-48 -left-48 -top-8 px-2 py-1 text-xs rounded-lg shadow-lg ${darkMode ? 'bg-gray-700 text-blue-200 border border-gray-600' : 'bg-white text-blue-800 border border-blue-200'}`}>
                          Contact admin to change username
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className={`block text-sm font-medium ${textColor} mb-1`}>
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className={infoIconColor} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      readOnly
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg ${disabledInputBg} cursor-not-allowed`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="relative">
                        <FiInfo className={`${infoIconColor} group-hover:text-blue-300 transition-colors`} />
                        <span className={`absolute hidden group-hover:block w-48 -left-48 -top-8 px-2 py-1 text-xs rounded-lg shadow-lg ${darkMode ? 'bg-gray-700 text-blue-200 border border-gray-600' : 'bg-white text-blue-800 border border-blue-200'}`}>
                          Contact admin to change email
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-1`}>
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className={infoIconColor} />
                    </div>
                    <input
                      type="text"
                      name="fullname"
                      value={userData.fullname}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-300/50 transition-all duration-200 ${inputBg}`}
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-1`}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className={infoIconColor} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-300/50 transition-all duration-200 ${inputBg}`}
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Selection Fields */}
              <div className="space-y-4">
                {/* User Type */}
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-1`}>
                    User Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleTypeChange("STUDENT")}
                      className={`py-3 px-4 rounded-lg border transition-all duration-200 flex items-center justify-center ${userData.type === "STUDENT" ? radioSelected : radioUnselected}`}
                    >
                      <span className="font-medium">Student</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange("FACULTY")}
                      className={`py-3 px-4 rounded-lg border transition-all duration-200 flex items-center justify-center ${userData.type === "FACULTY" ? radioSelected : radioUnselected}`}
                    >
                      <span className="font-medium">Faculty</span>
                    </button>
                  </div>
                </div>

                {/* Driver Option */}
                <div>
                  <label className={`block text-sm font-medium ${textColor} mb-1`}>
                    Driver Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDriverChange("yes")}
                      className={`py-3 px-4 rounded-lg border transition-all duration-200 flex items-center justify-center ${userData.driver === "yes" ? radioSelected : radioUnselected}`}
                    >
                      <span className="font-medium">Yes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDriverChange("no")}
                      className={`py-3 px-4 rounded-lg border transition-all duration-200 flex items-center justify-center ${userData.driver === "no" ? radioSelected : radioUnselected}`}
                    >
                      <span className="font-medium">No</span>
                    </button>
                  </div>
                  {userData.driver === "yes" && (
                    <p className={`mt-2 text-sm ${darkMode ? "text-blue-300" : "text-blue-600"} flex items-center`}>
                      <FiInfo className="mr-1" /> You'll need to provide vehicle details next
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 text-white flex items-center justify-center ${buttonBg} shadow-lg hover:shadow-xl active:scale-[0.98]`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating Profile...
                    </span>
                  ) : (
                    <>
                      <FiSave className="mr-2" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;