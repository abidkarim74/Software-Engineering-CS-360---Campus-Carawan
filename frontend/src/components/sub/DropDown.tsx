import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/authContext";
import { logoutUser } from "../../services/authServices";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/themeContext";
import { Settings, User, LogOut } from "react-feather";

interface DropDownProps {
  onClose: () => void;
}

const DropDown: React.FC<DropDownProps> = ({ onClose }) => {
  const auth = useContext(AuthContext);
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!auth) return <div className="text-gray-500">Loading...</div>;

  const { accessToken, setUser } = auth;

  const handleLogout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logoutUser(setUser, accessToken);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`
        absolute top-12 right-0 rounded-lg shadow-xl py-1 z-50 w-48
        ${darkMode ? 
          "bg-gray-800 text-white border border-gray-700" : 
          "bg-white text-gray-900 border border-gray-200"
        }
      `}
    >
      <Link
        to="/settings"
        onClick={onClose}
        className={`
          flex items-center px-4 py-3 transition duration-150
          ${darkMode ? 
            "hover:bg-gray-700" : 
            "hover:bg-gray-50"  // Lighter hover for light mode
          }
        `}
      >
        <Settings size={18} className="mr-3" />
        <span>Settings</span>
      </Link>

      <Link
        to={`/profile/${auth.user?.id}`}
        onClick={onClose}
        className={`
          flex items-center px-4 py-3 transition duration-150
          ${darkMode ? 
            "hover:bg-gray-700" : 
            "hover:bg-gray-50"  // Lighter hover for light mode
          }
        `}
      >
        <User size={18} className="mr-3" />
        <span>Profile</span>
      </Link>

      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

      <button
        onClick={handleLogout}
        disabled={loading}
        className={`
          flex items-center w-full text-left px-4 py-3 transition duration-150 
          ${darkMode ? 
            "text-red-400 hover:bg-red-900/30" : 
            "text-red-500 hover:bg-red-50"  // Lighter hover for light mode
          }
          disabled:opacity-50
        `}
      >
        <LogOut size={18} className="mr-3" />
        <span>{loading ? "Logging out..." : "Logout"}</span>
      </button>
    </div>
  );
};

export default DropDown;