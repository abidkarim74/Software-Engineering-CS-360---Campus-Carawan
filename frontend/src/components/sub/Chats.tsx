import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { getRequest, postRequest, putRequest } from "../../services/apiRequests";
import { AuthContext } from "../../context/authContext";
import { useSocketContext } from "../../context/socketContext";
import { useTheme } from "../../context/themeContext";
import { v4 as uuidv4 } from "uuid";
import { FiSend, FiMoreHorizontal, FiHeart, FiSmile } from "react-icons/fi";
import { IoCheckmarkDone} from "react-icons/io5";
import { GeneralContext } from "../../context/generalContext";
import { useNavigate } from "react-router-dom";


type ChatsProps = {
  currentChat: string | null;
};

interface User {
  id: string;
  username: string;
  profilePic: string;
  fullname: string;
}

interface Message {
  id: string;
  message: string;
  createdAt: string;
  editedAt?: string;
  sender: User;
  seen?: boolean;
  conversationId:string
}

const Chats: React.FC<ChatsProps> = ({ currentChat }) => {
  const auth = useContext(AuthContext);
  
  if (!auth) return null;
  const { accessToken, user } = auth;

  const { darkMode } = useTheme();
  const [chats, setChats] = useState<any>([]);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const generalContext = useContext(GeneralContext);

  if (!generalContext) {
    return;
  }
  useEffect(() => {

    const seenMessages = async () => {
      const check = await getRequest(`/chat/${currentChat}/unread-messages-exist`, auth?.accessToken, setLoading, setError);
      
      if (check.unread) {
        const res = await putRequest({}, `/chat/${currentChat}/read-messages`);
        generalContext.setUnreadMessagesCount(generalContext.unreadMessagesCount - 1);
        console.log("saw: ", res);
      }
    } 
    seenMessages();

  }, [currentChat]);

  // console.log("Current Chat: ", currentChat);

  
  const { socket, onlineUsers } = useSocketContext();



  // Dynamic styles based on dark mode
  const containerStyles = darkMode
    ? "bg-gray-900 text-gray-100"
    : "bg-white text-gray-800";

  const messageInputStyles = darkMode
    ? "bg-gray-700 text-white placeholder-gray-400"
    : "bg-gray-100 text-gray-800 placeholder-gray-500";

  const messageBubbleStyles = (isSender: boolean) => 
    isSender
      ? darkMode
        ? "bg-blue-600 text-white rounded-tr-none"
        : "bg-blue-500 text-white rounded-tr-none"
      : darkMode
        ? "bg-gray-700 text-gray-100 rounded-tl-none"
        : "bg-gray-200 text-gray-800 rounded-tl-none";

  const dateHeaderStyles = darkMode
    ? "bg-gray-800 text-gray-300 border-gray-700"
    : "bg-white text-gray-500 border-gray-200";

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  useEffect(() => {
    if (!currentChat) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await getRequest(
          `/chat/conversation/${currentChat}`,
          accessToken,
          setLoading,
          setError
        );
        setChats(res?.messages || []);
        
        if (res?.users) {
          const other = res.users.find((participant: User) => participant.id !== user?.id);
          setOtherUser(other || null);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentChat, accessToken, user?.id]);

  useEffect(() => {
    if (!socket || !currentChat) return;

    const handleNewMessage = (newMessage: Message) => {
      console.log("new message: ", newMessage.conversationId);
      // if (newMessage.conversationId!==currentChat) {
      //   generalContext.setUnreadMessagesCount(generalContext.unreadMessagesCount + 1);
      // }
      if (newMessage.conversationId === currentChat) {
        setChats((prev:any) => {
          const exists = prev.some((msg:any) => msg.id === newMessage.id);
          return exists ? prev : [...prev, newMessage];
        });
        
      }
    
    };

    socket.on("newMessage", handleNewMessage);
    // socket.on("messageSeen", (messageId: string) => {
    //   setChats(prev => prev.map(msg => 
    //     msg.id === messageId ? { ...msg, seen: true } : msg
    //   ));
    // });

    return () => {
      socket.off("newMessage", handleNewMessage);
      // socket.off("messageSeen");
    };
  }, [socket, currentChat]);

  const sendMessage = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!message.trim()) return;
      if (!user || !currentChat) return;

      const currentDateTime = new Date().toISOString();
      
      const newMessage = {
        id: uuidv4(),
        message: message,
        createdAt: currentDateTime,
        sender: {
          id: user.id,
          username: user.username,
          profilePic: user.profilePic,
          fullname: user.fullname
        },
        seen: false,

      };

      // Optimistic update
      setChats((prevChats) => [...prevChats, newMessage]);
      setMessage("");
 
      try {
        const response = await postRequest(
          { message, currentDateTime, id: newMessage.id },
          `/chat/send-message/${currentChat}`,
          accessToken,
          undefined,
          setError
        );

        socket?.emit("sendMessage", {
          ...response.message,
          conversationId: currentChat
        });
      } catch (err: any) {
        setError(err?.message || "Failed to send message");
        // Rollback optimistic update on error
        setChats(prev => prev.filter(msg => msg.id !== newMessage.id));
      }
    },
    [message, currentChat, accessToken, socket, user]
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Group messages by date
  const groupedMessages = chats.reduce((acc, message) => {
    const date = formatDateHeader(message.createdAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(message);
    return acc;
  }, {} as Record<string, Message[]>);
  const navigate = useNavigate();

 

  return (
    <div className={`flex flex-col h-full ${containerStyles}`}>
      {/* Chat Header with User Info */}
      {/* <button className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400" onClick={handleBack}>
        <FaArrowLeft className="text-2xl" />
      </button> */}
      <div className={`p-3 border-b flex items-center justify-between sticky top-0 z-10 ${
        darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}>
        <div className="flex items-center space-x-3">
          {otherUser && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src={otherUser.profilePic || "/default-avatar.png"} 
                  alt={otherUser.fullname} 
                  className="w-8 h-8 rounded-full object-cover"
                />
                {onlineUsers.includes(otherUser.id) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div>
                <p className={`text-sm font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  {otherUser.fullname}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {onlineUsers.includes(otherUser.id) ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          )}
        </div>
        <button className={darkMode ? "text-gray-300" : "text-gray-600"}>
          <FiMoreHorizontal size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 ${darkMode ? 'bg-gray-800' : 'bg-[#fafafa]'}`}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
              darkMode ? 'border-blue-400' : 'border-blue-500'
            }`}></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p className={`px-4 py-2 rounded-lg ${
              darkMode ? 'text-red-400' : 'text-red-500'
            }`}>{error}</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold ${
              darkMode ? 'text-gray-200' : 'text-gray-800'
            }`}>No messages yet</h3>
            <p className={`text-sm mt-1 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Send a message to start the conversation</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, messages]) => (
            <div key={date} className="mb-4">
              <div className="flex justify-center mb-3">
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  dateHeaderStyles
                }`}>
                  {date}
                </span>
              </div>
              {messages.map((msg:any) => (
                <div
                  key={msg.id}
                  className={`flex mb-3 ${msg.sender.id === user?.id ? "justify-end" : "justify-start"}`}
                >
                  {msg.sender.id !== user?.id && (
                    <div className="flex-shrink-0 mr-2 self-end">
                      <img 
                        src={msg.sender.profilePic || "/default-avatar.png"} 
                        alt={msg.sender.fullname} 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`max-w-[70%] ${msg.sender.id === user?.id ? "flex flex-col items-end" : ""}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${messageBubbleStyles(msg.sender.id === user?.id)}`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <div className="flex items-center mt-1 space-x-1">
                      <span className={`text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.createdAt)}
                      </span>
                      {msg.sender.id === user?.id && (
                        <IoCheckmarkDone 
                          size={16} 
                          className={msg.seen ? (darkMode ? "text-blue-400" : "text-blue-500") : (darkMode ? "text-gray-500" : "text-gray-400")} 
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={`p-3 border-t sticky bottom-0 ${
        darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
      }`}>
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <button type="button" className={darkMode ? "text-gray-300" : "text-gray-600"}>
            <FiSmile size={24} />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`flex-1 p-2 rounded-full focus:outline-none text-sm px-4 ${messageInputStyles}`}
          />
          {message ? (
            <button
              type="submit"
              disabled={loading}
              className={`p-2 rounded-full ${
                darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              <FiSend size={18} />
            </button>
          ) : (
            <button type="button" className={darkMode ? "text-gray-300" : "text-gray-600"}>
              <FiHeart size={24} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Chats;