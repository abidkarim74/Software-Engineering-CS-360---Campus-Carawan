import { motion } from "framer-motion";
import { useTheme } from "../context/themeContext";
import { FaHistory, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

const HomeRightBar = () => {
  const { darkMode } = useTheme();
  
  // Sample ride history data
  const rideHistory = [
    { 
      id: 1, 
      from: "Downtown", 
      to: "City Center", 
      date: "March 25, 2025",
      fare: 450,
      duration: "25 min",
      driver: "John D."
    },
    { 
      id: 2, 
      from: "Airport", 
      to: "University", 
      date: "March 24, 2025",
      fare: 600,
      duration: "40 min",
      driver: "Jane S."
    },
    { 
      id: 3, 
      from: "Mall", 
      to: "Downtown", 
      date: "March 22, 2025",
      fare: 350,
      duration: "18 min",
      driver: "Alex M."
    }
  ];

  // Dynamic styles based on dark mode
  const containerStyles = darkMode
    ? "bg-gray-900 border-gray-700 shadow-lg shadow-gray-900/30"
    : "bg-white border-gray-200 shadow-lg shadow-gray-200/30";

  const textStyles = darkMode
    ? "text-gray-100"
    : "text-gray-800";

  const secondaryTextStyles = darkMode
    ? "text-gray-400"
    : "text-gray-500";

  const listItemStyles = darkMode
    ? "bg-gray-800 hover:bg-gray-700 border-gray-700"
    : "bg-gray-50 hover:bg-gray-100 border-gray-200";

  const accentColor = darkMode ? "text-blue-400" : "text-blue-500";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-4 rounded-xl border p-4 w-full max-w-sm ${containerStyles}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <FaHistory className={`text-xl ${accentColor}`} />
        <h3 className={`text-lg font-bold ${textStyles}`}>Recent Ride History</h3>
      </div>
      
      {rideHistory.length > 0 ? (
        <ul className="space-y-3">
          {rideHistory.map((ride) => (
            <motion.li
              key={ride.id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className={`p-3 rounded-lg border transition-all ${listItemStyles}`}
            >
              <div className="space-y-2">
                {/* Route Information */}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <FaMapMarkerAlt className={accentColor} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${textStyles}`}>{ride.from}</p>
                      <span className="text-xs text-gray-500">→</span>
                      <p className={`font-medium ${textStyles}`}>{ride.to}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className={`text-xs ${secondaryTextStyles} flex items-center gap-1`}>
                        <FaCalendarAlt className="text-xs" />
                        {ride.date}
                      </p>
                      <p className={`text-xs ${secondaryTextStyles}`}>
                        {ride.duration}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ride Details */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-700/30">
                  <p className={`text-sm ${secondaryTextStyles}`}>
                    Driver: <span className="font-medium">{ride.driver}</span>
                  </p>
                  <p className={`font-medium ${accentColor}`}>
                    Rs. {ride.fare}
                  </p>
                </div>
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
          <FaHistory className="mx-auto text-2xl mb-2 opacity-50" />
          <p>No recent rides</p>
          <p className="text-xs mt-1">Your ride history will appear here</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomeRightBar;