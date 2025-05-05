import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { useContext, useState, useEffect, useRef } from "react";
import { getRequest } from "../services/apiRequests";
import ComplainForm from "../components/sub/ComplainForm";
import ProfilePicUpload from "../components/sub/ProfilePicUpload";
import RatingPopup from "../components/sub/RatingPopup";

import {
  FiEdit,
  FiStar,
  FiPhone,
  FiUser,
  FiShield,
  FiAlertCircle,
  FiMessageSquare,
  FiPlus,
  FiTruck,
  FiCamera,
} from "react-icons/fi";
import { useTheme } from "../context/themeContext";
import { FaCar } from "react-icons/fa";

interface Complaint {
  id: string;
  complain: string;
  createdAt: string;
  targetId: string;
}

interface Vehicle {
  name: string;
  model: string;
  numberPlate: string;
  color: string;
  vehiclePics?: string;
}

interface Profile {
  id: string;
  fullname: string;
  username: string;
  profilePic?: string;
  isAdmin: boolean;
  driver: boolean;
  isSuspended: boolean;
  rating?: number;
  reviews?: any[];
  complains?: Complaint[];
  phone?: string;
  gender?: string;
  vehicles?: Vehicle;
}

const UserProfile = () => {
  const { darkMode } = useTheme();
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComplaints, setShowComplaints] = useState(false);
  const [showComplainForm, setShowComplainForm] = useState(false);
  const [showPicOptions, setShowPicOptions] = useState(false);
  const [showRating, setShowRating] = useState<boolean>(false);

  const picOptionsRef = useRef<HTMLDivElement>(null);

  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext is undefined.");
  const { accessToken, user } = auth;

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRequest(
          `/general/profile/${userId}`,
          accessToken,
          setLoading,
          setError
        );
        setProfile(data);
      } catch {
        setError("Failed to fetch user profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, accessToken]);

  // Close profile pic options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        picOptionsRef.current &&
        !picOptionsRef.current.contains(event.target as Node)
      ) {
        setShowPicOptions(false);
      }
    };

    if (showPicOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicOptions]);

  // Blue color scheme
  const bgColor = darkMode ? "bg-gray-900" : "bg-white";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";
  const secondaryText = darkMode ? "text-gray-400" : "text-gray-600";
  const borderColor = darkMode ? "border-gray-700" : "border-blue-100";
  const coverBg = darkMode ? "bg-blue-900" : "bg-blue-600";
  const buttonBg = darkMode
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-600 hover:bg-blue-700";
  const accentColor = "text-blue-400";
  const highlightColor = darkMode ? "bg-blue-900" : "bg-blue-100";
  const buttonText = "text-white";

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${bgColor}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex justify-center items-center h-screen ${bgColor}`}>
        <div
          className={`${cardBg} border ${borderColor} ${textColor} px-4 py-3 rounded-lg shadow-lg max-w-md`}
        >
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} py-8 px-4 sm:px-6 lg:px-8`}>
      {profile ? (
        <div className="max-w-4xl mx-auto">
          <div
            className={`${cardBg} shadow-lg rounded-lg overflow-hidden border ${borderColor} mb-8 transition-all duration-300 hover:shadow-xl`}
          >
            <div className={`h-48 ${coverBg} relative`}>
              <div
                className="absolute -bottom-16 left-6 cursor-pointer transform hover:scale-105 transition-transform duration-300"
                onClick={() => setShowPicOptions(true)}
              >
                <div className="relative">
                  <div
                    className={`h-32 w-32 rounded-full border-4 ${cardBg} shadow-lg overflow-hidden`}
                  >
                    <img
                      src={profile.profilePic || "/default-profile.png"}
                      alt={`${profile.fullname}'s profile`}
                      className="h-full w-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.src = "/default-profile.png")
                      }
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow">
                    <FiCamera className="text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Profile Picture Options Modal */}
              {showPicOptions && (
                <ProfilePicUpload
                  profile={profile}
                  setShowPicOptions={setShowPicOptions}
                  picOptionsRef={picOptionsRef}
                  cardBg={cardBg}
                  setProfile={setProfile}
                  darkMode={darkMode}
                />
              )}
            </div>

            <div className="px-6 pt-20 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between">
                    <div>
                      <h1 className={`text-3xl font-bold ${textColor}`}>
                        {profile.fullname}
                      </h1>
                      <p className={`${secondaryText} text-sm`}>
                        @{profile.username}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <Link
                        to={`/${userId}/update`}
                        className={`flex items-center px-4 py-2 rounded-lg ${buttonBg} ${buttonText} text-sm font-medium transition-colors duration-300`}
                      >
                        <FiEdit className="mr-2" /> Edit Profile
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.isAdmin && (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          darkMode
                            ? "bg-blue-900 text-blue-200"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <FiShield className="mr-1" /> Admin
                      </span>
                    )}
                    {profile.driver && (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          darkMode
                            ? "bg-blue-900 text-blue-200"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        <FaCar className="mr-1" /> Driver
                      </span>
                    )}
                    {profile.isSuspended && (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          darkMode
                            ? "bg-red-900 text-red-200"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <FiAlertCircle className="mr-1" /> Suspended
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`border-t ${borderColor} ${
                darkMode ? "bg-gray-700" : "bg-blue-50"
              } px-4 py-3`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
                <div
                  className={`flex items-center gap-2 ${secondaryText} text-sm`}
                >
                  <FiStar className={`${accentColor} mr-1`} />
                  <span className="font-medium">{profile.rating ?? "N/A"}</span>
                  <span className="ml-1">({profile.reviews?.length ?? 0})</span>

                  {userId !== auth.user?.id && (
                    <button
                      onClick={() => setShowRating(!showRating)}
                      className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded"
                    >
                      Rate
                    </button>
                  )}
                </div>

                {showRating && (
                  <RatingPopup
                    userId={profile.id}
                    onClose={() => setShowRating(false)}
                  ></RatingPopup>
                )}
                <div className={`flex items-center text-sm flex-wrap`}>
                  <FiMessageSquare className="text-rose-500 mr-1" />
                  <span className="flex items-center gap-1 flex-wrap">
                    <span
                      className={`${darkMode ? "text-rose-300" : "text-rose-700"}`}
                    >
                      {profile.complains?.length ?? 0} complaints
                    </span>
                    <button
                      onClick={() => setShowComplaints(true)}
                      className={`ml-1 px-2 py-1 rounded-md font-medium border ${
                        darkMode
                          ? "border-rose-700 text-rose-300 hover:bg-rose-900/30"
                          : "border-rose-300 text-rose-700 hover:bg-rose-50"
                      } transition-colors duration-300 flex items-center`}
                    >
                      <span>View</span>
                    </button>
                    {user?.id !== userId && (
                      <button
                        onClick={() => setShowComplainForm((v) => !v)}
                        className={`ml-1 px-2 py-1 rounded-md font-medium border ${
                          darkMode
                            ? "border-rose-700 text-rose-300 hover:bg-rose-900/30"
                            : "border-rose-300 text-rose-700 hover:bg-rose-50"
                        } transition-colors duration-300 flex items-center`}
                      >
                        <span>Add</span>
                      </button>
                    )}
                  </span>
                </div>
                <div className={`flex items-center ${secondaryText} text-sm`}>
                  <FiPhone className="text-blue-400 mr-1" />
                  <span>{profile.phone || "No phone"}</span>
                </div>
              </div>
            </div>
          </div>

          {showComplainForm && (
            <ComplainForm
              targetId={profile.id}
              darkMode={darkMode}
              onClose={() => setShowComplainForm(false)}
            />
          )}

          {showComplaints && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
                onClick={() => setShowComplaints(false)}
              ></div>
              <div
                className={`relative z-10 ${cardBg} rounded-xl shadow-xl w-11/12 max-w-md p-6 max-h-[80vh] overflow-y-auto`}
              >
                <h2 className={`text-lg font-bold mb-4 ${textColor}`}>
                  Complaints
                </h2>
                <ul className="space-y-2">
                  {profile.complains && profile.complains.length > 0 ? (
                    profile.complains.map((c, i) => (
                      <li
                        key={i}
                        className={`p-3 rounded-lg ${
                          darkMode
                            ? "bg-gray-700 text-gray-200"
                            : "bg-blue-50 text-gray-800"
                        }`}
                      >
                        <p>{c.complain}</p>
                        <p className={`text-xs mt-1 ${secondaryText}`}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </p>
                      </li>
                    ))
                  ) : (
                    <p className={secondaryText}>No complaints found.</p>
                  )}
                </ul>
                <button
                  onClick={() => setShowComplaints(false)}
                  className={`mt-4 px-4 py-2 ${buttonBg} ${buttonText} rounded-lg transition-colors duration-300`}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className={`${cardBg} shadow-sm rounded-lg p-5 border ${borderColor} transition-all duration-300 hover:shadow-md`}
            >
              <h2
                className={`text-lg font-semibold ${textColor} mb-4 pb-2 border-b ${borderColor}`}
              >
                Personal Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center p-3 rounded-lg hover:bg-blue-50 hover:dark:bg-blue-900/30 transition-colors duration-300">
                  <div
                    className={`w-8 h-8 rounded-full ${highlightColor} flex items-center justify-center mr-3`}
                  >
                    <FiUser className="text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${secondaryText}`}>Username</p>
                    <p className={`${textColor} font-medium`}>
                      @{profile.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg hover:bg-blue-50 hover:dark:bg-blue-900/30 transition-colors duration-300">
                  <div
                    className={`w-8 h-8 rounded-full ${highlightColor} flex items-center justify-center mr-3`}
                  >
                    <FiUser className="text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${secondaryText}`}>Full Name</p>
                    <p className={`${textColor} font-medium`}>
                      {profile.fullname}
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg hover:bg-blue-50 hover:dark:bg-blue-900/30 transition-colors duration-300">
                  <div
                    className={`w-8 h-8 rounded-full ${highlightColor} flex items-center justify-center mr-3`}
                  >
                    <FiUser className="text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${secondaryText}`}>Gender</p>
                    <p className={`${textColor} font-medium capitalize`}>
                      {profile.gender || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center p-3 rounded-lg hover:bg-blue-50 hover:dark:bg-blue-900/30 transition-colors duration-300">
                  <div
                    className={`w-8 h-8 rounded-full ${highlightColor} flex items-center justify-center mr-3`}
                  >
                    <FiPhone className="text-blue-500" />
                  </div>
                  <div>
                    <p className={`text-xs ${secondaryText}`}>Phone</p>
                    <p className={`${textColor} font-medium`}>
                      {profile.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {profile.driver && (
              <div
                className={`${cardBg} shadow-sm rounded-lg p-5 border ${borderColor} transition-all duration-300 hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <h2 className={`text-lg font-semibold ${textColor}`}>
                    Vehicle Information
                  </h2>
                  <Link
                    to="/update-vehicle-info"
                    className={`flex items-center px-3 py-1 rounded-lg ${buttonBg} ${buttonText} text-xs font-medium transition-colors duration-300`}
                  >
                    <FiEdit className="mr-1" /> Edit
                  </Link>
                </div>
                {profile.vehicles ? (
                  <div className="space-y-4">
                    {profile.vehicles.vehiclePics && (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3 border border-blue-200 dark:border-blue-900">
                        <img
                          src={profile.vehicles.vehiclePics}
                          alt={`${profile.vehicles.name} photo`}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.currentTarget.src = "/default-vehicle.png")
                          }
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-2 rounded-lg hover:bg-blue-50 hover:dark:bg-blue-900/30">
                        <p className={`${secondaryText} text-xs`}>Make</p>
                        <p className={textColor}>
                          {profile.vehicles.name || "—"}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg hover:bg-blue-50 hover:dark:bg-blue-900/30">
                        <p className={`${secondaryText} text-xs`}>Model</p>
                        <p className={textColor}>
                          {profile.vehicles.model || "—"}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg hover:bg-blue-50 hover:dark:bg-blue-900/30">
                        <p className={`${secondaryText} text-xs`}>Plate</p>
                        <p className={textColor}>
                          {profile.vehicles.numberPlate || "Not registered"}
                        </p>
                      </div>
                      <div className="p-2 rounded-lg hover:bg-blue-50 hover:dark:bg-blue-900/30">
                        <p className={`${secondaryText} text-xs`}>Color</p>
                        <p className={textColor}>
                          {profile.vehicles.color || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-center py-6 rounded-lg ${highlightColor} border border-blue-200 dark:border-blue-900`}
                  >
                    <FiTruck
                      className={`mx-auto text-2xl mb-2 text-blue-500`}
                    />
                    <p className={`${textColor} mb-1`}>No vehicle registered</p>
                    <Link
                      to="/update-vehicle-info"
                      className={`inline-flex items-center px-3 py-1 rounded-lg ${buttonBg} ${buttonText} text-xs font-medium transition-colors duration-300`}
                    >
                      <FiPlus className="mr-1" /> Add Vehicle
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {profile.driver && (
            <div className="mt-8 text-center">
              <button
                className={`px-8 py-3 rounded-lg ${buttonBg} ${buttonText} font-medium hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl`}
              >
                Go Online
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`flex justify-center items-center h-screen ${bgColor}`}>
          <div
            className={`${cardBg} shadow-lg rounded-lg p-6 max-w-md text-center border ${borderColor}`}
          >
            <h2 className={`text-xl font-semibold ${textColor} mb-3`}>
              User not found
            </h2>
            <p className={secondaryText}>
              The user you're looking for doesn't exist or may have been
              deleted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
