import { useState, useEffect, useContext, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBell,
  faEnvelope,
  faAngleDown,
  faSearch,
  faHome,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import SearchBarSmall from "./sub/SearchBarSmall";
import SearchBarDesktop from "./sub/SearchResult";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import DropDown from "./sub/DropDown";
import Messenger from "./Messenger";
import NotificationBar from "./sub/NotificationBar";
import { useTheme } from "../context/themeContext";
import { GeneralContext } from "../context/generalContext";
import { putRequest } from "../services/apiRequests";
import blueImage from "../static/blue.png";

const Header: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const { darkMode } = useTheme();
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

  // Updated to heavier blue theme
  const headerBg = darkMode
    ? "bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900"
    : "bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600";

  const textColor = darkMode ? "text-gray-100" : "text-white";
  const hoverTextColor = darkMode
    ? "hover:text-blue-300"
    : "hover:text-blue-200";

  const iconColor = darkMode ? "text-gray-300" : "text-blue-100";
  const hoverIconColor = darkMode
    ? "hover:text-blue-200"
    : "hover:text-white";

  const mobileMenuBg = darkMode ? "bg-blue-900" : "bg-blue-600";
  const mobileMenuText = darkMode ? "text-gray-100" : "text-white";

  // Button styles
  const fixed = screenWidth > 850 && "mr-40";
  const iconButtonStyle = `cursor-pointer text-lg transition-all duration-200 ${iconColor} ${hoverIconColor} hover:scale-110`;
  const mobileMenuItemStyle = darkMode
    ? "text-base py-2 px-4 rounded-lg transition-colors hover:bg-blue-800 hover:text-blue-200"
    : "text-base py-2 px-4 rounded-lg transition-colors hover:bg-blue-500 hover:text-white";

  // Navigation links
  const navLinks = [
    { to: "/", icon: faHome, text: "Home" },
    { to: "/trending", icon: faFire, text: "Trending" },
  ];

  return (
    <header
      className={`flex items-center justify-between ${headerBg} px-4 py-2 sticky top-0 z-50 h-14 shadow-lg`}
    >
      <div className="flex items-center">
        <div className="rounded-full transition-all duration-300 flex items-center hover:rotate-12">
          <img
            src={blueImage}
            alt={darkMode ? "Dark mode" : "Light mode"}
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain cursor-pointer hover:scale-105 transition-transform"
          />
        </div>
        {screenWidth > 1000 && (
          <SearchBarDesktop darkMode={darkMode}></SearchBarDesktop>
        )}
      </div>

      {screenWidth >= 720 ? (
        <nav className={`${fixed} flex gap-6 ${textColor}`}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1 ${hoverTextColor} text-sm font-medium transition-all`}
              title={link.text}
            >
              <FontAwesomeIcon icon={link.icon} className="text-base" />
              <span className="hidden sm:inline">{link.text}</span>
            </Link>
          ))}
        </nav>
      ) : (
        <button
          className={iconButtonStyle}
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}

      {/* Icons Section */}
      <div className="flex items-center gap-5">
        {screenWidth <= 1000 && (
          <FontAwesomeIcon
            icon={faSearch}
            onClick={() => setSearchOpen(!isSearchOpen)}
            className={iconButtonStyle}
          />
        )}

        <div className="relative">
          <FontAwesomeIcon
            icon={faEnvelope}
            onClick={handleMessengerOpen}
            className={iconButtonStyle}
          />
          {generalContext.unreadMessagesCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] animate-pulse">
              {generalContext.unreadMessagesCount}
            </div>
          )}
        </div>

        {isMessengerOpen && <Messenger />}

        <div className="relative">
          <FontAwesomeIcon
            icon={faBell}
            onClick={handleNewNotificationsOpen}
            className={iconButtonStyle}
          />
          {generalContext.unreadNotificationCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] animate-pulse">
              {generalContext.unreadNotificationCount}
            </div>
          )}
        </div>
        {isNotificationsOpen && <NotificationBar onClose={() => setNotificationOpen(false)} />}

        <Link to={`/profile/${user?.id}`} className="relative">
          <div
            className={`w-8 h-8 rounded-full p-[1px] ${
              darkMode
                ? "bg-gradient-to-r from-blue-700 to-blue-500"
                : "bg-gradient-to-r from-blue-700 to-blue-600"
            } transition-all hover:scale-110 shadow-md`}
          >
            <img
              src={user?.profilePic}
              alt="Profile"
              className={`w-full h-full object-cover rounded-full border-2 ${
                darkMode ? "border-blue-800" : "border-blue-500"
              }`}
            />
          </div>
        </Link>

        <FontAwesomeIcon
          onClick={() => setDropOpen(!isDropOpen)}
          icon={faAngleDown}
          className={iconButtonStyle}
        />
      </div>
      {isDropOpen && <DropDown onClose={() => setDropOpen(false)} />}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-14 left-0 w-full h-[calc(100vh-56px)] bg-black bg-opacity-50 flex justify-center items-start z-50">
          <div
            ref={mobileMenuRef}
            className={`${mobileMenuBg} ${mobileMenuText} shadow-xl rounded-b-lg p-5 flex flex-col gap-2 w-full max-w-md animate-slideDown`}
          >
            <button
              className={`absolute top-3 right-3 ${
                darkMode ? "text-gray-300" : "text-blue-100"
              } text-xl rounded-full w-8 h-8 flex items-center justify-center ${
                darkMode ? "hover:bg-blue-800" : "hover:bg-blue-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              ✕
            </button>
            
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={mobileMenuItemStyle}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={link.icon} className="mr-2" />
                {link.text}
              </Link>
            ))}
          </div>
        </div>
      )}

      <SearchBarSmall
        darkMode={darkMode}
        isSearchOpen={isSearchOpen}
        setSearchOpen={setSearchOpen}
      ></SearchBarSmall>
    </header>
  );
};

export default Header;