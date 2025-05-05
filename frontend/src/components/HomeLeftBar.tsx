import { motion } from "framer-motion";
import { useTheme } from "../context/themeContext";
import { FaCar, FaClock, FaMapMarkerAlt, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import { getRequest } from "../services/apiRequests";
import { useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import { useContext } from "react";
import { Link } from "react-router-dom";

interface RideRequest {
  id: string;
  otherId: string;
  pickLocation: string;
  dropLocation: string;
  time: string;
  isAccepted: boolean;
  cost: number;
  departureTime: number;
}

const HomeLeftBar = () => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    return null;
  }
  
  const { darkMode } = useTheme();
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const url = "/rides/pending-rides";
  const accessToken = auth.accessToken;
  
  useEffect(() => {
    const fetchPendingRides = async () => {
      try {
        setLoading(true);
        const response = await getRequest(url, accessToken);
        setRideRequests(response);
        setError(null);
      } catch (err) {
        setError("Failed to fetch pending rides. Please try again later.");
        console.error("Error fetching pending rides:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRides();
  }, [accessToken]);

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    
    return "just now";
  };

  const formatDepartureTime = (minutes: number) => {
    const now = new Date();
    const departureDate = new Date(now.getTime() + minutes * 60000);
    return departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const shortenLocation = (location: string) => {
    const parts = location.split(',');
    return parts[parts.length - 1].trim();
  };

  const themeStyles = {
    container: darkMode
      ? "bg-gray-900 border-gray-700 shadow-lg shadow-gray-900/30"
      : "bg-white border-gray-200 shadow-lg shadow-gray-200/30",
    text: {
      primary: darkMode ? "text-gray-100" : "text-gray-800",
      secondary: darkMode ? "text-gray-300" : "text-gray-600",
      accent: darkMode ? "text-teal-400" : "text-teal-600",
      rating: darkMode ? "text-amber-400" : "text-amber-600",
      pending: darkMode ? "text-amber-300" : "text-amber-500",
      accepted: darkMode ? "text-emerald-400" : "text-emerald-500"
    },
    background: {
      listItem: darkMode
        ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
        : "bg-gray-50 hover:bg-gray-100 border-gray-200",
      emptyState: darkMode ? "bg-gray-800" : "bg-gray-100",
      rating: darkMode ? "bg-gray-700" : "bg-amber-100",
      pending: darkMode ? "bg-yellow-900/30" : "bg-yellow-200",
      accepted: darkMode ? "bg-emerald-900/30" : "bg-emerald-100/70"
    },
    button: darkMode
      ? "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
      : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600",
    icon: {
      primary: darkMode ? "text-teal-400" : "text-teal-500",
      secondary: darkMode ? "text-amber-400" : "text-amber-500",
      accent: darkMode ? "text-indigo-400" : "text-indigo-500",
      neutral: darkMode ? "text-gray-400" : "text-gray-500"
    }
  };
  

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
      custom-scrollbar
        rounded-xl border p-4 
        w-full max-w-xs lg:max-w-md
        h-[85vh]
        flex flex-col
        ${themeStyles.container}
      `}
      aria-label="Pending ride requests panel"
    >
      <div className="flex items-center gap-3 mb-4">
        <FaCar className={`text-xl ${themeStyles.icon.primary}`} aria-hidden="true" />
        <h2 className={`text-lg font-semibold ${themeStyles.text.primary}`}>
          Ride Requests
        </h2>
      </div>
      <hr />
      <br />

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex-1 flex items-center justify-center rounded-lg ${themeStyles.background.emptyState} ${themeStyles.text.secondary}`}
          aria-label="Loading requests"
        >
          <p>Loading requests...</p>
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex-1 flex items-center justify-center rounded-lg ${themeStyles.background.emptyState} ${themeStyles.text.secondary}`}
          aria-label="Error loading requests"
        >
          <p>{error}</p>
        </motion.div>
      ) : rideRequests.length > 0 ? (
        <ul 
          className="flex-1 overflow-y-auto space-y-3 pr-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: darkMode ? '#4B5563 #1F2937' : '#E5E7EB #F3F4F6'
          }}
        >
          {rideRequests.map((request) => (
            <Link 
              to={`/ride/${request.id}`} 
              key={request.id}
              className="block"
              aria-label={`View details of ride request from ${request.otherId}`}
            >
              <motion.li
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className={`p-3 rounded-lg border transition-all ${themeStyles.background.listItem}`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex flex-col">
                      {/* <h3 className={`font-semibold text-lg ${themeStyles.text.primary}`}>
                        {request.otherId}
                      </h3> */}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${themeStyles.text.secondary}`}>
                          {formatRelativeTime(request.time)}
                        </span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium 
                      ${request.isAccepted ? 
                        `${themeStyles.background.accepted} ${themeStyles.text.accepted}` : 
                        `${themeStyles.background.pending} ${themeStyles.text.pending}`}`}
                    >
                      {request.isAccepted ? (
                        <>
                          <FaCheckCircle className="text-xs" />
                          <span>Accepted</span>
                        </>
                      ) : (
                        <>
                          <FaHourglassHalf className="text-xs" />
                          <span>Pending</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className={`text-xs ${themeStyles.icon.accent}`} aria-hidden="true" />
                      <p className={themeStyles.text.secondary}>
                        <span className="font-medium">From:</span> {shortenLocation(request.pickLocation)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className={`text-xs ${themeStyles.icon.accent}`} aria-hidden="true" />
                      <p className={themeStyles.text.secondary}>
                        <span className="font-medium">To:</span> {shortenLocation(request.dropLocation)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className={`text-xs ${themeStyles.icon.secondary}`} aria-hidden="true" />
                      <p className={themeStyles.text.secondary}>
                        Departure: {formatDepartureTime(request.departureTime)}
                      </p>
                    </div>
                    <p className={`font-medium ${themeStyles.text.accent}`} aria-label={`Cost: Rs. ${request.cost}`}>
                     Fare: Rs. {request.cost.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.li>
            </Link>
          ))}
        </ul>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex-1 flex flex-col items-center justify-center rounded-lg ${themeStyles.background.emptyState} ${themeStyles.text.secondary}`}
          aria-label="No pending requests"
        >
          <FaCar className={`mx-auto text-2xl mb-2 ${themeStyles.icon.neutral}`} aria-hidden="true" />
          <p>No ride requests</p>
          <p className="text-xs mt-1">Check back later</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomeLeftBar;