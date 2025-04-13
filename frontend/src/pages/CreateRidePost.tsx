import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/authContext";
import { postRequest } from "../services/apiRequests";
import { useTheme } from "../context/themeContext";
import Map from "../components/sub/Map";

interface Location {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
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
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);

  console.log(error);

  const [selectedFromLocation, setSelectedFromLocation] = useState<
    [number, number] | null
  >(null);
  const [selectedToLocation, setSelectedToLocation] = useState<
    [number, number] | null
  >(null);

  const auth = useContext(AuthContext);

  if (!auth) {
    return null;
  }

  const fetchLocations = async (query: string, setSuggestions: any) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  // Fetch route from OSRM
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
      console.error('Error fetching route:', error);
      // Fallback to straight line if routing fails
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

  const handleLocationSelect = (location: Location, isFrom: boolean) => {
    const coords: [number, number] = [
      parseFloat(location.lat),
      parseFloat(location.lon),
    ];
    if (isFrom) {
      setFromQuery(location.display_name);
      setSelectedFromLocation(coords);
      setFromSuggestions([]);
    } else {
      setToQuery(location.display_name);
      setSelectedToLocation(coords);
      setToSuggestions([]);
    }
  };

  const handlePostClick = async (e: any) => {
    e.preventDefault();
    const postData = {
      pickLocation: fromQuery,
      dropLocation: toQuery,
      pickCoords: selectedFromLocation,
      dropCoords: selectedToLocation,
      cost: fare,
      caption: note,
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
      window.location.assign("/");
    }
  };

  // Calculate center point between two locations for map view
  const getMapCenter = () => {
    if (selectedFromLocation && selectedToLocation) {
      return [
        (selectedFromLocation[0] + selectedToLocation[0]) / 2,
        (selectedFromLocation[1] + selectedToLocation[1]) / 2
      ] as [number, number];
    }
    return selectedFromLocation || selectedToLocation || [0, 0];
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-800 dark:bg-gray-800 rounded-3xl">
      {/* Form Container */}
      <div className={`lg:w-1/3 p-4 lg:p-6 transition-colors duration-300 ${
        darkMode
          ? "bg-gray-900 border-gray-700 text-gray-100"
          : "bg-white border-gray-200 text-gray-800"
      }`}>
        <div className={`p-6 shadow-xl rounded-2xl border ${
          darkMode
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-200 text-gray-800"
        }`}>
          <h3 className={`text-2xl font-bold text-center ${
            darkMode ? "text-white" : "text-gray-800"
          }`}>
            Create Ride Post
          </h3>

          <form className="space-y-5 mt-6" onSubmit={handlePostClick}>
            {/* Pickup Location */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter pickup location..."
                value={fromQuery}
                onChange={(e) => setFromQuery(e.target.value)}
                className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-500 placeholder-gray-400 text-white"
                    : "bg-gray-50 border-gray-300 focus:ring-blue-400 text-gray-800"
                }`}
              />
              {fromSuggestions.length > 0 && (
                <ul className={`absolute w-full border shadow-md mt-1 rounded-md z-20 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                }`}>
                  {fromSuggestions.map((place: Location) => (
                    <li
                      key={place.place_id}
                      className={`p-3 cursor-pointer ${
                        darkMode
                          ? "text-white hover:bg-gray-600"
                          : "text-gray-800 hover:bg-gray-100"
                      }`}
                      onClick={() => handleLocationSelect(place, true)}
                    >
                      {place.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Destination */}
            <div className="relative">
              <input
                type="text"
                placeholder="Enter destination..."
                value={toQuery}
                onChange={(e) => setToQuery(e.target.value)}
                className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 focus:ring-blue-500 placeholder-gray-400 text-white"
                    : "bg-gray-50 border-gray-300 focus:ring-blue-400 text-gray-800"
                }`}
              />
              {toSuggestions.length > 0 && (
                <ul className={`absolute w-full border shadow-md mt-1 rounded-md z-20 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600"
                    : "bg-white border-gray-200"
                }`}>
                  {toSuggestions.map((place: Location) => (
                    <li
                      key={place.place_id}
                      className={`p-3 cursor-pointer ${
                        darkMode
                          ? "text-white hover:bg-gray-600"
                          : "text-gray-800 hover:bg-gray-100"
                      }`}
                      onClick={() => handleLocationSelect(place, false)}
                    >
                      {place.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Fare */}
            <input
              type="number"
              placeholder="Fare in Rs..."
              min={0}
              value={fare}
              onChange={(e) => setFare(e.target.value)}
              className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 focus:ring-blue-500 placeholder-gray-400 text-white"
                  : "bg-gray-50 border-gray-300 focus:ring-blue-400 text-gray-800"
              }`}
            />

            {/* Note */}
            <textarea
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 focus:ring-blue-500 placeholder-gray-400 text-white"
                  : "bg-gray-50 border-gray-300 focus:ring-blue-400 text-gray-800"
              }`}
              rows={3}
            />

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${
                darkMode
                  ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900"
                  : "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800"
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
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
                  Posting...
                </span>
              ) : (
                "Post Ride"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Single Map Container */}
      <div className="lg:w-2/3 h-[500px] lg:h-auto sticky overflow-hidden rounded-2xl border-2 transition-all duration-300 bg-white dark:bg-gray-800">
        {selectedFromLocation || selectedToLocation ? (
          <Map
            center={getMapCenter()}
            zoom={13}
            darkMode={darkMode}
            className="absolute inset-0 rounded-[14px]"
            markers={[
              ...(selectedFromLocation ? [{
                position: selectedFromLocation,
                popup: "Pickup Location"
              }] : []),
              ...(selectedToLocation ? [{
                position: selectedToLocation,
                popup: "Destination"
              }] : [])
            ]}
            route={routeCoordinates}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-[14px] transition-colors duration-300">
            <p className="text-gray-500 dark:text-gray-300 text-center px-4">
              Select locations to view the map and route
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRidePost;