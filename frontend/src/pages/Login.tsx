import { useState, FormEvent } from "react";
import { loginUser } from "../services/authServices";
import { Link } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa";
import "../../public/logo.jpg";
import "../../public/new.gif";

const LoginForm = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormFocused, setIsFormFocused] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    const accessToken = await loginUser(
      username,
      password,
      setLoading,
      setError
    );

    if (accessToken) {
      window.location.assign("/");
    }
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center p-4 bg-cover bg-center transition-all duration-300 ${
        isFormFocused ? "backdrop-blur-sm" : ""
      }`}
      style={{ backgroundImage: "url('new.gif')" }}
    >
      <div
        className={`w-full max-w-md bg-white rounded-2xl shadow-xl transition-all duration-300 ${
          isFormFocused ? "ring-2 ring-blue-400 ring-opacity-70" : ""
        }`}
        onFocus={() => setIsFormFocused(true)}
        onBlur={() => setIsFormFocused(false)}
        tabIndex={0}
      >
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <img
              src="logo.jpg"
              alt="Logo"
              className="w-12 h-12 rounded-lg"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">
            Welcome Back!
          </h2>
          <p className="text-gray-600 text-sm mb-6 text-center">Log in to continue</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <FaUser className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Username or Email"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <FaLock className="text-gray-400 text-sm" />
              </div>
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 text-sm rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all ${
                loading ? 'opacity-80 cursor-not-allowed' : 'shadow-md hover:shadow-lg'
              }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging In...
                </span>
              ) : "Log In"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-500 font-medium hover:text-blue-600 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;