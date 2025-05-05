import { useState } from "react";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "react-feather";
import { Link } from "react-router-dom";
import { useTheme } from "../context/themeContext";
import { postRequest } from "../services/apiRequests";
import { AuthContext } from "../context/authContext";
import { useContext } from "react";

const ChangePassword = () => {
  const auth = useContext(AuthContext);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { darkMode } = useTheme();

  if (!auth) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    const response = await postRequest(
      {
        oldPassword: currentPassword,
        newPassword: newPassword,        // <-- Add this
        confirmPassword: newPassword     // <-- Optional, for validation
      },
      "/auth/change-password",
      auth.accessToken,
      setIsLoading,
      setError
    );

    if (!response) {
      
    }
    

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (success) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-6 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div
          className={`max-w-md w-full p-8 rounded-lg shadow-sm text-center ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Password Updated</h1>
          <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Your password has been successfully changed.
          </p>
          <Link
            to="/settings"
            className={`w-full font-medium py-2 px-4 rounded-lg transition duration-200 ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            Back to Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-md mx-auto p-6">
        {/* Header with back button */}
        <div className="flex items-center mb-8">
          <Link
            to="/settings"
            className={`mr-4 p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          >
            <ArrowLeft
              className={darkMode ? "text-gray-300" : "text-gray-600"}
              size={20}
            />
          </Link>
          <h1
            className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            Change Password
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <div
            className={`mb-6 p-3 rounded-lg flex items-center ${
              darkMode ? "bg-red-900 text-red-100" : "bg-red-50 text-red-600"
            }`}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Password form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label
              htmlFor="currentPassword"
              className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock
                  className={darkMode ? "text-gray-400" : "text-gray-400"}
                  size={18}
                />
              </div>
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff
                    className={darkMode ? "text-gray-400" : "text-gray-400"}
                    size={18}
                  />
                ) : (
                  <Eye
                    className={darkMode ? "text-gray-400" : "text-gray-400"}
                    size={18}
                  />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label
              htmlFor="newPassword"
              className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock
                  className={darkMode ? "text-gray-400" : "text-gray-400"}
                  size={18}
                />
              </div>
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff
                    className={darkMode ? "text-gray-400" : "text-gray-400"}
                    size={18}
                  />
                ) : (
                  <Eye
                    className={darkMode ? "text-gray-400" : "text-gray-400"}
                    size={18}
                  />
                )}
              </button>
            </div>
            <p
              className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock
                  className={darkMode ? "text-gray-400" : "text-gray-400"}
                  size={18}
                />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff
                    className={darkMode ? "text-gray-400" : "text-gray-400"}
                    size={18}
                  />
                ) : (
                  <Eye
                    className={darkMode ? "text-gray-400" : "text-gray-400"}
                    size={18}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 text-white font-medium rounded-lg transition duration-200 ${
              isLoading
                ? "opacity-70 cursor-not-allowed bg-blue-500"
                : darkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
