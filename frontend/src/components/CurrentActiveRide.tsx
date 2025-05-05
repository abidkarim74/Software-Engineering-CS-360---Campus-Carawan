import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import { getRequest, postRequest, putRequest } from "../services/apiRequests";
import {
  FiClock,
  FiUser,
  FiDollarSign,
  FiCalendar,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { FaCarSide, FaUserAlt, FaStar } from "react-icons/fa";
import { useTheme } from "../context/themeContext";

const CurrentActiveRide = () => {
  const auth = useContext(AuthContext);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [ride, setRide] = useState<any>(null);
  const { darkMode } = useTheme();

  console.log(message);

  if (!auth) {
    return null;
  }

  const handleCancelRide = async (rideId: string) => {
    const url = "/rides/cancel-ride";
    const res = await postRequest(
      { id: rideId },
      url,
      auth.accessToken,
      setLoading,
      setError
    );

    if (res) {
      setRide(null);
      setMessage(res.message);
    }
  };

  useEffect(() => {
    const fetchRide = async () => {
      const url = "/rides/active-ride";
      const response = await getRequest(
        url,
        auth.accessToken,
        setLoading,
        setError
      );
      if (response) {
        setRide(response);
      }
    };
    fetchRide();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? "border-blue-400" : "border-blue-500"}`}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-4 rounded-lg mb-4 ${darkMode ? "bg-red-900/30 text-red-300 border border-red-700" : "bg-red-100 text-red-800 border border-red-300"} flex items-center gap-2`}
      >
        <FiAlertCircle className="flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!ride) {
    return (
      <div
        className={`p-6 rounded-xl ${darkMode ? "bg-gray-800" : "bg-gray-50"} border ${darkMode ? "border-gray-700" : "border-gray-200"} shadow-sm sticky top-4`}
      >
        <div
          className={`text-center ${darkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          <FaCarSide
            className={`mx-auto text-3xl mb-3 ${darkMode ? "text-blue-400" : "text-blue-500"}`}
          />
          <h3 className="text-xl font-semibold mb-1">No active rides</h3>
          <p
            className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            You don't have any active ride requests at the moment.
          </p>
        </div>
      </div>
    );
  }

  
  
  const otherUser =
    ride.poster.id === auth.user?.id ? ride.otherUser : ride.poster;
  const isDriver = auth.user?.driver;
  const rideStatus = ride.isAccepted ? "accepted" : "pending";

  const handleFareIncrease = async () => {
    if (!ride) return;

    let updatedFare = ride.cost + 5;

    const updatedRide = { ...ride, cost: updatedFare };
    setRide(updatedRide);

    const url = `/update/${ride.id}/update-fare`;
    const res = await putRequest({ fare: updatedFare }, url);
    console.log("Fare updated: ", res);
  };

  const handleFareDecrease = async () => {
    if (!ride) return;

    let updatedFare = ride.cost - 5;

    if (updatedFare >= 50) {
      const updatedRide = { ...ride, cost: updatedFare };
      setRide(updatedRide);

      const url = `/update/${ride.id}/update-fare`;
      const res = await putRequest({ fare: updatedFare }, url);
      console.log("Fare updated: ", res);
    }
  };

  const bgColor = darkMode ? "bg-gray-900" : "bg-gray-50";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";
  const secondaryText = darkMode ? "text-gray-400" : "text-gray-600";
  const accentColor = darkMode ? "text-blue-400" : "text-blue-500";
 

  return (
    <div
      className={`flex flex-col h-full ${bgColor} rounded-xl overflow-hidden shadow-lg sticky top-4`}
    >
      {/* Custom scrollbar styling */}
      <style>{`
        .scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        .scroll-container::-webkit-scrollbar-track {
          background: ${darkMode ? "#374151" : "#e5e7eb"};
          border-radius: 10px;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          background: ${darkMode ? "#4b5563" : "#9ca3af"};
          border-radius: 10px;
        }
        .scroll-container::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? "#6b7280" : "#6b7280"};
        }
      `}</style>

      {/* Status Header */}

      <div
        className={`p-4 ${darkMode ? "bg-gray-800" : "bg-green-50"} border-b ${darkMode ? "border-gray-700" : "border-green-200"} flex items-center justify-between rounded-lg ${darkMode ? "" : "shadow-sm shadow-green-200/50"}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-full ${
              rideStatus === "accepted"
                ? darkMode
                  ? "bg-emerald-900/30 text-emerald-400"
                  : "bg-green-200 text-green-800"
                : darkMode
                  ? "bg-amber-900/30 text-amber-400"
                  : "bg-green-200 text-green-800"
            }`}
          >
            {rideStatus === "accepted" ? (
              <FiCheckCircle size={20} />
            ) : (
              <FiAlertCircle size={20} />
            )}
          </div>
          <div>
            <h3
              className={`font-semibold text-lg ${darkMode ? "text-gray-100" : "text-green-900"}`}
            >
              {rideStatus === "accepted"
                ? isDriver
                  ? "Passenger found"
                  : "Driver found"
                : isDriver
                  ? "Looking for passengers"
                  : "Looking for drivers"}
            </h3>
            <p
              className={`text-sm ${darkMode ? "text-gray-400" : "text-green-800"}`}
            >
              {rideStatus === "accepted"
                ? `Your ride is confirmed with ${otherUser?.fullname || "user"}`
                : "Waiting for a match..."}
            </p>
          </div>
        </div>
      </div>
      {/* Ride Content with custom scroll */}
      <div className="flex-1 overflow-y-auto p-4 scroll-container">
        {/* Departure Time Card */}
        <div
          className={`mb-4 p-4 rounded-xl ${cardBg} border ${borderColor} shadow-sm flex items-center justify-between`}
        >
          <div>
            <p className={`text-sm ${secondaryText}`}>Departing at</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{ride.departureTime}</p>
          </div>
        </div>

        {/* Route Card */}
        <div
          className={`mb-4 p-4 rounded-xl ${cardBg} border ${borderColor} shadow-sm`}
        >
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div
                className={`w-0.5 h-8 ${darkMode ? "bg-gray-600" : "bg-gray-300"}`}
              ></div>
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
            </div>
            <div className="flex-1">
              <div className="mb-4">
                <div className={`font-medium ${textColor}`}>
                  {ride.pickLocation}
                </div>
                <div className={`text-xs ${secondaryText}`}>
                  Pickup location
                </div>
              </div>
              <div>
                <div className={`font-medium ${textColor}`}>
                  {ride.dropLocation}
                </div>
                <div className={`text-xs ${secondaryText}`}>
                  Dropoff location
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ride Details Card */}
        <div
          className={`mb-4 p-4 rounded-xl ${cardBg} border ${borderColor} shadow-sm`}
        >
          <h4 className={`font-semibold text-base mb-4 ${textColor}`}>
            Ride Details
          </h4>

          {!ride.isAccepted && (
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={handleFareIncrease}
                title="Increase Fare"
                className={`
             px-2.5 py-1 text-xs font-medium rounded-md 
             transition-all duration-200 flex items-center
             ${
               darkMode
                 ? "bg-green-700 hover:bg-green-600 text-white"
                 : "bg-green-100 hover:bg-green-200 text-green-800"
             }
             shadow-sm hover:shadow-md
             border ${darkMode ? "border-green-600" : "border-green-200"}
             hover:transform hover:scale-105
           `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Increase
              </button>
              <button
                onClick={handleFareDecrease}
                title="Decrease Fare"
                className={`
             px-2.5 py-1 text-xs font-medium rounded-md 
             transition-all duration-200 flex items-center
             ${
               darkMode
                 ? "bg-red-700 hover:bg-red-600 text-white"
                 : "bg-red-100 hover:bg-red-200 text-red-800"
             }
             shadow-sm hover:shadow-md
             border ${darkMode ? "border-red-600" : "border-red-200"}
             hover:transform hover:scale-105
           `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
                Decrease
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <FiUser className={accentColor} />
              </div>
              <div>
                <p className={`text-xs ${secondaryText}`}>Seats</p>
                <p className={`font-medium ${textColor}`}>{ride.seats}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <FiDollarSign className={accentColor} />
              </div>
              <div>
                <p className={`text-xs ${secondaryText}`}>Cost</p>
                <p className={`font-medium ${textColor}`}>Rs. {ride.cost}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <FiCalendar className={accentColor} />
              </div>
              <div>
                <p className={`text-xs ${secondaryText}`}>Date</p>
                <p className={`font-medium ${textColor}`}>Today</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
              >
                <FiClock className={accentColor} />
              </div>
              <div>
                <p className={`text-xs ${secondaryText}`}>Time</p>
                <p className={`font-medium ${textColor}`}>
                  {ride.departureTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        {ride.isAccepted && otherUser && (
          <div
            className={`mb-4 p-4 rounded-xl ${cardBg} border ${borderColor} shadow-sm`}
          >
            <h4 className={`font-semibold mb-3 ${textColor}`}>
              {isDriver ? "Passenger" : "Driver"} Details
            </h4>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Link to={`/profile/${auth.user?.id}`}>
                {otherUser.profilePic ? (
                  <img
                    src={otherUser.profilePic}
                    alt={otherUser.fullname}
                    className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/default-avatar.png";
                    }}
                  />
                ) : (
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-200"}`}
                  >
                    <FaUserAlt className={accentColor} size={18} />
                  </div>
                )}
                  
                
                </Link>
                
                {otherUser.driver && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full">
                    <FaCarSide size={12} />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-medium ${textColor}`}>
                      {otherUser.fullname || "Unknown"}
                    </p>
                    <p className={`text-sm ${secondaryText}`}>
                      @{otherUser.username || "unknown"}
                    </p>
                  </div>
                  {otherUser.rating && (
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span className={`text-sm ${textColor}`}>
                        {otherUser.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {otherUser.driver && (
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-700"}`}
                    >
                      Verified driver
                    </span>
                    {otherUser.vehicle && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"}`}
                      >
                        {otherUser.vehicle.name}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-center">
        <div
          className={`p-4 border-t w-full ${borderColor} ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <button
            onClick={() => handleCancelRide(ride.id)}
            className={`w-full py-3 text-white rounded-lg font-medium flex items-center justify-center gap-2 ${darkMode ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"} transition-colors`}
          >
            <FiX size={18} />
            Cancel Ride
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrentActiveRide;
