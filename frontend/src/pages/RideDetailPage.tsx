import { getRequest } from "../services/apiRequests";
import { useState, useEffect } from "react";
import { useTheme } from "../context/themeContext";
import { AuthContext } from "../context/authContext";
import { useContext } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaUser,
  FaRoute,
} from "react-icons/fa";



const RideDetailPage = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    return;
  }
  const params = useParams();
  const { darkMode } = useTheme();
  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const url = `/rides/${params.postId}`;


  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await getRequest(
          url,
          auth?.accessToken,
          setLoading,
          setError
        );
        setPost(response);
      } catch (err) {
        setError("Failed to fetch ride details");
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [url, auth?.accessToken]);

  if (!auth) {
    return (
      <div className={`text-center p-8 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
        Please login to view ride details
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 ${
            darkMode ? "border-blue-400" : "border-blue-500"
          }`}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`text-center p-8 ${
          darkMode ? "text-red-400" : "text-red-500"
        }`}
      >
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className={`text-center p-8 ${
          darkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        Ride not found
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const styles = {
    container: darkMode
      ? "bg-gray-900 text-gray-100"
      : "bg-white text-gray-900",
    card: darkMode
      ? "bg-gray-800 border-gray-700"
      : "bg-white border-gray-200",
    text: darkMode ? "text-gray-100" : "text-gray-800",
    secondaryText: darkMode ? "text-gray-400" : "text-gray-600",
    highlight: darkMode ? "text-blue-400" : "text-blue-600",
    divider: darkMode ? "border-gray-700" : "border-gray-200",
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-8 ${styles.container}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-4xl mx-auto rounded-xl border ${styles.card} ${styles.divider} shadow-lg overflow-hidden`}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className={`text-2xl md:text-3xl font-bold ${styles.text}`}>
            Ride Details
          </h1>
          <p className={`mt-1 ${styles.secondaryText}`}>
            {formatDate(post.time)}
          </p>
        </div>

        {/* Map Section */}
        <div className="lg:w-2/3 h-[500px] lg:h-auto sticky overflow-hidden rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-gray-800">
        
         
      </div>
        {/* Route Information */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex flex-col items-center pt-1">
              <div
                className={`w-4 h-4 rounded-full ${
                  darkMode ? "bg-blue-400" : "bg-blue-500"
                }`}
              ></div>
              <div
                className={`w-0.5 h-12 my-1 ${
                  darkMode ? "bg-gray-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`w-4 h-4 rounded-full ${
                  darkMode ? "bg-red-400" : "bg-red-500"
                }`}
              ></div>
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <h3 className={`font-semibold ${styles.text} flex items-center gap-2`}>
                  <FaMapMarkerAlt className={styles.highlight} />
                  Pickup Location
                </h3>
                <p className={`mt-1 ml-6 ${styles.text}`}>{post.pickLocation}</p>
              </div>
              <div>
                <h3 className={`font-semibold ${styles.text} flex items-center gap-2`}>
                  <FaMapMarkerAlt className="text-red-500" />
                  Dropoff Location
                </h3>
                <p className={`mt-1 ml-6 ${styles.text}`}>{post.dropLocation}</p>
              </div>
            </div>
          </div>

          <div className={`border-t ${styles.divider} pt-6`}>
            <h2 className={`text-xl font-bold mb-4 ${styles.text}`}>
              Ride Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Departure Time */}
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <FaClock
                    className={`text-xl ${
                      darkMode ? "text-yellow-400" : "text-yellow-500"
                    }`}
                  />
                </div>
                <div>
                  <p className={`text-sm ${styles.secondaryText}`}>Departure Time</p>
                  <p className={`font-medium ${styles.text}`}>
                    {formatTime(post.departureTime)}
                  </p>
                </div>
              </div>

              {/* Fare */}
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <FaMoneyBillWave
                    className={`text-xl ${
                      darkMode ? "text-green-400" : "text-green-500"
                    }`}
                  />
                </div>
                <div>
                  <p className={`text-sm ${styles.secondaryText}`}>Fare</p>
                  <p className={`font-medium ${styles.text}`}>
                    Rs. {post.cost.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Seats Available */}
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <FaUsers
                    className={`text-xl ${
                      darkMode ? "text-purple-400" : "text-purple-500"
                    }`}
                  />
                </div>
                <div>
                  <p className={`text-sm ${styles.secondaryText}`}>Seats Available</p>
                  <p className={`font-medium ${styles.text}`}>{post.seats}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <FaRoute
                    className={`text-xl ${
                      darkMode ? "text-blue-400" : "text-blue-500"
                    }`}
                  />
                </div>
                <div>
                  <p className={`text-sm ${styles.secondaryText}`}>Status</p>
                  <p className={`font-medium ${styles.text}`}>
                    {post.isAccepted ? "Accepted" : "Available"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Information */}
          <div className={`border-t ${styles.divider} mt-6 pt-6`}>
            <h2 className={`text-xl font-bold mb-4 ${styles.text}`}>
              Driver Information
            </h2>
            <div className="flex items-center gap-4">
              <img
                src={post.poster.profilePic || "/default-avatar.png"}
                alt={post.poster.username}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/default-avatar.png";
                }}
              />
              <div>
                <h3 className={`font-bold ${styles.text}`}>
                  {post.poster.fullname || post.poster.username}
                </h3>
                <p className={`text-sm ${styles.secondaryText} flex items-center gap-1`}>
                  <FaUser className="text-xs" />
                  @{post.poster.username}
                </p>
                {post.poster.reviews && post.poster.reviews.length > 0 && (
                  <div className="mt-1 flex items-center">
                    <span className={`text-sm ${styles.highlight}`}>
                      ★ {post.poster.reviews.length} reviews
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RideDetailPage;