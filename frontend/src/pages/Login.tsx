import { useState, FormEvent } from "react";
import { loginUser } from "../services/authServices";
import { Link } from "react-router-dom";
import "../../public/logo.jpg";
import "../../public/new.gif";

const LoginForm = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-cover bg-center" 
         style={{ backgroundImage: "url('new.gif')" }}>
      <div className="w-full max-w-xs bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <img
              src="logo.jpg"
              alt="Logo"
              className="w-12 h-12 object-contain rounded"
            />
          </div>
          <h2 className="text-blue-800 font-semibold text-lg mb-1 text-center">
            Welcome Back!
          </h2>
          <p className="text-gray-600 text-sm mb-4 text-center">Log in to continue</p>
          
          {error && (
            <div className="mb-3 text-red-500 text-xs text-center">
              {error}
            </div>
          )}

          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username or Email"
              required
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              required
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 text-sm rounded-3xl font-medium"
              disabled={loading}
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>
        </div>

        <div className="px-6 pb-4">
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-600 text-center">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 font-medium hover:text-blue-800"
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