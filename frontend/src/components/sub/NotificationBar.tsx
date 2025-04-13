import { getRequest } from "../../services/apiRequests";
import { useState, useEffect, useContext } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { AuthContext } from "../../context/authContext";
import { useSocketContext } from "../../context/socketContext";
import { useTheme } from "../../context/themeContext";

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
}

const NotificationBar = () => {
  const { darkMode } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { socket } = useSocketContext();
  const auth = useContext(AuthContext);

  if (!auth) {
    return null;
  }

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

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      const response = await getRequest(url, accessToken, setLoading, setError);
      setLoading(false);

      if (response.success) {
        setNotifications(response.notifications);
      } else {
        setError(response.error || "Failed to fetch notifications.");
      }
    };
    fetchNotifications();
  }, [accessToken, url]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotification: Notification) => {
      setNotifications((prev: Notification[]) => {
        const exists = prev.some((notif) => notif.id === newNotification.id);
        return exists ? prev : [newNotification, ...prev];
      });
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  return (
    <div 
      className={`absolute right-4 top-full mt-2 w-[90%] sm:w-[28rem] md:w-[32rem] lg:w-[36rem] max-h-[30rem] overflow-y-auto border rounded-lg shadow-2xl transition-all duration-300 ${containerStyles}`}
    >
      <div className="p-4">
        <h3 className={`text-lg font-semibold ${textStyles}`}>Notifications</h3>
        <ul className="mt-2 space-y-3">
          {loading ? (
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
            notifications.map((notification) => (
              <li
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`flex items-center space-x-4 p-3 transition duration-200 border-b rounded-lg shadow-sm cursor-pointer ${
                  !notification.read ? (darkMode ? "bg-blue-900/30" : "bg-blue-50") : ""
                } ${notificationItemStyles}`}
              >
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
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default NotificationBar;