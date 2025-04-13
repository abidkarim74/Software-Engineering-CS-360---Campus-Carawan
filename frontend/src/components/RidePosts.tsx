import { getRequest, postRequest } from "../services/apiRequests";
import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/themeContext";
import {
  FaCar,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
} from "react-icons/fa";
import { IoCheckmarkDoneCircle } from "react-icons/io5";

interface Post {
  id: string;
  poster: {
    id: string;
    username: string;
    profilePic: string;
    vehicles: any;
  };
  pickLocation: string;
  dropLocation: string;
  cost: number;
  time: string;
  isAccepted: boolean;
  departureTime: string;
  seets: number;
}

const RidePosts = () => {
  // Context hooks
  const auth = useContext(AuthContext);
  const { darkMode } = useTheme();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notification] = useState("You got a ride request!");

  // API endpoints
  const url = "/rides/ride-requests";
  const postUrl = "/notifications/create";

  // Memoized styles
  const styles = useMemo(
    () => ({
      container: darkMode
        ? "bg-gray-900 text-gray-100 border-gray-700"
        : "bg-white text-gray-900 border-gray-200",
      card: darkMode
        ? "bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-900/30"
        : "bg-white border-gray-200 hover:shadow-lg hover:shadow-blue-100",
      text: darkMode ? "text-gray-100" : "text-gray-800",
      secondaryText: darkMode ? "text-gray-400" : "text-gray-600",
      button: (isAccepted: boolean) =>
        isAccepted
          ? "bg-gray-500 text-white cursor-not-allowed"
          : darkMode
            ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white",
      statusIndicator: (isAccepted: boolean) =>
        isAccepted
          ? "bg-green-500 border-2 border-white"
          : "bg-yellow-500 border-2 border-white",
    }),
    [darkMode]
  );

  // Data fetching
  const fetchRidePosts = useCallback(async () => {
    if (!auth?.accessToken) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getRequest(
        url,
        auth.accessToken,
        setLoading,
        setError
      );

      console.log("Rides: ", response);
      setPosts(response || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [auth?.accessToken]);

  // Handle ride acceptance
  const handleAccept = useCallback(
  
  
    async (postId: string, posterId: string) => {
      console.log(postId);
      if (!auth?.accessToken) return;

      try {
        const response = await postRequest(
          { userId: posterId, message: notification },
          postUrl,
          auth.accessToken
        );

        if (response) {
          setSuccessMessage("Ride request accepted successfully!");
          setTimeout(() => setSuccessMessage(null), 3000);
          fetchRidePosts(); // Refresh the list
        }
      } catch (err: any) {
        setError(err instanceof Error ? err.message : "Failed to accept ride");
      }
    },
    [auth?.accessToken, notification, fetchRidePosts]
  );

  // Initial data load
  useEffect(() => {
    fetchRidePosts();
  }, [fetchRidePosts]);

  // Render loading/error states
  if (!auth) {
    return (
      <div
        className={`text-center p-8 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        Please login to view ride posts
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 ${darkMode ? "border-blue-400" : "border-blue-500"}`}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`text-center p-8 ${darkMode ? "text-red-400" : "text-red-500"}`}
      >
        <p>Error: {error}</p>
        <button
          onClick={fetchRidePosts}
          className={`mt-4 px-4 py-2 rounded-lg ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"} text-white transition-colors`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={`max-w-3xl mx-auto p-4 md:p-6 rounded-xl ${styles.container}`}
    >
      <h3
        className={`text-2xl font-bold mb-6 text-center ${styles.text} flex items-center justify-center gap-2`}
      >
        <FaCar className="text-blue-500" />
        Available Ride Requests
      </h3>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`mb-4 p-3 rounded-lg text-center font-medium ${
            darkMode
              ? "bg-green-900/50 text-green-300"
              : "bg-green-100 text-green-800"
          }`}
        >
          {successMessage}
        </motion.div>
      )}

      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              className={`rounded-xl p-5 border transition-all ${styles.card}`}
            >
              <div className="flex flex-col space-y-4">
                {/* Poster Info */}
                <Link
                  to={`/user/${post.poster.id}`}
                  className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                >
                  <div className="relative">
                    <img
                      src={post.poster.profilePic || "/default-avatar.png"}
                      alt={post.poster.username}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/default-avatar.png";
                      }}
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${styles.statusIndicator(post.isAccepted)}`}
                    ></span>
                  </div>
                  <div>
                    <span className={`font-semibold ${styles.text}`}>
                      {post.poster.username}
                    </span>
                    <small
                      className={`block text-sm ${styles.secondaryText} flex items-center gap-1`}
                    >
                      <FaClock className="text-xs" />
                      {new Date(post.time).toLocaleString()}
                    </small>
                  </div>
                </Link>
                <hr />

                {/* Ride Details */}
                <div className={`space-y-6 ${styles.text}`}>
                  {/* Location Section */}
                  <div className="space-y-4">
                    {/* Pickup/Dropoff Section */}
                    <div className="space-y-3">
                      {/* Pickup */}
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt
                          className={`mt-1 ${darkMode ? "text-blue-400" : "text-blue-500"}`}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Pickup
                          </p>
                          <p className="text-sm">{post.pickLocation}</p>
                        </div>
                      </div>

                      {/* Dropoff */}
                      <div className="flex items-start gap-3">
                        <FaMapMarkerAlt
                          className={`mt-1 ${darkMode ? "text-red-400" : "text-red-500"}`}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Dropoff
                          </p>
                          <p className="text-sm">{post.dropLocation}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-row gap-6">
                      {/* Map Placeholder */}
                      <div
                        className={`flex-1 h-48 rounded-lg border ${
                          darkMode
                            ? "bg-gray-800 border-gray-700"
                            : "bg-gray-100 border-gray-300"
                        }`}
                      >
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          Map Preview
                        </div>
                      </div>

                      {/* Quick Details */}
                    
                    </div>
                  </div>

                  <hr
                    className={`${darkMode ? "border-gray-700" : "border-gray-200"}`}
                  />

                  {/* Ride Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Seats */}
                    <div className="flex items-center gap-3">
                      <FaClock
                        className={`${darkMode ? "text-yellow-400" : "text-yellow-500"}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Time
                        </p>
                        <p className="text-sm">
                          {new Date(post.departureTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Fare */}
                    <div className="flex items-center gap-3">
                      <FaMoneyBillWave
                        className={`${darkMode ? "text-green-400" : "text-green-500"}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Fare
                        </p>
                        <p className="text-sm">
                          Rs. {post.cost.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Passengers */}
                    <div className="flex items-center gap-3">
                      <FaUsers
                        className={`${darkMode ? "text-purple-400" : "text-purple-500"}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Passengers
                        </p>
                        <p className="text-sm">{post.seets || 0}</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-3">
                      <FaCar
                        className={`${darkMode ? "text-purple-400" : "text-purple-500"}`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Vehicle
                        </p>
                        <p className="text-sm">{"dasd"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleAccept(post.id, post.poster.id)}
                  className={`w-full py-2.5 mt-2 rounded-lg font-medium transition-all ${styles.button(post.isAccepted)} flex items-center justify-center gap-2`}
                  disabled={post.isAccepted}
                >
                  {post.isAccepted ? (
                    <>
                      <IoCheckmarkDoneCircle className="text-lg" />
                      Accepted
                    </>
                  ) : (
                    "Accept Ride"
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center py-12 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-50"} ${styles.secondaryText}`}
        >
          <FaCar className="mx-auto text-4xl mb-3 opacity-50" />
          <p className="text-lg font-medium">No ride requests available</p>
          <p className="mt-1 text-sm">
            Check back later or create your own ride post!
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default RidePosts;
