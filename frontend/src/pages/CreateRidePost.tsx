import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { postRequest } from "../services/apiRequests";
import { useTheme } from "../context/themeContext";
import Map from "../components/sub/Map";
import { useNavigate } from "react-router-dom";

interface Location {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    suburb?: string;
    city?: string;
    town?: string;
    city_district?: string;
    county?: string;
    village?: string;
    landmark?: string;
    road?: string;
    neighbourhood?: string;
  };
}

const CreateRidePost = () => {
  const { darkMode } = useTheme();
  const [toQuery, setToQuery] = useState("");
  const [fromQuery, setFromQuery] = useState("");
  const [fare, setFare] = useState("");
  const [note, setNote] = useState("");
  const [toSuggestions, setToSuggestions] = useState<Location[]>([]);
  const [fromSuggestions, setFromSuggestions] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>(
    []
  );

  console.log(error);

  
  const [selectedFromLocation, setSelectedFromLocation] = useState<
    [number, number] | null
  >(null);
  const [selectedToLocation, setSelectedToLocation] = useState<
    [number, number] | null
  >(null);
  const [passengers, setPassengers] = useState(1);
  const [time, setTime] = useState("");
  const [timeType, setTimeType] = useState<"AM" | "PM">("AM");

  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  if (!auth) {
    return null;
  }

  console.log("Thisdasda: ", auth.user);

  if (auth.user?.isSuspended) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen px-4 ${
          darkMode ? "bg-[bg-gray-900]" : "bg-white"
        }`}
      >
        <div
          className={`border rounded-2xl shadow-xl p-8 max-w-md text-center ${
            darkMode
              ? "bg-[bg-gray-500] border-gray-700 text-gray-100"
              : "bg-[bg-gray-500] border-gray-200 text-gray-800"
          }`}
        >
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            Your account has been suspended
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please contact the admin for more information or assistance.
          </p>
        </div>
      </div>
    );
  }

  const formatLocationName = (location: Location) => {
    const { address } = location;
    const parts = [];

    const notablePlaces = [
      "LUMS",
      "Hafeez Center",
      "DHA",
      "Model Town",
      "Gulberg",
    ];
    const displayNameParts = location.display_name.split(", ");

    const notablePart = displayNameParts.find((part) =>
      notablePlaces.some((place) => part.includes(place))
    );

    if (notablePart) parts.push(notablePart);
    if (address.road) parts.push(address.road);
    if (address.suburb) parts.push(address.suburb);
    if (address.neighbourhood) parts.push(address.neighbourhood);

    if (address.city_district && !parts.includes(address.city_district)) {
      parts.push(address.city_district);
    } else if (address.city && !parts.includes(address.city)) {
      parts.push(address.city);
    } else if (address.town && !parts.includes(address.town)) {
      parts.push(address.town);
    }

    return parts.slice(0, 3).join(", ");
  };

  const handleLocationSelect = (location: Location, isFrom: boolean) => {
    const coords: [number, number] = [
      parseFloat(location.lat),
      parseFloat(location.lon),
    ];
    const shortName = formatLocationName(location);

    if (isFrom) {
      setFromQuery(shortName);
      setSelectedFromLocation(coords);
      setFromSuggestions([]);
    } else {
      setToQuery(shortName);
      setSelectedToLocation(coords);
      setToSuggestions([]);
    }
  };

  const fetchLocations = async (query: string, setSuggestions: any) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const coordinates = data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
        );
        setRouteCoordinates(coordinates);
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      setRouteCoordinates([start, end]);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(
      () => fetchLocations(toQuery, setToSuggestions),
      300
    );
    return () => clearTimeout(debounce);
  }, [toQuery]);

  useEffect(() => {
    const debounce = setTimeout(
      () => fetchLocations(fromQuery, setFromSuggestions),
      300
    );
    return () => clearTimeout(debounce);
  }, [fromQuery]);

  useEffect(() => {
    if (selectedFromLocation && selectedToLocation) {
      fetchRoute(selectedFromLocation, selectedToLocation);
    }
  }, [selectedFromLocation, selectedToLocation]);

  const handlePostClick = async (e: any) => {
    e.preventDefault();
    const pickLocation = fromSuggestions.find(
      (loc) => loc.display_name === fromQuery
    )
      ? formatLocationName(
          fromSuggestions.find((loc) => loc.display_name === fromQuery)!
        )
      : fromQuery;

    const dropLocation = toSuggestions.find(
      (loc) => loc.display_name === toQuery
    )
      ? formatLocationName(
          toSuggestions.find((loc) => loc.display_name === toQuery)!
        )
      : toQuery;

    const postData = {
      pickLocation,
      dropLocation,
      pickCordinate: selectedFromLocation,
      dropCordinate: selectedToLocation,
      cost: fare,
      caption: note,
      passengers,
      time: `${time} ${timeType}`,
      poster: auth.user?.id,
    };

    const res = await postRequest(
      postData,
      "/rides/send-request",
      auth.accessToken,
      setLoading,
      setError
    );

    if (res) {
      navigate("/");
    } else {
      navigate("/");
    }
  };

  const getMapCenter = () => {
    if (selectedFromLocation && selectedToLocation) {
      return [
        (selectedFromLocation[0] + selectedToLocation[0]) / 2,
        (selectedFromLocation[1] + selectedToLocation[1]) / 2,
      ] as [number, number];
    }
    return selectedFromLocation || selectedToLocation || [0, 0];
  };

  return (
    <div
      className={`flex flex-col lg:flex-row min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Form Container */}
      <div className="lg:w-1/3 p-4 lg:p-6">
        <div
          className={`p-6 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-800"}`}
          >
            Where are you going?
          </h2>

          <form className="space-y-6" onSubmit={handlePostClick}>
            {/* Location Inputs */}
            <div className="space-y-4">
              <div className="relative">
                <label
                  className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  From
                </label>
                <div
                  className={`flex items-center px-4 py-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${darkMode ? "bg-green-400" : "bg-green-500"}`}
                  ></div>
                  <input
                    type="text"
                    placeholder="Enter pickup location"
                    value={fromQuery}
                    onChange={(e) => setFromQuery(e.target.value)}
                    className={`w-full bg-transparent focus:outline-none ${darkMode ? "text-white placeholder-gray-400" : "text-gray-800 placeholder-gray-500"}`}
                  />
                </div>
                {fromSuggestions.length > 0 && (
                  <ul
                    className={`absolute w-full mt-1 rounded-lg shadow-lg z-20 overflow-hidden ${darkMode ? "bg-gray-700" : "bg-white"}`}
                  >
                    {fromSuggestions.map((place: Location) => (
                      <li
                        key={place.place_id}
                        className={`px-4 py-3 cursor-pointer border-t ${darkMode ? "border-gray-600 hover:bg-gray-600" : "border-gray-100 hover:bg-gray-50"}`}
                        onClick={() => handleLocationSelect(place, true)}
                      >
                        <p
                          className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}
                        >
                          {formatLocationName(place)}
                        </p>
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {place.display_name.split(",").slice(0, 3).join(",")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="relative">
                <label
                  className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                >
                  To
                </label>
                <div
                  className={`flex items-center px-4 py-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <div
                    className={`w-3 h-3 rounded-full mr-3 ${darkMode ? "bg-red-400" : "bg-red-500"}`}
                  ></div>
                  <input
                    type="text"
                    placeholder="Enter destination"
                    value={toQuery}
                    onChange={(e) => setToQuery(e.target.value)}
                    className={`w-full bg-transparent focus:outline-none ${darkMode ? "text-white placeholder-gray-400" : "text-gray-800 placeholder-gray-500"}`}
                  />
                </div>
                {toSuggestions.length > 0 && (
                  <ul
                    className={`absolute w-full mt-1 rounded-lg shadow-lg z-20 overflow-hidden ${darkMode ? "bg-gray-700" : "bg-white"}`}
                  >
                    {toSuggestions.map((place: Location) => (
                      <li
                        key={place.place_id}
                        className={`px-4 py-3 cursor-pointer border-t ${darkMode ? "border-gray-600 hover:bg-gray-600" : "border-gray-100 hover:bg-gray-50"}`}
                        onClick={() => handleLocationSelect(place, false)}
                      >
                        <p
                          className={`font-medium ${darkMode ? "text-white" : "text-gray-800"}`}
                        >
                          {formatLocationName(place)}
                        </p>
                        <p
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {place.display_name.split(",").slice(0, 3).join(",")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                Time
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="e.g. 3:00"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`flex-1 p-3 rounded-lg ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800"}`}
                />
                <div className="flex w-full max-w-xs mx-auto">
                  <button
                    type="button"
                    onClick={() => setTimeType("AM")}
                    className={`w-1/2 text-sm sm:text-base md:text-lg px-2 sm:px-4 py-2 sm:py-3 rounded-l-lg transition-all duration-150 ${
                      timeType === "AM"
                        ? darkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeType("PM")}
                    className={`w-1/2 text-sm sm:text-base md:text-lg px-2 sm:px-4 py-2 sm:py-3 rounded-r-lg transition-all duration-150 ${
                      timeType === "PM"
                        ? darkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Passengers */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                Passengers
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPassengers(num)}
                    className={`flex-1 py-2 rounded-lg ${
                      passengers === num
                        ? darkMode
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : darkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Fare Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                Fare (Rs)
              </label>
              <input
                type="number"
                placeholder="Enter fare amount"
                min={0}
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                className={`w-full p-3 rounded-lg ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800"}`}
              />
            </div>

            {/* Note Input */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                Note (Optional)
              </label>
              <textarea
                placeholder="Any special instructions?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`w-full p-3 rounded-lg ${darkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800"}`}
                rows={2}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading ||
                !selectedFromLocation ||
                !selectedToLocation ||
                !fare ||
                !time
              }
              className={`w-full py-3 rounded-lg font-bold transition-all duration-200 ${
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white shadow-md hover:shadow-lg transform hover:scale-[1.01] flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Ride...
                </>
              ) : (
                "Create Ride"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Map Container */}
      <div className="lg:w-2/3 h-[500px] lg:h-auto sticky overflow-hidden rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-gray-800">
        {selectedFromLocation || selectedToLocation ? (
          <Map
            center={getMapCenter()}
            zoom={13}
            darkMode={darkMode}
            className="absolute inset-0 rounded-[14px]"
            markers={[
              ...(selectedFromLocation
                ? [
                    {
                      position: selectedFromLocation,
                      popup: "Pickup Location",
                    },
                  ]
                : []),
              ...(selectedToLocation
                ? [
                    {
                      position: selectedToLocation,
                      popup: "Destination",
                    },
                  ]
                : []),
            ]}
            route={routeCoordinates}
          />
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}
          >
            <p
              className={`text-center px-4 ${darkMode ? "text-gray-300" : "text-gray-500"}`}
            >
              Select locations to view the map and route
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRidePost;
