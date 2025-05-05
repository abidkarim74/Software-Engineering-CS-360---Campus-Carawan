import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faBars, 
  faSearch, 
  faTimes,
  faHome,
  faCar,
  
  faPlus
} from "@fortawesome/free-solid-svg-icons";
import RidePosts from "../components/RidePosts";
import { useTheme } from "../context/themeContext";
import CurrentActiveRide from "../components/CurrentActiveRide";

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { darkMode } = useTheme();
  const [placeholder, setPlaceholder] = useState("Search for rides...");
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"posts" | "active">("posts");

  // Color constants for consistent blue theme
  const blueColors = {
    primary: "bg-blue-600",
    hover: "hover:bg-blue-700",
    focus: "focus:ring-blue-500",
    border: "border-blue-600",
    text: "text-white",
    shadow: "shadow-md hover:shadow-lg",
  };

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      // Update placeholder text based on screen size
      if (window.innerWidth < 640) {
        setPlaceholder("Search rides...");
      } else if (window.innerWidth < 1024) {
        setPlaceholder("Search for rides...");
      } else {
        setPlaceholder("Search for rides or destinations...");
      }
    };

    // Initialize
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Utility classes with consistent blue theme
  const inputClass = `w-full px-4 py-2 pl-10 rounded-full focus:outline-none focus:ring-2 ${
    darkMode
      ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 focus:ring-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
  } border`;

  const buttonClass = `${blueColors.primary} ${blueColors.hover} ${blueColors.text} ${blueColors.shadow} font-medium rounded-full px-5 py-2 transition-all duration-200 transform hover:scale-[1.02]`;

  const mobileButtonClass = `${blueColors.primary} ${blueColors.text} w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl`;

  const renderSearchBar = () => (
    <div className={`relative ${isMobile ? "w-full" : "flex-1"}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={inputClass}
      />
      <FontAwesomeIcon
        icon={faSearch}
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
      />
    </div>
  );

  const handleMobileViewChange = (view: "posts" | "active") => {
    setMobileView(view);
    setMenuOpen(false);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Mobile Header */}
      {isMobile && (
        <header
          className="sticky top-0 z-10 p-4 shadow-md bg-opacity-90 backdrop-blur-sm"
          style={{
            backgroundColor: darkMode
              ? "rgba(17, 24, 39, 0.9)"
              : "rgba(255, 255, 255, 0.9)",
          }}
        >
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-full transition-colors ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <FontAwesomeIcon
                icon={menuOpen ? faTimes : faBars}
                className={`w-5 h-5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              />
            </button>
            {renderSearchBar()}
          </div>
        </header>
      )}

      {/* Mobile Menu */}
      {isMobile && menuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className={`absolute left-0 top-20 h-fit w-[80%] min-w-[300px] p-5 rounded-xl shadow-2xl ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => handleMobileViewChange("posts")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  darkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                } ${mobileView === "posts" ? (darkMode ? "bg-gray-700" : "bg-gray-100") : ""}`}
              >
                <FontAwesomeIcon 
                  icon={faHome} 
                  className={`${darkMode ? "text-blue-400" : "text-blue-600"}`} 
                />
                Ride Posts
              </button>
              <button
                onClick={() => handleMobileViewChange("active")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  darkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                } ${mobileView === "active" ? (darkMode ? "bg-gray-700" : "bg-gray-100") : ""}`}
              >
                <FontAwesomeIcon 
                  icon={faCar} 
                  className={`${darkMode ? "text-blue-400" : "text-blue-600"}`} 
                />
                Active Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {!isMobile ? (
          // Desktop Layout
          <div className="flex gap-6">
            {/* Left Sidebar - Active Ride */}
            <div className="w-[45%] relative flex-shrink-0">
              <div className="sticky top-24 h-[calc(100vh-6rem)]">
                <CurrentActiveRide />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-2xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                {renderSearchBar()}
                <Link
                  to="/make-ride-request"
                  className={`${buttonClass} whitespace-nowrap`}
                >
                  + New Ride
                </Link>
              </div>
              <div className="border-l-2 border-blue-800 pl-3">
                <RidePosts searchQuery={searchQuery} />
              </div>
            </div>
          </div>
        ) : (
          // Mobile Layout
          <>
            {mobileView === "posts" && (
              <div className="mt-4">
                <RidePosts searchQuery={searchQuery} />
              </div>
            )}

            {mobileView === "active" && (
              <div className="mt-4">
                <CurrentActiveRide />
              </div>
            )}

            {/* Mobile Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 z-10">
              <Link
                to="/make-ride-request"
                className={`${mobileButtonClass}`}
              >
                <FontAwesomeIcon icon={faPlus} />
              </Link>
            </div>

            {mobileView !== "posts" && (
              <div className="fixed bottom-6 left-6 z-10">
                <button
                  onClick={() => setMobileView("posts")}
                  className={`${mobileButtonClass} text-sm w-auto px-4`}
                >
                  <FontAwesomeIcon icon={faHome} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;