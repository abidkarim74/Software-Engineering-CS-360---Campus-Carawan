import { useState, FormEvent, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { signupUser } from "../services/authServices";
import { FaUser, FaLock, FaEnvelope, FaIdCard, FaVenusMars, FaCheck } from "react-icons/fa";
import axiosJWT from "../services/axiosInstance";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("male");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [showOTPField, setShowOTPField] = useState(false);
  const [otp, setOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email) && email.endsWith("@lums.edu.pk"));
  }, [email]);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handleSendOTP = async () => {
    if (!isEmailValid) {
      setError("Please enter a valid LUMS email address");
      return;
    }

    try {
      setIsSendingOTP(true);
      setError(null);
      
      const response = await axiosJWT.post("/auth/send-otp", { email });
      
      if (response) {
        setOtpSent(true);
        setShowOTPField(true);
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosJWT.post("/auth/verify-otp", { otp, email });
      
      if (response) {
        setOtpVerified(true);
        setIsEmailVerified(true);
        setShowOTPField(false);
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpVerified) {
      setError("Please verify your email first");
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedFullname = fullname.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedUsername || !trimmedFullname || !trimmedEmail || !password || !confirmPassword) {
      setError("All fields are required!");
      return;
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      setError("Username must be 3-20 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError("Username can only contain letters, numbers and underscores");
      return;
    }

    if (!trimmedEmail.endsWith("@lums.edu.pk")) {
      setError("Only LUMS email addresses (@lums.edu.pk) are allowed");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (passwordStrength < 2) {
      setError("Password too weak. Include uppercase, numbers or symbols");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await signupUser(
        {
          username: trimmedUsername,
          fullname: trimmedFullname,
          email: trimmedEmail,
          gender,
          password,
        },
        setLoading,
        setError
      );
      if (res) {
        
      }

      window.location.assign("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
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
        ref={formContainerRef}
        className={`w-full mt-14 max-w-md bg-white rounded-2xl shadow-xl transition-all duration-300 ${
          isFormFocused ? "ring-2 ring-blue-400 ring-opacity-70" : ""
        }`}
        style={{
          maxHeight: "85vh",
          overflowY: "auto",
        }}
        onFocus={() => setIsFormFocused(true)}
        onBlur={() => setIsFormFocused(false)}
        tabIndex={0}
      >
        <style>{`
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 0 8px 8px 0;
          }
          ::-webkit-scrollbar-thumb {
            background-color: #3b82f6;
            border-radius: 0 8px 8px 0;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #2563eb;
          }
        `}</style>

        <div className="p-6">
          <div className="flex justify-center mb-4">
            <img src="logo.jpg" alt="Logo" className="w-12 h-12 rounded-lg" />
          </div>
          
          <h2 className="text-2xl font-bold mb-1 text-center text-gray-800">Create Account</h2>
          <p className="text-gray-600 text-sm mb-6 text-center">Join our community</p>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <FaUser className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <FaIdCard className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                required
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <FaEnvelope className="text-gray-400 text-sm" />
              </div>
              <input
                type="email"
                placeholder="Email (@lums.edu.pk)"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEmailVerified}
                className={`w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
                  isEmailVerified ? 'bg-gray-100' : ''
                }`}
              />
              {isEmailValid && !otpVerified && (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={isSendingOTP || otpSent}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isSendingOTP ? 'Sending...' : otpSent ? 'OTP Sent' : 'Verify Email'}
                </button>
              )}
              {otpVerified && (
                <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 flex items-center text-green-500">
                  <FaCheck className="mr-1" />
                  <span className="text-xs">Verified</span>
                </div>
              )}
            </div>

            {showOTPField && (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-3 pr-20 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Verify
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Check your email for the OTP. Didn't receive it?{' '}
                  <button 
                    type="button" 
                    onClick={handleSendOTP}
                    className="text-blue-500 hover:underline"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <FaLock className="text-gray-400 text-sm" />
              </div>
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  calculatePasswordStrength(e.target.value);
                }}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-1.5 h-2 mb-2">
              <div className={`flex-1 rounded-full ${
                passwordStrength >= 1 ? 
                  (passwordStrength === 1 ? 'bg-red-400' : 
                   passwordStrength === 2 ? 'bg-yellow-400' : 
                   passwordStrength >= 3 ? 'bg-green-400' : 'bg-gray-200') 
                : 'bg-gray-200'
              }`}></div>
              <div className={`flex-1 rounded-full ${
                passwordStrength >= 2 ? 
                  (passwordStrength === 2 ? 'bg-yellow-400' : 
                   passwordStrength >= 3 ? 'bg-green-400' : 'bg-gray-200') 
                : 'bg-gray-200'
              }`}></div>
              <div className={`flex-1 rounded-full ${
                passwordStrength >= 3 ? 
                  (passwordStrength >= 3 ? 'bg-green-400' : 'bg-gray-200') 
                : 'bg-gray-200'
              }`}></div>
              <div className={`flex-1 rounded-full ${
                passwordStrength >= 4 ? 'bg-green-400' : 'bg-gray-200'
              }`}></div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <FaLock className="text-gray-400 text-sm" />
              </div>
              <input
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
            
            <div className="pt-2 pb-2">
              <label className="flex items-center justify-center text-gray-700 text-sm font-medium mb-2">
                <FaVenusMars className="mr-2 text-gray-500" />
                Gender
              </label>
              <div className="flex justify-between gap-4 text-sm font-medium text-gray-700 px-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === "male"}
                    onChange={() => setGender("male")}
                    className="h-4 w-4 accent-blue-500"
                  />
                  Male
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === "female"}
                    onChange={() => setGender("female")}
                    className="h-4 w-4 accent-blue-500"
                  />
                  Female
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading || !otpVerified}
              className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 text-sm rounded-xl font-medium mt-2 hover:from-blue-600 hover:to-blue-700 transition-all ${
                loading ? 'opacity-80 cursor-not-allowed' : 'shadow-md hover:shadow-lg'
              } ${!otpVerified ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : 'Signup'}
            </button>
          </form>
          {error && (
            <div className="mb-4 p-3 mt-2 bg-red-50 rounded-lg">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}
          
          <div className="my-5 text-gray-400 text-sm flex items-center">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="mx-3">or</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            Have an account?{" "}
            <Link to="/login" className="text-blue-500 font-medium hover:underline hover:text-blue-600">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;