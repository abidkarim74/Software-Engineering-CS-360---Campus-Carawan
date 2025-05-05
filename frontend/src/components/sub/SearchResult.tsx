import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { useContext } from 'react';
import { postRequest } from '../../services/apiRequests';

type UserProbe = {
  id: number;
  fullname: string;
  profilePic?: string;
  driver: boolean;
  type: string;
};

type SearchBarDesktopProps = {
  darkMode?: boolean;
};

const SearchBarDesktop = ({ darkMode = false }: SearchBarDesktopProps) => {
  const auth = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [probes, setProbes] = useState<UserProbe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  if (!auth) {
    return null;
  }

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setProbes([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await postRequest(
        { para: query },
        "/general/search-users",
        auth.accessToken
      );
      setProbes(response);
    } catch (err) {
      setError("Failed to perform search");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const themeStyles = {
    searchBarBg: darkMode ? 'bg-gray-700' : 'bg-gray-100',
    searchBarFocused: darkMode ? 'bg-gray-600' : 'bg-white',
    textColor: darkMode ? 'text-white' : 'text-gray-900',
    placeholderColor: darkMode ? 'placeholder-gray-300' : 'placeholder-gray-500',
    dropdownBg: darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    resultItemBg: darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100',
    iconColor: darkMode ? 'text-gray-300' : 'text-gray-500',
    shadow: darkMode ? 'shadow-dark-lg' : 'shadow-lg'
  };

  return (
    <div className="relative w-full max-w-md mx-4" ref={searchRef}>
      {/* Search Bar */}
      <div className={`flex items-center rounded-full px-2 py-2 ${themeStyles.searchBarBg} ${showResults ? themeStyles.searchBarFocused : ''}`}>
        <svg 
          className={`h-5 w-5 ${themeStyles.iconColor} mr-2`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search..."
          className={`w-90% bg-transparent border-none focus:outline-none focus:ring-0 ${themeStyles.textColor} ${themeStyles.placeholderColor}`}
        />
        {searchQuery && (
          <button 
            onClick={() => {
              setSearchQuery('');
              setProbes([]);
              setShowResults(false);
            }}
            className={`p-1 rounded-full ${themeStyles.iconColor} hover:bg-opacity-20 hover:bg-gray-500`}
          >
            {/* <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg> */}
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className={`absolute mt-1 w-90% rounded-lg ${themeStyles.dropdownBg} ${themeStyles.shadow} z-50 overflow-hidden`}>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className={`p-4 text-center ${themeStyles.textColor}`}>{error}</div>
          ) : probes.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {probes.map(user => (
                <Link
                  to={`/profile/${user.id}`}
                  key={user.id}
                  className={`flex items-center p-3 ${themeStyles.resultItemBg} transition-colors`}
                  onClick={() => setShowResults(false)}
                >
                  <img 
                    src={user.profilePic || `https://ui-avatars.com/api/?name=${user.fullname}&background=random`}
                    alt={user.fullname}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className={`font-medium ${themeStyles.textColor}`}>{user.fullname}</p>
                    <div className="flex items-center mt-1 text-sm">
                      <span className={`px-2 py-0.5 rounded-full mr-2 ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                        {user.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full ${user.driver ? (darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800') : (darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800')}`}>
                        {user.driver ? 'Driver' : 'Passenger'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchQuery ? (
            <div className={`p-4 text-center ${themeStyles.textColor}`}>
              No results found for "{searchQuery}"
            </div>
          ) : (
            <div className={`p-4 text-center ${themeStyles.textColor}`}>
              Search for people and groups
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBarDesktop;