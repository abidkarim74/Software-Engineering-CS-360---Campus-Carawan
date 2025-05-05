import { getRequest, postRequest } from "../services/apiRequests";
import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/themeContext";
import { useNavigate } from "react-router-dom";
import {
  FaCar,
  FaMoneyBillWave,
  FaClock,
  FaUsers,
} from "react-icons/fa";
import { IoCheckmarkDoneCircle } from "react-icons/io5";

interface RidePostsProps {
  searchQuery?: string;
}

const RidePosts = ({ searchQuery = "" }: RidePostsProps) => {
  const auth = useContext(AuthContext);
  const { darkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();

  const styles = useMemo(
    () => ({
      container: darkMode
        ? "bg-gray-900 text-gray-100"
        : "bg-gray-50 text-gray-900",
      card: darkMode
        ? "bg-gray-800 border-gray-700"
        : "bg-white border-gray-200",
      text: darkMode ? "text-gray-100" : "text-gray-800",
      secondaryText: darkMode ? "text-gray-400" : "text-gray-600",
      button: (isAccepted: boolean) =>
        isAccepted
          ? "bg-gray-500 text-white cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700 text-white",
      statusIndicator: (isAccepted: boolean) =>
        isAccepted
          ? "bg-green-500 border-2 border-white"
          : "bg-yellow-500 border-2 border-white",
      divider: darkMode ? "border-gray-700" : "border-gray-200",
    }),
    [darkMode]
  );

  const fetchRidePosts = useCallback(async () => {
    if (!auth?.accessToken) return;
    const url = "/rides/ride-requests";

    setLoading(true);
    setError(null);
    try {
      const response = await getRequest(
        url,
        auth.accessToken,
        setLoading,
        setError
      );

      const postsWithCoords = response.map((post: any) => ({
        ...post,
        pickLocationCoords: post.pickLocationCoords || [0, 0],
        dropLocationCoords: post.dropLocationCoords || [0, 0],
      }));

      setPosts(postsWithCoords || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  }, [auth?.accessToken]);

  const handleAccept = useCallback(
    async (postId: string, posterId: string) => {
      if (!auth?.accessToken) return;

      console.log(posterId)

      const acceptUrl = "/rides/accept-request";

      setError(null);
      try {
        const response = await postRequest(
          { id: postId },
          acceptUrl,
          auth.accessToken
        );

        if (response) {
          setSuccessMessage("Ride request accepted successfully!");
          setTimeout(() => setSuccessMessage(null), 3000);
          fetchRidePosts();
          setTimeout(() => {
            navigate("/ride/" + postId);
          }, 500);
        }
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError(
            err instanceof Error ? err.message : "Failed to accept ride"
          );
        }
      }
    },
    [auth?.accessToken, fetchRidePosts, navigate]
  );

  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return posts;

    const query = searchQuery.toLowerCase().trim();
    return posts.filter(
      (post) =>
        post.pickLocation.toLowerCase().includes(query) ||
        post.dropLocation.toLowerCase().includes(query)
    );
  }, [posts, searchQuery]);

  useEffect(() => {
    fetchRidePosts();
  }, [fetchRidePosts]);

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
          className={`animate-spin rounded-full h-12 w-12 border-t-2 ${darkMode ? "border-blue-400" : "border-blue-600"}`}
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
          onClick={() => {
            setError(null);
            fetchRidePosts();
          }}
          className={`mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-3xl mx-auto p-4 ${styles.container}`}>
      <div className="mb-6">
        <h1 className={`text-3xl font-bold ${styles.text} mb-1`}>
          Ride Requests
        </h1>
        <p className={`text-sm ${styles.secondaryText}`}>
          Available ride requests in your area
        </p>
      </div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`mb-4 p-3 rounded-lg ${
            darkMode
              ? "bg-green-900/50 text-green-300"
              : "bg-green-100 text-green-800"
          }`}
        >
          {successMessage}
        </motion.div>
      )}

      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.01 }}
              className={`rounded-lg p-4 shadow-sm ${styles.card} border`}
            >
              <div className="flex flex-col space-y-4">
                {/* Rider Info */}
                <div className="flex items-center justify-between">
                  <Link
                    to={`/user/${post.poster.id}`}
                    className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                  >
                    <div className="relative">
                      <img
                        src={post.poster.profilePic || "/default-avatar.png"}
                        alt={post.poster.username}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/default-avatar.png";
                        }}
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${styles.statusIndicator(post.isAccepted)}`}
                      ></span>
                    </div>
                    <div>
                      <span className={`font-medium ${styles.text}`}>
                        {post.poster.username}
                      </span>
                      <small
                        className={`block text-xs ${styles.secondaryText}`}
                      >
                        {new Date(post.time).toLocaleString()}
                      </small>
                    </div>
                  </Link>

                  <div
                    className={`text-sm px-3 py-1 rounded-full ${post.isAccepted ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                  >
                    {post.isAccepted ? "Accepted" : "Available"}
                  </div>
                </div>

                {/* Route Info */}
                <div className="relative pl-4">
                  <div className="absolute left-4 top-0 h-full w-0.5 bg-blue-200"></div>

                  <div className="flex items-start mb-4">
                    <div
                      className={`w-3 h-3 rounded-full bg-blue-500 mt-1 -ml-1.5 absolute`}
                    ></div>
                    <div className="ml-4">
                      <p
                        className={`text-xs font-medium ${styles.secondaryText}`}
                      >
                        PICKUP
                      </p>
                      <p className={`text-sm ${styles.text}`}>
                        {post.pickLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div
                      className={`w-3 h-3 rounded-full bg-black mt-1 -ml-1.5 absolute`}
                    ></div>
                    <div className="ml-4">
                      <p
                        className={`text-xs font-medium ${styles.secondaryText}`}
                      >
                        DROPOFF
                      </p>
                      <p className={`text-sm ${styles.text}`}>
                        {post.dropLocation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ride Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                    >
                      <FaClock
                        className={darkMode ? "text-blue-300" : "text-blue-500"}
                      />
                    </div>
                    <div>
                      <p className={`text-xs ${styles.secondaryText}`}>
                        Departure
                      </p>
                      <p className={`text-sm font-medium ${styles.text}`}>
                        {new Date(post.departureTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                    >
                      <FaMoneyBillWave
                        className={
                          darkMode ? "text-green-300" : "text-green-500"
                        }
                      />
                    </div>
                    <div>
                      <p className={`text-xs ${styles.secondaryText}`}>Fare</p>
                      <p className={`text-sm font-medium ${styles.text}`}>
                        Rs. {post.cost.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                    >
                      <FaUsers
                        className={
                          darkMode ? "text-purple-300" : "text-purple-500"
                        }
                      />
                    </div>
                    <div>
                      <p className={`text-xs ${styles.secondaryText}`}>Seats</p>
                      <p className={`text-sm font-medium ${styles.text}`}>
                        {post.seets || 1}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
                    >
                      <FaCar
                        className={
                          darkMode ? "text-purple-300" : "text-purple-500"
                        }
                      />
                    </div>
                    <div>
                      <p className={`text-xs ${styles.secondaryText}`}>
                        Vehicle
                      </p>
                      <p className={`text-sm font-medium ${styles.text}`}>
                        {post.vehicleType || "Any"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accept Button */}
                <div className="flex justify-center px-4">
                  {!auth.user?.isSuspended && (
                    <button
                      onClick={() => handleAccept(post.id, post.poster.id)}
                      className={`w-full sm:w-2/3 md:w-1/2 lg:w-1/3 py-2.5 mt-2 rounded-3xl font-medium transition-all ${
                        post.isAccepted
                          ? "bg-gray-500 text-white cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      } flex items-center justify-center gap-2 text-sm sm:text-base`}
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
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-center py-12 rounded-xl ${darkMode ? "bg-gray-800" : "bg-white"} ${styles.secondaryText}`}
        >
          <FaCar className="mx-auto text-4xl mb-3 opacity-50" />
          <p className="text-lg font-medium">
            {searchQuery.trim()
              ? "No rides match your search"
              : "No ride requests available"}
          </p>
          <p className="mt-1 text-sm">
            {searchQuery.trim()
              ? "Try a different search term"
              : "Check back later or create your own ride post!"}
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default RidePosts;