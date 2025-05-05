import React, { useState } from "react";
import { FiStar, FiAlertCircle } from "react-icons/fi";
import { postRequest } from "../../services/apiRequests";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";
import { useTheme } from "../../context/themeContext";
import { motion, AnimatePresence } from "framer-motion";

interface RatingPopupProps {
  userId: string | undefined;
  onClose: () => void;
}

const RatingPopup: React.FC<RatingPopupProps> = ({ userId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useContext(AuthContext);
  const { darkMode } = useTheme();

  if (!auth) {
    return null;
  }

  const url = "/general/rate-user";

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await postRequest(
        { rating, userId }, 
        url, 
        auth.accessToken, 
        setIsSubmitting, 
        setError
      );

      if (response) {
        onClose();
      } else {
        setError("You can only rate a user once!");
      }
    } catch (err) {
      setError("Failed to submit rating. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Theme variables
  const popupBg = darkMode ? "bg-gray-800" : "bg-white";
  const textColor = darkMode ? "text-gray-100" : "text-gray-800";
  const secondaryText = darkMode ? "text-gray-400" : "text-gray-600";
  const buttonBg = darkMode 
    ? "bg-blue-600 hover:bg-blue-700" 
    : "bg-blue-500 hover:bg-blue-600";
  const cancelButtonBg = darkMode 
    ? "bg-gray-700 hover:bg-gray-600" 
    : "bg-gray-100 hover:bg-gray-200";
  const cancelButtonText = darkMode 
    ? "text-gray-200" 
    : "text-gray-700";
  const starColor = (star: number) => 
    (hover || rating) >= star ? "text-yellow-400" : 
    darkMode ? "text-gray-500" : "text-gray-300";
  const errorBg = darkMode 
    ? "bg-red-900/30 border-red-700" 
    : "bg-red-100 border-red-300";
  const errorText = darkMode ? "text-red-300" : "text-red-700";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`${popupBg} p-6 rounded-xl shadow-xl max-w-sm w-full mx-4`}
      >
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-3 ${textColor}`}>
            Rate This User
          </h2>
          <p className={`text-sm mb-6 ${secondaryText}`}>
            How would you rate your experience with this user?
          </p>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-4 p-3 rounded-lg border ${errorBg} ${errorText} flex items-center gap-2`}
              >
                <FiAlertCircle className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center space-x-3 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setRating(star);
                  setError(null); // Clear error when user changes rating
                }}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className={`text-3xl transition-all ${starColor(star)}`}
              >
                <FiStar />
              </motion.button>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className={`px-6 py-2 rounded-lg ${buttonBg} text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Rating"
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClose}
              className={`px-6 py-2 rounded-lg ${cancelButtonBg} ${cancelButtonText} font-medium text-sm`}
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RatingPopup;