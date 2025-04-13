import { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBell,
  faEnvelope,
  faAngleDown,
  faSearch,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import DropDown from "./sub/DropDown";
import Messenger from "./Messenger";
import NotificationBar from "./sub/NotificationBar";
import { useTheme } from "../context/themeContext";
import { GeneralContext } from "../context/generalContext";
import { putRequest } from "../services/apiRequests";
// import blackImage from "../static/black.png";
import whiteImage from "../static/white.png";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const { darkMode, toggleTheme } = useTheme();

  const auth = useContext(AuthContext);
  if (!auth) return <div>Loading...</div>;
  const { user } = auth;

  const generalContext = useContext(GeneralContext);
  if (!generalContext) {
    return;
  }

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isSearchOpen, setSearchOpen] = useState<boolean>(false);
  const [isDropOpen, setDropOpen] = useState<boolean>(false);
  const [isMessengerOpen, setMessengerOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setNotificationOpen] = useState<boolean>(false);

  const handleMessengerOpen = () => {
    setMessengerOpen(!isMessengerOpen);
    setDropOpen(false);
    setSearchOpen(false);
    setNotificationOpen(false);
  };

  const readNotifications = async () => {
    const response = await putRequest({}, "/notifications/update");
    generalContext.setUnreadNotificationCount(0);
    console.log(response);
  };

  const handleNewNotificationsOpen = () => {
    readNotifications();
    setNotificationOpen(!isNotificationsOpen);
    setMessengerOpen(false);
    setDropOpen(false);
    setSearchOpen(false);
  };

  // Inverted color scheme
  const headerBg = darkMode ? "bg-white" : "bg-black";
  const textColor = darkMode ? "text-black" : "text-white";
  const hoverTextColor = darkMode ? "hover:text-gray-700" : "hover:text-gray-300";
  const mobileMenuBg = darkMode ? "bg-white" : "bg-gray-900";
  const mobileMenuText = darkMode ? "text-black" : "text-white";
  const searchInputBg = darkMode
    ? "bg-gray-100 border-gray-200 placeholder-gray-500 text-black focus:bg-white focus:border-gray-300"
    : "bg-gray-800 border-gray-700 placeholder-gray-400 text-white focus:bg-gray-700 focus:border-gray-600";
  const profileBorder = darkMode ? "border-black" : "border-white";
  const iconHoverColor = darkMode ? "hover:text-gray-700" : "hover:text-gray-300";
  const borderColor = darkMode ? "border-gray-200" : "border-gray-700";

  return (
    <header
      className={`flex items-center justify-between ${headerBg} px-3 py-1 shadow-md ${textColor} sticky top-0 z-50 h-14 border-b ${borderColor}`}
    >
      {/* Logo and Search */}
      <div className="flex items-center">
        <div className="rounded-full transition-colors duration-200 flex items-center">
          <img
            src={whiteImage}
            alt={darkMode ? "Light mode" : "Dark mode"}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain cursor-pointer hover:scale-105 transition-transform"
          />
        </div>
        {screenWidth > 1000 && (
          <div className="ml-2">
            <input
              type="text"
              placeholder="Search..."
              className={`w-full max-w-xs px-3 py-1.5 rounded-full border ${searchInputBg} focus:ring-1 focus:ring-gray-400 outline-none shadow-sm transition-all duration-300 text-sm`}
            />
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      {screenWidth > 700 ? (
        <nav className={`flex gap-4 ${textColor}`}>
          <Link to="/" className={`hover:underline ${hoverTextColor} text-sm`}>
            Home
          </Link>
          <Link to="#" className={`hover:underline ${hoverTextColor} text-sm`}>
            Ride Request
          </Link>
          <Link to="#" className={`hover:underline ${hoverTextColor} text-sm`}>
            Ride History
          </Link>
          <Link to="#" className={`hover:underline ${hoverTextColor} text-sm`}>
            Complain
          </Link>
        </nav>
      ) : (
        <button
          className={`text-xl ${iconHoverColor}`}
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}

      {/* Icons Section */}
      <div className="flex items-center gap-4">
        {screenWidth <= 1000 && (
          <FontAwesomeIcon
            icon={faSearch}
            onClick={() => setSearchOpen(!isSearchOpen)}
            className={`cursor-pointer text-lg ${iconHoverColor}`}
          />
        )}

        <div className="relative">
          <FontAwesomeIcon
            icon={faEnvelope}
            onClick={handleMessengerOpen}
            className={`cursor-pointer text-xl transition-all duration-300 ${iconHoverColor} hover:scale-110`}
          />
          {generalContext.unreadMessagesCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {generalContext.unreadMessagesCount}
            </div>
          )}
        </div>

        {isMessengerOpen && <Messenger />}

        <div className="relative">
          <FontAwesomeIcon
            icon={faBell}
            onClick={handleNewNotificationsOpen}
            className={`cursor-pointer text-xl transition-all duration-300 ${iconHoverColor} hover:scale-110`}
          />
          {generalContext.unreadNotificationCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {generalContext.unreadNotificationCount}
            </div>
          )}
        </div>
        {isNotificationsOpen && <NotificationBar />}

        <Link to={`/${user?.id}`} className="relative">
          <div
            className={`w-8 h-8 rounded-full border-2 ${profileBorder} transition-all hover:scale-110`}
          >
            <img
              src={user?.profilePic}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </Link>

        <FontAwesomeIcon
          onClick={() => setDropOpen(!isDropOpen)}
          icon={faAngleDown}
          className={`cursor-pointer text-xl transition-all duration-300 ${iconHoverColor} hover:scale-110`}
        />
      </div>
      {isDropOpen && <DropDown />}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] bg-black bg-opacity-50 flex justify-center items-start z-50">
          <div
            className={`${mobileMenuBg} ${mobileMenuText} shadow-lg rounded-b-md p-4 flex flex-col gap-3 w-full`}
          >
            <button
              className={`absolute top-2 right-2 text-xl ${mobileMenuText}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              ✕
            </button>
            <Link
              to="/"
              className={`text-base py-2 px-3 rounded ${darkMode ? "hover:bg-gray-100" : "hover:bg-gray-800"}`}
            >
              Home
            </Link>
            <Link
              to="#"
              className={`text-base py-2 px-3 rounded ${darkMode ? "hover:bg-gray-100" : "hover:bg-gray-800"}`}
            >
              Ride Request
            </Link>
            <Link
              to="#"
              className={`text-base py-2 px-3 rounded ${darkMode ? "hover:bg-gray-100" : "hover:bg-gray-800"}`}
            >
              Ride History
            </Link>
            <Link
              to="#"
              className={`text-base py-2 px-3 rounded ${darkMode ? "hover:bg-gray-100" : "hover:bg-gray-800"}`}
            >
              Complain
            </Link>
            <button
              onClick={toggleTheme}
              className={`text-base py-2 px-3 rounded flex items-center gap-2 ${darkMode ? "hover:bg-gray-100" : "hover:bg-gray-800"}`}
            >
              <FontAwesomeIcon icon={darkMode ? faMoon : faSun} />
              {darkMode ? "Dark Mode" : "Light Mode"}
            </button>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] flex justify-center items-start z-50 pt-4">
          <div
            className={`${mobileMenuBg} ${mobileMenuText} shadow-lg rounded-md p-4 w-[95%] max-w-lg ${darkMode ? "bg-opacity-95" : "bg-opacity-90"}`}
          >
            <button
              className={`absolute top-2 right-2 text-xl ${mobileMenuText}`}
              onClick={() => setSearchOpen(false)}
            >
              ✕
            </button>
            <input
              type="text"
              placeholder="Search..."
              className={`w-full px-4 py-2 rounded-full border ${darkMode ? "border-gray-200 bg-gray-100 text-black focus:border-gray-300" : "border-gray-700 bg-gray-800 text-white focus:border-gray-600"} outline-none text-base shadow-md focus:ring-1 focus:ring-gray-400`}
            />
            <div className="mt-2 text-center text-sm">No Search Results</div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;