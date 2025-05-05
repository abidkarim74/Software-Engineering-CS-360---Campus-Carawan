import { Link } from 'react-router-dom';
import { Moon, Sun, Lock, User, ArrowRight, Bell } from 'react-feather';
import { useTheme } from '../context/themeContext';
import { useContext, useState } from 'react';
import { GeneralContext } from '../context/generalContext';
import { AuthContext } from '../context/authContext';
import { logoutUser } from '../services/authServices';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { darkMode, toggleTheme } = useTheme();
  const generalContext = useContext(GeneralContext);

  if (!auth || !generalContext) {
    return null;
  }

  const {
    notificationsOn,
    toggleNotifications
  } = generalContext;

  const handleLogout = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser(auth.setUser, auth.accessToken);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Failed to logout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} transition-colors`}>
        <div className="max-w-md mx-auto p-6">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-700'}`}>
              {error}
            </div>
          )}

          {/* Preferences Section */}
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              Preferences
            </h2>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer" onClick={toggleTheme}>
              <div className="flex items-center">
                <div className="mr-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                  {darkMode ? (
                    <Moon className="text-gray-600 dark:text-gray-300" size={18} />
                  ) : (
                    <Sun className="text-gray-600 dark:text-gray-300" size={18} />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {darkMode ? 'Dark Mode' : 'Light Mode'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={darkMode}
                  onChange={toggleTheme}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer" onClick={toggleNotifications}>
              <div className="flex items-center">
                <div className="mr-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                  <Bell className="text-gray-600 dark:text-gray-300" size={18} />
                </div>
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {notificationsOn ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationsOn}
                  onChange={toggleNotifications}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Change Password */}
            <Link
              to="/settings/change-password"
              className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className="mr-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                  <Lock className="text-gray-600 dark:text-gray-300" size={18} />
                </div>
                <div>
                  <h3 className="font-medium">Change Password</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Update your account password
                  </p>
                </div>
              </div>
              <ArrowRight className="text-gray-400 dark:text-gray-500" size={18} />
            </Link>
          </div>

          {/* Account Section */}
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              Account
            </h2>

            {/* Personal Information */}
            <Link
              to={`/${auth.user?.id}/update`}
              className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center">
                <div className="mr-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700">
                  <User className="text-gray-600 dark:text-gray-300" size={18} />
                </div>
                <div>
                  <h3 className="font-medium">Personal Information</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Update your name, email, and phone
                  </p>
                </div>
              </div>
              <ArrowRight className="text-gray-400 dark:text-gray-500" size={18} />
            </Link>
          </div>

          {/* Footer with Logout Button */}
          <div className="mt-12 text-center">
            <button 
              onClick={handleLogout}
              disabled={loading}
              className={`px-6 py-3 border rounded-lg font-medium transition-colors flex items-center justify-center mx-auto ${
                loading
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-gray-800'
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging out...
                </>
              ) : (
                'Log Out'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;