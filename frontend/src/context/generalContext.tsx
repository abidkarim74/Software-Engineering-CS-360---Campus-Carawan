import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getRequest } from "../services/apiRequests";
import { AuthContext } from "./authContext.tsx";
import { useContext } from "react";

interface GeneralContextValue {
  unreadNotificationCount: number;
  setUnreadNotificationCount: React.Dispatch<React.SetStateAction<number>>;
  unreadMessagesCount: number;
  setUnreadMessagesCount: React.Dispatch<React.SetStateAction<number>>;
  conversationIds: Conversation[];
  setConversationIds: React.Dispatch<React.SetStateAction<Conversation[]>>;
  latestMessage: any;
  setLatestMessage: React.Dispatch<React.SetStateAction<any>>;
  notificationsOn: boolean;
  setNotificationsOn: React.Dispatch<React.SetStateAction<boolean>>;
  toggleNotifications: () => void;
}

export const GeneralContext = createContext<GeneralContextValue | null>(null);

interface GeneralProviderProps {
  children: ReactNode;
}

interface Conversation {
  id: string;
  unseen: boolean;
}

export const GeneralProvider: React.FC<GeneralProviderProps> = ({ children }) => {
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [latestMessage, setLatestMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [conversationIds, setConversationIds] = useState<Conversation[]>([]);
  
  // Initialize notificationsOn from localStorage or default to true
  const [notificationsOn, setNotificationsOn] = useState<boolean>(() => {
    // Get from localStorage if available, otherwise default to true
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notificationsOn');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  console.log(error);
  console.log(loading);

  const auth = useContext(AuthContext);

  if (!auth) {
    return null;
  }

  // Save notificationsOn to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('notificationsOn', JSON.stringify(notificationsOn));
  }, [notificationsOn]);

  // Helper function to toggle notifications
  const toggleNotifications = () => {
    setNotificationsOn(prev => !prev);
  };

  useEffect(() => {
    const fetchCount = async () => {
      const response = await getRequest("/notifications/get-unread-count", auth.accessToken, setLoading, setError);
      setUnreadNotificationCount(response.count);
    }
    fetchCount();
  }, []);

  useEffect(() => {
    const fetchUnreadMessagesCount = async () => {
      const response = await getRequest(
        "/chat/get-unread-count",
        auth?.accessToken
      );
      setUnreadMessagesCount(response.count);
      let conversations: Conversation[] = [];

      console.log("ooooo: ", response.ids);

      for (let i = 0; i < response.ids.length; i++) {
        conversations.push({
          id: response.ids[i],
          unseen: true
        });
      }
      setConversationIds(conversations);
    };
    fetchUnreadMessagesCount();
  }, []);

  return (
    <GeneralContext.Provider
      value={{
        conversationIds,
        unreadNotificationCount,
        setUnreadNotificationCount,
        setUnreadMessagesCount,
        unreadMessagesCount,
        setConversationIds,
        latestMessage,
        setLatestMessage,
        notificationsOn,
        setNotificationsOn,
        toggleNotifications
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};