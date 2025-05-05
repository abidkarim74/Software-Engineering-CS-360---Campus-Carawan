import { getRequest } from "../../services/apiRequests";
import { useState, useEffect, useContext, useRef } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { AuthContext } from "../../context/authContext";
import { useSocketContext } from "../../context/socketContext";
import { useTheme } from "../../context/themeContext";
import { Link } from "react-router-dom";
import { GeneralContext } from "../../context/generalContext";

interface Notification {
  id: string;
  time: string;
  message: string;
  read: boolean;
  notifier: {
    username: string;
    fullname: string;
    id: string;
    profilePic: string;
  };
  link?: string;
}

const NotificationBar = ({ onClose }: { onClose: () => void }) => {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { socket } = useSocketContext();
  const auth = useContext(AuthContext);
  const generalContext = useContext(GeneralContext);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!auth || !generalContext) {
    return null;
  }

  const { notificationsOn } = generalContext;
  const accessToken = auth.accessToken;
  const url = "/notifications/all";

  // Dynamic styles based on dark mode
  const containerStyles = darkMode
    ? "bg-gray-800 text-white border-gray-700"
    : "bg-white text-gray-900 border-gray-300";

  const notificationItemStyles = darkMode
    ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
    : "bg-white hover:bg-gray-100 border-gray-200";

  const textStyles = darkMode
    ? "text-gray-100"
    : "text-gray-800";

  const secondaryTextStyles = darkMode
    ? "text-gray-300"
    : "text-gray-600";

  const timeTextStyles = darkMode
    ? "text-gray-400"
    : "text-gray-500";

  const viewLinkStyles = darkMode
    ? "text-blue-400 hover:text-blue-300"
    : "text-blue-600 hover:text-blue-500";

  const buttonStyles = darkMode
    ? "bg-blue-600 hover:bg-blue-700 text-white"
    : "bg-blue-500 hover:bg-blue-600 text-white";

  useEffect(() => {
    if (!notificationsOn) return;

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      const response = await getRequest(url, accessToken, setLoading, setError);
      setLoading(false);

      if (response.success) {
        const notificationsWithLinks = response.notifications.map((notif: Notification) => ({
          ...notif,
          link: notif.link || "/"
        }));
        setNotifications(notificationsWithLinks);
      } else {
        setError(response.error || "Failed to fetch notifications.");
      }
    };
    fetchNotifications();
  }, [accessToken, url, notificationsOn]);

  useEffect(() => {
    if (!socket || !notificationsOn) return;

    const handleNewNotification = (newNotification: Notification) => {
      setNotifications((prev: Notification[]) => {
        const exists = prev.some((notif) => notif.id === newNotification.id);
        return exists ? prev : [{
          ...newNotification,
          link: newNotification.link || "/"
        }, ...prev];
      });
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket, notificationsOn]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <div 
      ref={notificationRef}
      className={`
        absolute right-4 top-full mt-2 
        w-[90%] sm:w-[28rem] md:w-[32rem] lg:w-[36rem] 
        max-h-[30rem] overflow-y-auto border rounded-lg shadow-2xl 
        transition-all duration-300 ${containerStyles}
        
        /* Custom scrollbar styles */
        scrollbar-thin
        ${darkMode ? `
          scrollbar-thumb-gray-600
          scrollbar-track-gray-800
          hover:scrollbar-thumb-gray-500
        ` : `
          scrollbar-thumb-gray-300
          scrollbar-track-gray-100
          hover:scrollbar-thumb-gray-400
        `}
      `}
      style={{
        scrollbarWidth: 'thin',
        ...(darkMode ? {
          '--scrollbar-thumb-color': '#4b5563',
          '--scrollbar-track-color': '#1f2937',
          '--scrollbar-thumb-hover': '#6b7280'
        } : {
          '--scrollbar-thumb-color': '#d1d5db',
          '--scrollbar-track-color': '#f3f4f6',
          '--scrollbar-thumb-hover': '#9ca3af'
        })
      }}
    >
      {/* Inline styles for scrollbar that work across browsers */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: var(--scrollbar-track-color);
          border-radius: 100vh;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-color);
          border-radius: 100vh;
          border: 1px solid var(--scrollbar-track-color);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover);
        }
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb-color) var(--scrollbar-track-color);
        }
      `}</style>

      <div className="p-4">
        <h3 className={`text-lg font-semibold ${textStyles}`}>Notifications</h3>
        
        {!notificationsOn ? (
          <div className="py-6 text-center">
            <div className={`mb-4 ${secondaryTextStyles}`}>
              Notifications are currently disabled
            </div>
            <Link
              to="/settings"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttonStyles}`}
              onClick={onClose}
            >
              Go to Settings to enable
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-10">
            <div className={`w-8 h-8 border-4 rounded-full animate-spin ${
              darkMode ? "border-gray-600 border-t-blue-400" : "border-gray-300 border-t-blue-500"
            }`}></div>
          </div>
        ) : error ? (
          <div className={`text-center py-4 font-semibold ${
            darkMode ? "text-red-400" : "text-red-500"
          }`}>
            ⚠️ Error: {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className={`text-center py-4 ${timeTextStyles}`}>
            No new notifications
          </div>
        ) : (
          <ul className="mt-2 space-y-3">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`flex flex-col p-3 transition duration-200 border-b rounded-lg shadow-sm ${
                  !notification.read ? (darkMode ? "bg-blue-900/30" : "bg-blue-50") : ""
                } ${notificationItemStyles}`}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={notification.notifier?.profilePic}
                    alt={notification.notifier?.fullname}
                    className="w-12 h-12 rounded-full border-2 border-blue-400"
                  />
                  <div className="flex-1">
                    <p className={`font-semibold ${textStyles}`}>
                      {notification.notifier.fullname}
                    </p>
                    <p className={`text-sm ${secondaryTextStyles}`}>
                      {notification.message}
                    </p>
                    <p className={`text-xs ${timeTextStyles}`}>
                      {formatDistanceToNow(parseISO(notification.time), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className={`w-3 h-3 rounded-full ${
                      darkMode ? "bg-blue-400" : "bg-blue-500"
                    }`}></div>
                  )}
                </div>
                <div className="mt-2 flex justify-end">
                  <Link
                    to={notification.link || "/"}
                    onClick={() => markAsRead(notification.id)}
                    className={`text-sm font-medium ${viewLinkStyles} flex items-center`}
                  >
                    View
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationBar;