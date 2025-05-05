import React, { useContext, useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import UpdateProfile from "./pages/UpdateProfile";
import LoginForm from "./pages/Login";
import ProtectedRoute from "./context/ProtectedRoutes";
import UserProfile from "./pages/UserProfile";
import Dashboard from "./pages/Dashboard";
import ChangePassword from "./pages/ChangePassword";
import Settings from "./pages/Settings";
import RideDetailPage from "./pages/RideDetailPage";
import Signup from "./pages/Signup";
import Header from "./components/Header";
import { AuthContext } from "./context/authContext";
import CreateRidePost from "./pages/CreateRidePost";
import { useTheme } from "./context/themeContext";
import { useSocketContext } from "./context/socketContext";
import UnauthenticatedHeader from "./components/UnauthenticatedHeader";
import { GeneralContext } from "./context/generalContext";
import UpdateVehicleInfo from "./pages/UpdateVehicleInfo";
import Trending from "./pages/Trending";

const App: React.FC = () => {
  const auth = useContext(AuthContext);
  if (!auth)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  const { darkMode } = useTheme();

  const { socket } = useSocketContext();
  const [notifications, setNotifications] = useState<any[]>([]);
  console.log(notifications);
  const generalContext = useContext(GeneralContext);

  if (!generalContext) {
    return;
  }

  useEffect(() => {
    if (!socket) return;
  
    const handleNewMessage = (newMessage: any) => {
      console.log("New Message received:", newMessage);
      // document.title = "New Message"!
      
      // Explicit check for message sender
      const isFromOtherUser = newMessage.sender?.id && newMessage.sender.id !== auth.user?.id;
      if (!isFromOtherUser) return;
  
      // Update latest message (only for messages from others)
      generalContext.setLatestMessage({
        id: newMessage.id,
        message: newMessage.message,
      });
  
      // Check if conversation exists
      const existingConversation = generalContext.conversationIds.find(
        conv => conv.id === newMessage.conversationId
      );
  
      if (existingConversation) {
        // Only update if conversation was previously seen
        if (!existingConversation.unseen) {
          generalContext.setConversationIds(prev => 
            prev.map(conv => 
              conv.id === newMessage.conversationId
                ? { ...conv, unseen: true }
                : conv
            )
          );
          generalContext.setUnreadMessagesCount(prev => prev + 1);
        }
      } else {
        // Add new conversation with unseen true
        generalContext.setConversationIds(prev => [
          ...prev,
          {
            id: newMessage.conversationId,
            unseen: true,
            // Add other conversation properties as needed
            lastMessage: newMessage.message,
            timestamp: new Date().toISOString(),
            // ... other required fields
          }
        ]);
        generalContext.setUnreadMessagesCount(prev => prev + 1);
      }
    };
  
    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [
    socket, 
    auth.user?.id,
    generalContext.conversationIds, 
    generalContext.setLatestMessage,
    generalContext.setConversationIds,
    generalContext.setUnreadMessagesCount
  ]);


  if (generalContext.notificationsOn) {
    

    
  }


  
  useEffect(() => {
    if (!socket) return;

    const handleNewNotifications = (newNotification: any) => {
      console.log("New Notification:", newNotification);
      setNotifications((prev) => [...prev, newNotification]);
      generalContext.setUnreadNotificationCount(
        generalContext.unreadNotificationCount + 1
      );
    };

    if (generalContext.notificationsOn) {
      socket.on("newNotification", handleNewNotifications);

      
    }

    return () => {
      socket.off("newNotification", handleNewNotifications);
    };
  }, [socket, generalContext.unreadNotificationCount]);

  // Dark mode background and text colors
  const appBackground = darkMode
    ? "bg-gray-900 text-gray-100 min-h-screen"
    : " text-gray-900 min-h-screen";

  return (
    <div className={!auth.user ? "" : appBackground}>
      {/* Header */}
      {auth.user ? <Header /> : <UnauthenticatedHeader />}

      {/* Main content area */}
      <main className="container mx-auto px-1 py-2">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/make-ride-request"
            element={
              <ProtectedRoute>
                <CreateRidePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={!auth.user ? <Signup /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!auth.user ? <LoginForm /> : <Navigate to="/" />}
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/:userId/update"
            element={
              <ProtectedRoute>
                <UpdateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-vehicle-info"
            element={
              <ProtectedRoute>
                <UpdateVehicleInfo></UpdateVehicleInfo>
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/ride/:postId"
            element={
              <ProtectedRoute>
                <RideDetailPage></RideDetailPage>
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/trending"
            element={
              <ProtectedRoute>
                <Trending></Trending>
              </ProtectedRoute>
            }
          ></Route>

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings></Settings>
              </ProtectedRoute>
            }
          ></Route>
          <Route
            path="/settings/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword></ChangePassword>
              </ProtectedRoute>
            }
          ></Route>
        </Routes>
      </main>

    </div>
  );
};

export default App;
