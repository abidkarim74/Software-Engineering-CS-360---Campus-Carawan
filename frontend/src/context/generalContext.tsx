import React, { createContext, useState, useEffect, ReactNode } from "react";
import { getRequest } from "../services/apiRequests";
// import axiosJWT from "../services/axiosInstance";
import { AuthContext } from "./authContext.tsx";
import { useContext } from "react";


interface GeneralContextValue {
  unreadNotificationCount: number;
  setUnreadNotificationCount: React.Dispatch<React.SetStateAction<number>>;
  unreadMessagesCount: number;
  setUnreadMessagesCount: React.Dispatch<React.SetStateAction<number>>
  conversationIds: string[],
  setConversationIds: React.Dispatch<React.SetStateAction<string[]>>
  latestMessage: any;
  setLatestMessage: React.Dispatch<React.SetStateAction<any>>
}

export const GeneralContext = createContext<GeneralContextValue | null>(null);

interface GeneralProviderProps {
  children: ReactNode;
}

export const GeneralProvider: React.FC<GeneralProviderProps> = ({ children }) => {
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  const [latestMessage, setLatestMessage] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [conversationIds, setConversationIds] = useState<string[]>([]);

  console.log(error);
  console.log(loading);

  const auth = useContext(AuthContext);

  if (!auth) {
    return;
  }

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
      setConversationIds(response.ids);
    };
    fetchUnreadMessagesCount();
  }, []);

  console.log("dasddasda: ", conversationIds);

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
        setLatestMessage
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};