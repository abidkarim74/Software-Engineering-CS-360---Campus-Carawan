import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSearch } from "@fortawesome/free-solid-svg-icons";
import RidePosts from "../components/RidePosts";
import HomeRightBar from "../components/HomeRightBar";
import HomeLeftBar from "../components/HomeLeftBar";
import { useTheme } from "../context/themeContext"; // Import the theme context

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { darkMode } = useTheme(); // Get dark mode state

  // Color schemes for dark/light modes
  const containerStyles = darkMode
    ? "bg-gray-800 text-gray-100 border-gray-700"
    : "bg-white text-gray-900 border-gray-200";

  const dropdownStyles = darkMode
    ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
    : "bg-white border-gray-200 hover:bg-gray-100";

  const searchInputStyles = darkMode
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500";

  const buttonStyles = darkMode
    ? "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
    : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800";

  return (
    <div className={`mt-3 p-1 shadow-xl rounded-3xl border max-w-6xl mx-auto ${containerStyles}`}>
      {/* Menu Button for Small Screens */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex items-center justify-center w-12 h-12 rounded-full ${darkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white transition duration-300 shadow-lg`}
        >
          <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className={`absolute left-0 mt-2 w-52 shadow-md rounded-lg py-3 border z-10 ${dropdownStyles}`}>
            <Link
              to="/ride-history"
              className={`block px-4 py-2 font-medium transition ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
            >
              Ride History
            </Link>
            <Link
              to="/ride-pending"
              className={`block px-4 py-2 font-medium transition ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
            >
              Pending Requests
            </Link>
          </div>
        )}
      </div>

      {/* Layout Container */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-6">
        {/* Left Sidebar */}
        <div className="hidden sm:block col-span-1">
          <HomeLeftBar />
        </div>

        {/* Main Content */}
        <div className="col-span-2">
          {/* Search Bar & Post Button */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-2/3 md:w-1/2">
              <input
                type="text"
                placeholder="Search ride posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 ${searchInputStyles}`}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              />
            </div>

            {/* Make Ride Post Button */}
            <Link
              to="/make-ride-request"
              className={`text-white px-5 py-2 text-sm sm:text-base rounded-full font-semibold shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg ${buttonStyles}`}
            >
              Make Ride Post
            </Link>
          </div>

          {/* Ride Posts */}
          <RidePosts  />
        </div>

        {/* Right Sidebar */}
        <div className="hidden sm:block col-span-1">
          <HomeRightBar  />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;