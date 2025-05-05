import { useEffect, useState } from "react";
import { useTheme } from "../context/themeContext";
import { AuthContext } from "../context/authContext";
import { useContext } from "react";
import { getRequest } from "../services/apiRequests";


interface TrendingUser {
  id: string;
  fullname: string;
  username: string;
  profilePic: string | null;
  rating: number;
}

const Trending = () => {

  const auth = useContext(AuthContext);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  console.log(loading, error);

  if (!auth) {
    return;
  }
  const user = auth.user;
  const { darkMode } = useTheme();
  const [trendingUsers, setTrendingUsers] = useState<TrendingUser[]>([]);

  console.log("Trending page mounted", user);

  useEffect(() => {
    const url = "/general/trending-users";
    const fetchTrendingUsers = async () => {
      const res = await getRequest(url, auth.accessToken, setLoading, setError);
      if (res) {
        setTrendingUsers(res);
      }

      console.log("Response from them: ", res);
    }
    fetchTrendingUsers();

   
  }, [user]);

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Trending {user.driver ? "Passengers" : "Drivers"}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingUsers.map((u) => (
            <div
              key={u.id}
              className={`p-4 rounded-xl shadow-md ${
                darkMode ? "bg-gray-800" : "bg-gray-100"
              } transition hover:scale-[1.02]`}
            >
              <div className="flex items-center gap-4">
                <img
                  src={u.profilePic || "/default-avatar.png"}
                  alt={u.fullname}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold">{u.fullname}</h2>
                  <p className="text-sm text-gray-500">@{u.username}</p>
                  <p className="mt-1 font-medium text-blue-500">⭐ {u.rating.toFixed(1)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trending;
