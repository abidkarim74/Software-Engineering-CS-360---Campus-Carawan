import { motion } from "framer-motion";
import { useTheme } from "../context/themeContext";
import { FaHistory, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

const HomeRightBar = () => {
  const { darkMode } = useTheme();

  const rideHistory = [
    {
      id: 1,
      from: "Downtown",
      to: "City Center",
      date: "March 25, 2025",
      fare: 450,
      duration: "25 min",
      driver: "John D.",
    },
    {
      id: 2,
      from: "Airport",
      to: "University",
      date: "March 24, 2025",
      fare: 600,
      duration: "40 min",
      driver: "Jane S.",
    },
    {
      id: 3,
      from: "Mall",
      to: "Downtown",
      date: "March 22, 2025",
      fare: 350,
      duration: "18 min",
      driver: "Alex M.",
    },
    // Add more rides to test scroll behavior...
  ];

  const containerStyles = darkMode
    ? "bg-gray-900 border-gray-700 shadow-black/30"
    : "bg-white border-gray-200 shadow-gray-200/30";

  const textColor = darkMode ? "text-gray-300" : "text-gray-700";
  const mutedText = darkMode ? "text-gray-400" : "text-gray-500";
  const headingText = darkMode ? "text-white" : "text-gray-900";
  const itemBg = darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200";
  const accent = darkMode ? "text-blue-400" : "text-blue-600";
  const border = darkMode ? "border-gray-700" : "border-gray-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`scrollable sticky top-4 w-full max-w-sm p-4 border rounded-xl ${containerStyles} ${border} max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/70 scrollbar-track-transparent`}
    >
      <div className="flex items-center gap-2 mb-4">
        <FaHistory className={`text-lg ${accent}`} />
        <h3 className={`text-lg font-semibold ${headingText}`}>Recent Ride History</h3>
      </div>

      <ul className="space-y-4">
        {rideHistory.map((ride) => (
          <motion.li
            key={ride.id}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`p-3 rounded-lg border ${border} ${itemBg} transition-all`}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-700 rounded-full">
                <FaMapMarkerAlt className={`${accent}`} />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap justify-between items-center">
                  <p className={`font-medium ${textColor}`}>
                    {ride.from} <span className="text-sm text-gray-500">→</span> {ride.to}
                  </p>
                </div>

                <div className="flex justify-between text-xs mt-1 flex-wrap gap-1">
                  <div className="flex items-center gap-1">
                    <FaCalendarAlt className="text-xs opacity-80" />
                    <span className={mutedText}>{ride.date}</span>
                  </div>
                  <p className={mutedText}>{ride.duration}</p>
                </div>

                <div className="flex justify-between items-center border-t pt-2 mt-2 text-sm border-gray-600/30">
                  <p className={`${mutedText}`}>
                    Driver: <span className="text-sm font-medium text-white">{ride.driver}</span>
                  </p>
                  <p className={`font-bold ${accent}`}>Rs. {ride.fare}</p>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default HomeRightBar;
