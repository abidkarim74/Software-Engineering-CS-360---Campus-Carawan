import { motion } from "framer-motion";
import { useTheme } from "../context/themeContext";
import { FaCar, FaClock, FaMapMarkerAlt, FaCheckCircle } from "react-icons/fa";

const HomeLeftBar = () => {
  const { darkMode } = useTheme();
  
  // Sample ride requests data
  const rideRequests = [
    { 
      id: 1, 
      name: "John Doe", 
      location: "Downtown", 
      time: "10:30 AM",
      fare: 450,
      rating: 4.8
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      location: "Airport", 
      time: "11:00 AM",
      fare: 600,
      rating: 4.9
    },
    { 
      id: 3, 
      name: "Alice Johnson", 
      location: "City Center", 
      time: "11:45 AM",
      fare: 350,
      rating: 4.7
    }
  ];

  // Dynamic styles based on dark mode
  const containerStyles = darkMode
    ? "bg-gray-900 border-gray-700 shadow-gray-900/50"
    : "bg-white border-gray-200 shadow-gray-200";

  const textStyles = darkMode
    ? "text-gray-100"
    : "text-gray-800";

  const secondaryTextStyles = darkMode
    ? "text-gray-400"
    : "text-gray-500";

  const listItemStyles = darkMode
    ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
    : "bg-gray-50 hover:bg-gray-100 border-gray-200";

  const buttonStyles = darkMode
    ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
    : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600";

  const accentColor = darkMode ? "text-blue-400" : "text-blue-500";

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`sticky rounded-xl border shadow-lg p-2 w-[90%] max-w-xs ${containerStyles}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <FaCar className={`text-xl ${accentColor}`} />
        <h3 className={`text-lg font-bold ${textStyles}`}>Pending Ride Requests</h3>
      </div>
      
      {rideRequests.length > 0 ? (
        <ul className="space-y-3">
          {rideRequests.map((request) => (
            <motion.li
              key={request.id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={`p-3 rounded-lg border transition-all ${listItemStyles}`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-semibold ${textStyles}`}>{request.name}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
                      ⭐ {request.rating}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <FaMapMarkerAlt className={`text-xs ${secondaryTextStyles}`} />
                    <p className={secondaryTextStyles}>{request.location}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FaClock className={`text-xs ${secondaryTextStyles}`} />
                      <p className={secondaryTextStyles}>{request.time}</p>
                    </div>
                    <p className={`font-medium ${accentColor}`}>Rs. {request.fare}</p>
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${buttonStyles}`}
                >
                  <FaCheckCircle className="text-sm" />
                  <span>Accept</span>
                </motion.button>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center py-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} ${secondaryTextStyles}`}
        >
          <FaCar className="mx-auto text-2xl mb-2 opacity-50" />
          <p>No pending requests</p>
          <p className="text-xs mt-1">Check back later</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomeLeftBar;