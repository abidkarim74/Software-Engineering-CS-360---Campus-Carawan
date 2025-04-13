import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { signupUser } from "../services/authServices";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    const trimmedFullname = fullname.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedFullname || !trimmedEmail) {
      setError("All fields are required!");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long!");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const res = await signupUser(
        { username: trimmedUsername, fullname: trimmedFullname, email: trimmedEmail, gender, password },
        setLoading,
        setError
      );

      if (res) {
        window.location.assign("/");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-cover bg-center" 
         style={{ backgroundImage: "url('new.gif')" }}>
      <div className="w-full max-w-xs bg-white mt-5 rounded-lg shadow-lg" 
           style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <div className="p-4">
          <div className="flex justify-center mb-2">
            <img src="logo.jpg" alt="Logo" className="w-8 h-8 rounded-md" />
          </div>

          <h2 className="text-lg font-semibold mb-1 text-center">Create Account</h2>
          <p className="text-gray-600 text-xs mb-2 text-center">Join our community</p>

          {error && <p className="text-red-500 text-xs text-center mb-1">{error}</p>}

          <form className="space-y-1.5" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2.5 text-xs border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Full Name"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full p-2.5 text-xs border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 text-xs border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 text-xs border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 text-xs border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <div className="pt-1 pb-1">
              <label className="block text-gray-700 text-xs font-medium text-center">Gender</label>
              <div className="flex justify-between gap-4 mt-1 text-xs font-medium text-gray-700">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === "male"}
                    onChange={() => setGender("male")}
                    className="accent-blue-500"
                  />
                  Male
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === "female"}
                    onChange={() => setGender("female")}
                    className="accent-blue-500"
                  />
                  Female
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2.5 text-xs rounded-2xl font-medium mt-1"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="my-2 text-gray-400 text-xs flex items-center">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="mx-2">or</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          <p className="text-xs text-gray-600 text-center">
            Have an account?{" "}
            <Link to="/login" className="text-blue-500 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;