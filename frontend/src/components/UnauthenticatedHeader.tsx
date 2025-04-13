import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import logo from "../../public/logo.jpg";

const UnauthenticatedHeader = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center p-3 bg-white shadow-md z-50 h-14">
      {/* Logo and Brand Name */}
      <div className="flex items-center gap-2">
        <img 
          src={logo} 
          alt="Logo" 
          className="w-8 h-8 object-contain" 
        />
        {windowWidth > 450 && (
          <span className="text-blue-800 font-semibold text-sm md:text-base">
            CampusCarawan
          </span>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        <nav className="flex gap-4">
          <Link 
            to="/about" 
            className="text-blue-800 font-medium hover:text-blue-600 text-sm"
          >
            About
          </Link>
          <Link 
            to="/contact-us" 
            className="text-blue-800 font-medium hover:text-blue-600 text-sm"
          >
            Contact Us
          </Link>
        </nav>
        
        <div className="flex gap-2">
          <Link 
            to="/login" 
            className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-1 rounded-full text-xs md:text-sm hover:from-blue-600 hover:to-blue-800 transition-all"
          >
            Log In
          </Link>
          <Link 
            to="/signup" 
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-3 py-1 rounded-full text-xs md:text-sm hover:from-blue-700 hover:to-blue-900 transition-all"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden text-blue-800 text-xl"
        onClick={() => setMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
      </button>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg flex flex-col items-center gap-3 p-4 md:hidden border-t border-gray-100">
          <Link 
            to="/about" 
            className="text-blue-800 font-medium hover:text-blue-600 w-full text-center py-2"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to="/contact-us" 
            className="text-blue-800 font-medium hover:text-blue-600 w-full text-center py-2"
            onClick={() => setMenuOpen(false)}
          >
            Contact Us
          </Link>
          <div className="flex gap-2 w-full justify-center pt-2">
            <Link 
              to="/login" 
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-1.5 rounded-full text-sm"
              onClick={() => setMenuOpen(false)}
            >
              Log In
            </Link>
            <Link 
              to="/signup" 
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-1.5 rounded-full text-sm"
              onClick={() => setMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default UnauthenticatedHeader;