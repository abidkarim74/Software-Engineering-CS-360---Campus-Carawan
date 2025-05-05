import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import { postRequest } from '../../services/apiRequests';

type SearchBarSmallProps = {
  darkMode?: boolean;
  isSearchOpen: boolean;
  setSearchOpen: Dispatch<SetStateAction<boolean>>;
};

type SearchResult = {
  id: string;
  fullname: string;
  studentName?: string;
  profilePic?: string;
  type: string;
  driver: boolean;
};

const SearchBarSmall = ({ 
  darkMode = false, 
  isSearchOpen, 
  setSearchOpen 
}: SearchBarSmallProps) => {
  const auth = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimeout = useRef<number | null>(null);

  if (!auth) {
    return null;
  }

  // Styling classes (same as before)
  const searchInputBg = darkMode
    ? "bg-gray-700 border-gray-600 placeholder-gray-400 text-gray-100 focus:bg-gray-600 focus:border-blue-400 focus:ring-blue-500"
    : "bg-gray-100 border-gray-300 placeholder-gray-500 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-blue-300";

  const mobileMenuBg = darkMode ? "bg-gray-800" : "bg-white";
  const mobileMenuText = darkMode ? "text-gray-100" : "text-gray-900";
  const resultHoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";
  const dividerColor = darkMode ? "divide-gray-700" : "divide-gray-200";

  // Perform search with debouncing
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        const response = await postRequest(
          { para: searchQuery },
          "/general/search-users",
          auth.accessToken
        );

        setSearchResults(response);
      } catch (err) {
        setError("Failed to perform search");
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce delay

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery, auth.accessToken]);

  const handleClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setHasSearched(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Prevent form submission (we're handling search on input change)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <>
      {isSearchOpen && (
        <div className="fixed inset-0 top-14 z-50 flex justify-center items-start pt-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
            onClick={handleClose}
          />
          
          {/* Search content */}
          <div
            className={`relative ${mobileMenuBg} ${mobileMenuText} shadow-xl rounded-lg p-4 w-[95%] max-w-lg ${darkMode ? "bg-opacity-95" : "bg-opacity-98"} z-10 border ${darkMode ? "border-gray-700" : "border-gray-200"}`}
          >
            <button
              className={`absolute top-3 right-3 p-1 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"} transition-colors`}
              onClick={handleClose}
              aria-label="Close search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <form onSubmit={handleSubmit} className="mb-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  placeholder="Search users by name or student ID..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-full border ${searchInputBg} outline-none text-base shadow-sm`}
                  autoFocus
                />
                {isLoading && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </div>
            </form>
            
            <div className={`mt-2 max-h-[65vh] overflow-y-auto rounded-lg ${darkMode ? "scrollbar-dark" : "scrollbar-light"}`}>
              {isLoading && searchResults.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className={`p-4 text-center rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-red-500 dark:text-red-400 font-medium">{error}</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className={`divide-y ${dividerColor}`}>
                  {searchResults.map((user) => (
                    <Link 
                      to={`/profile/${user.id}`}
                      key={user.id}
                      onClick={handleClose}
                      className={`block py-3 px-3 ${resultHoverBg} transition-colors duration-150`}
                    >
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 relative ${darkMode ? "ring-gray-600" : "ring-gray-200"} ring-1 rounded-full`}>
                          {user.profilePic ? (
                            <img 
                              src={user.profilePic} 
                              alt={user.fullname}
                              className="w-11 h-11 rounded-full object-cover"
                            />
                          ) : (
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                              <span className={`text-xl font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                {user.fullname.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 overflow-hidden">
                          <p className={`text-sm font-semibold truncate ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                            {user.fullname}
                          </p>
                          {user.studentName && (
                            <p className={`text-xs truncate ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {user.studentName}
                            </p>
                          )}
                          <div className="flex items-center mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                              {user.type}
                            </span>
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${user.driver ? (darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-800") : (darkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800")}`}>
                              {user.driver ? 'Driver' : 'Passenger'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : hasSearched && searchQuery ? (
                <div className={`p-6 text-center rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-3 text-gray-500 dark:text-gray-400">
                    No results found for <span className="font-medium">"{searchQuery}"</span>
                  </p>
                </div>
              ) : (
                <div className={`p-6 text-center rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="mt-3 text-gray-500 dark:text-gray-400">
                    {searchQuery.length === 0 
                      ? "Search for users by name or student ID"
                      : "Keep typing to search..."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchBarSmall;