import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import logo from "../../public/logo.jpg";

const UnauthenticatedHeader = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const isMobile = windowWidth <= 768; // md breakpoint

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Logo and Brand Name */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-8 h-8 object-contain rounded"
            />
            {windowWidth > 450 && (
              <span className="text-blue-800 font-bold text-lg">
                CampusCaravan
              </span>
            )}
          </Link>

          {/* Desktop Navigation - Login/Signup always visible on mobile */}
          <div className="flex items-center gap-4">
            {isMobile && (
              <div className="flex gap-2 mr-2">
                <Link 
                  to="/login" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-xs hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Desktop Navigation - Main Links */}
            {!isMobile && (
              <nav className="flex gap-6 mr-4">
                <Link 
                  to="/about" 
                  className="text-blue-800 font-medium hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
                >
                  About
                </Link>
                <Link 
                  to="/contact-us" 
                  className="text-blue-800 font-medium hover:text-blue-600 transition-colors px-2 py-1 rounded-md hover:bg-blue-50"
                >
                  Contact Us
                </Link>
              </nav>
            )}

            {/* Desktop Navigation - Auth Buttons */}
            {!isMobile && (
              <div className="flex gap-3">
                <Link 
                  to="/login" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                  Log In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className={`md:hidden text-blue-800 text-xl p-1 rounded-full hover:bg-blue-50 transition-colors ${isMenuOpen ? 'bg-blue-50' : ''}`}
              onClick={() => setMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && isMobile && (
          <div className="absolute left-0 w-full bg-white shadow-lg flex flex-col items-stretch gap-1 p-2 border-t border-gray-100">
            <Link 
              to="/about" 
              className="text-blue-800 font-medium hover:text-blue-600 px-4 py-3 rounded-md hover:bg-blue-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact-us" 
              className="text-blue-800 font-medium hover:text-blue-600 px-4 py-3 rounded-md hover:bg-blue-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default UnauthenticatedHeader;