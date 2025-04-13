import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSearch } from "@fortawesome/free-solid-svg-icons";
import RidePosts from "../components/RidePosts";
import HomeRightBar from "../components/HomeRightBar";
import HomeLeftBar from "../components/HomeLeftBar";
import { useTheme } from "../context/themeContext";

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { darkMode } = useTheme();

  // Color schemes for dark/light modes
  const containerStyles = darkMode
    ? "bg-gray-900 text-gray-100 border-gray-900"
    : " text-gray-900 border-white";

  const dropdownStyles = darkMode
    ? "bg-gray-800 border-gray-600 hover:bg-gray-700"
    : "bg-white border-gray-200 hover:bg-gray-50";

  const searchInputStyles = darkMode
    ? "bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500";

  const buttonStyles = darkMode
    ? "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
    : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white";

  const sidebarBg = darkMode 
    ? "bg-gray-900 border-gray-900"
    : "bg-white border-white";

  return (
    <div className={`mt-0 p-4 shadow-lg rounded-xl border ${containerStyles} max-w-7xl mx-auto transition-colors duration-300`}>
      {/* Mobile Menu Button */}
      <div className="sm:hidden flex justify-between items-center mb-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors duration-200`}
        >
          <FontAwesomeIcon 
            icon={faBars} 
            className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          />
        </button>

        {/* Mobile Search */}
        <div className="relative w-3/4">
          <input
            type="text"
            placeholder="Search rides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-4 py-2 pl-10 border rounded-full focus:outline-none focus:ring-2 ${searchInputStyles}`}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
          />
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className={`sm:hidden mb-6 shadow-lg rounded-lg py-2 border ${dropdownStyles} transition-all duration-300`}>
          <Link
            to="/ride-history"
            className={`block px-4 py-3 font-medium transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            Ride History
          </Link>
          <Link
            to="/ride-pending"
            className={`block px-4 py-3 font-medium transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            Pending Requests
          </Link>
          <Link
            to="/make-ride-request"
            className={`block px-4 py-3 font-medium text-center rounded-md mx-2 my-1 ${buttonStyles}`}
          >
            Create Ride Post
          </Link>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Desktop */}
        <div className="hidden lg:block lg:col-span-3">
          <div className={`fixed top-12 p-4 left-0 rounded-xl border ${sidebarBg} transition-colors duration-300`}>
            <HomeLeftBar />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-6">
          {/* Desktop Search & Post Button */}
          <div className="hidden sm:flex justify-center items-center mb-6 gap-4 border border-gray-200 rounded-md">

            <div className="ml-10 relative flex-1">
              <input
                type="text"
                placeholder="Search for rides or destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-[90%] px-4 py-3 -5 pl-10 border rounded-full focus:outline-none focus:ring-2 ${searchInputStyles}`}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
              />
            </div>

            <Link
              to="/make-ride-request"
              className={`px-5 py-2 mr-10 rounded-full font-semibold shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${buttonStyles}`}
            >
              + New Ride
            </Link>
          </div>

          {/* Ride Posts */}
          <div className={`p-4 rounded-xl border ${sidebarBg} transition-colors duration-300`}>
            <RidePosts />
          </div>
        </div>

        {/* Right Sidebar - Desktop */}
        <div className=" hidden lg:block lg:col-span-3">
          <div className={`fixed top-12 p-4 rounded-xl border ${sidebarBg} transition-colors duration-300`}>
            <HomeRightBar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;