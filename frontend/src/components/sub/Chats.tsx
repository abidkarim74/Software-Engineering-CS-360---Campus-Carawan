import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from "react";
import {
  getRequest,
  postRequest,
  putRequest,
} from "../../services/apiRequests";
import { AuthContext } from "../../context/authContext";
import { useSocketContext } from "../../context/socketContext";
import { useTheme } from "../../context/themeContext";
import { v4 as uuidv4 } from "uuid";
import { FiSend, FiMoreHorizontal, FiHeart, FiSmile } from "react-icons/fi";
import { IoCheckmarkDone } from "react-icons/io5";
import { GeneralContext } from "../../context/generalContext";

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
  conversationId: string;
}

const Chats: React.FC<ChatsProps> = ({ currentChat }) => {
  const auth = useContext(AuthContext);
  const generalContext = useContext(GeneralContext);
  const { socket, onlineUsers } = useSocketContext();
  const { darkMode } = useTheme();

  if (!auth || !generalContext) return null;

  const { accessToken, user } = auth;
  const [chats, setChats] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [userScrolling, setUserScrolling] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const prevChatsLengthRef = useRef(0);

  const [newMessage, setNewMessage] = useState<boolean>(false);

  

  const [clean, setClean] = useState<boolean | null>(null);


  

  useEffect(() => {
    let isMounted = true;

    const filterMessages = async () => {
      const url = `/chat/filter-messages/${currentChat}`;
      const response = await getRequest(url, auth.accessToken);

      console.log("Filter response: ", response);

      if (isMounted && response) {
        setClean(response.clean);
      }
    };

    if (currentChat) {
      // Only run if currentChat exists
      filterMessages();
    }

    return () => {
      isMounted = false; // Cleanup function to prevent state updates after unmount
    };
  }, [currentChat, auth.accessToken]); // Added auth.accessToken to dependencies
  useEffect(() => {
    if (!currentChat || !auth?.accessToken) return;
  
    let isMarked = false; // NEW flag
  
    const seenMessages = async () => {
      try {
        const check = await getRequest(
          `/chat/${currentChat}/unread-messages-exist`,
          auth.accessToken,
          setLoading,
          setError
        );
  


        console.log("Its here: ", generalContext.conversationIds);
        if (check.unread && !isMarked) {
          await putRequest({}, `/chat/${currentChat}/read-messages`);
          generalContext.setUnreadMessagesCount(generalContext.unreadMessagesCount-1);
          isMarked = true; 

          generalContext.  setConversationIds(prevConversations => 
            prevConversations.map(conv => 
              conv.id === currentChat 
                ? { ...conv, unseen: false }
                : conv
            )
          );

        }
      } catch (err) {
        console.error("Error marking messages as seen:", err);
      }
    };
  
    seenMessages();
  }, [currentChat, auth?.accessToken, newMessage]);
  

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

  // Handle scroll events to determine if at bottom
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 20;
    setIsScrolledToBottom(isAtBottom);

    // Mark as user scrolling to prevent auto-scroll interference
    if (!isAtBottom) {
      setUserScrolling(true);
    }
  }, []);

  // Debounced scroll handler to detect when user finishes scrolling
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScrollEnd = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        const container = messagesContainerRef.current;
        if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container;
          const isAtBottom =
            Math.abs(scrollHeight - scrollTop - clientHeight) < 20;

          if (isAtBottom) {
            setUserScrolling(false);
          }
        }
      }, 150); // Adjust timeout as needed
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScrollEnd);
      return () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        container.removeEventListener("scroll", handleScrollEnd);
      };
    }
  }, []);

  // Scroll to bottom of messages only if already at bottom or new message from current user
  const scrollToBottom = useCallback(
    (force = false) => {
      if (!messagesEndRef.current || (userScrolling && !force)) return;

      messagesEndRef.current.scrollIntoView({
        behavior: initialLoad ? "auto" : "smooth",
        block: "end",
      });

      if (initialLoad) {
        setInitialLoad(false);
      }
    },
    [initialLoad, userScrolling]
  );

  // Effect for monitoring chat updates and determining when to auto-scroll
  useEffect(() => {
    const chatLengthChanged = chats.length !== prevChatsLengthRef.current;
    prevChatsLengthRef.current = chats.length;

    // Initial load or empty chats - always scroll to bottom
    if (initialLoad || chats.length === 0) {
      setTimeout(() => scrollToBottom(true), 100);
      return;
    }

    if (chatLengthChanged) {
      const lastMessage = chats[chats.length - 1];
      const isOwnMessage = lastMessage?.sender?.id === user?.id;

      // Always scroll for own messages, or if user is already at bottom
      if (isOwnMessage || isScrolledToBottom) {
        setTimeout(() => scrollToBottom(isOwnMessage), 50);
      }
    }
  }, [chats, scrollToBottom, user?.id, initialLoad, isScrolledToBottom]);

  const fetchMessages = useCallback(async () => {
    if (!currentChat || !accessToken || !user?.id) return;

    try {
      setLoading(true);
      const res = await getRequest(
        `/chat/conversation/${currentChat}`,
        accessToken,
        setLoading,
        setError
      );

      setChats(res?.messages || []);
      setInitialLoad(true);
      prevChatsLengthRef.current = res?.messages?.length || 0;

      if (res?.users) {
        const other = res.users.find(
          (participant: User) => participant.id !== user.id
        );
        setOtherUser(other || null);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [currentChat, accessToken, user?.id]);

  useEffect(() => {
    fetchMessages();
    setUserScrolling(false);
  }, [fetchMessages]);

  useEffect(() => {
    if (!socket || !currentChat) return;

    const handleNewMessage = (newMessage: Message) => {
      console.log("New Message received: ", newMessage);

      setNewMessage(!newMessage);
      
      const updatedMessage = {
        ...newMessage,
        seen: newMessage.conversationId === currentChat
      };
    
      // Update messages in current chat
      if (updatedMessage.conversationId === currentChat) {
        setChats(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          return exists ? prev : [...prev, updatedMessage];
        });
        
        // Update conversation's unseen status
        generalContext.setConversationIds(prev =>
          prev.map(conv =>
            conv.id === currentChat
              ? { ...conv, unseen: false }
              : conv
          )
        );
      } else {
        // For messages in other conversations
        generalContext.setConversationIds(prev =>
          prev.map(conv =>
            conv.id === newMessage.conversationId
              ? { ...conv, unseen: true }
              : conv
          )
        );
        
        // Increment unread count if needed
        const conversation = generalContext.conversationIds.find(
          conv => conv.id === newMessage.conversationId
        );
        
        if (!conversation?.unseen) {
          generalContext.setUnreadMessagesCount(prev => prev + 1);
        }
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, currentChat]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const sendMessage = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!message.trim() || !user || !currentChat || !accessToken || !socket)
        return;

      const currentDateTime = new Date().toISOString();

      const newMessage: Message = {
        id: uuidv4(),
        message: message,
        createdAt: currentDateTime,
        sender: {
          id: user.id,
          username: user.username,
          profilePic: user.profilePic,
          fullname: user.fullname,
        },
        seen: false,
        conversationId: currentChat,
      };

      // Optimistic update
      setChats((prev) => [...prev, newMessage]);
      setMessage("");

      // Reset userScrolling when sending a message
      setUserScrolling(false);

      // Force scroll to bottom when sending a message
      setTimeout(() => scrollToBottom(true), 50);

      try {
        const response = await postRequest(
          { message, currentDateTime, id: newMessage.id },
          `/chat/send-message/${currentChat}`,
          accessToken
        );
        // console.log("Message response: ", response);

        socket.emit("sendMessage", {
          ...response.message,
          conversationId: currentChat,
        });
      } catch (err: any) {
        setError(err?.message || "Failed to send message");
        // Rollback optimistic update on error
        setChats((prev) => prev.filter((msg) => msg.id !== newMessage.id));
      }
    },
    [message, currentChat, accessToken, socket, user, scrollToBottom]
  );

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  const formatDateHeader = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  }, []);

  // Group messages by date
  const groupedMessages = chats.reduce(
    (acc, message) => {
      const date = formatDateHeader(message.createdAt);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(message);
      return acc;
    },
    {} as Record<string, Message[]>
  );

  // New button to scroll to bottom if not already there
  const ScrollToBottomButton = () => {
    if (isScrolledToBottom) return null;

    return (
      <button
        onClick={() => {
          scrollToBottom(true);
          setUserScrolling(false);
        }}
        className={`absolute bottom-16 right-4 p-2 rounded-full shadow-lg ${
          darkMode ? "bg-gray-700 text-blue-400" : "bg-white text-blue-500"
        } flex items-center justify-center transition-all duration-200 hover:scale-110`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    );
  };

  // Custom scrollbar styles using CSS variables
  const scrollbarThumbColor = darkMode ? "#4B5563" : "#CBD5E0"; // gray-600 or gray-300
  const scrollbarTrackColor = darkMode ? "#1F2937" : "#F3F4F6"; // gray-800 or gray-100
  const scrollbarHoverColor = darkMode ? "#6B7280" : "#9CA3AF"; // gray-500 or gray-400

  return (
    <div className={`flex flex-col h-full ${containerStyles}`}>
      {/* Chat Header with User Info */}

      <div
        className={`p-3 border-b flex items-center justify-between sticky top-0 z-10 ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        }`}
      >
        <div className="flex items-center space-x-3">
          {otherUser && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={otherUser.profilePic || "/default-avatar.png"}
                  alt={otherUser.fullname}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
                {onlineUsers.includes(otherUser.id) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}
                >
                  {otherUser.fullname}
                </p>
                <p
                  className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                >
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

      {/* Messages Area with CSS Styled Scrollbar */}
      <div
        ref={messagesContainerRef}
        className={`flex-1 overflow-y-auto p-4 ${darkMode ? "bg-gray-800" : "bg-[#fafafa]"} relative custom-scrollbar`}
        style={
          {
            // Use 'auto' for initial scroll behavior to prevent smooth scrolling on load
            scrollBehavior: initialLoad ? "auto" : "smooth",
            // Custom CSS variables for scrollbar styling
            "--scrollbar-thumb": scrollbarThumbColor,
            "--scrollbar-track": scrollbarTrackColor,
            "--scrollbar-hover": scrollbarHoverColor,
          } as React.CSSProperties
        }
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div
              className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${
                darkMode ? "border-blue-400" : "border-blue-500"
              }`}
            ></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full">
            <p
              className={`px-4 py-2 rounded-lg ${
                darkMode ? "text-red-400" : "text-red-500"
              }`}
            >
              {error}
            </p>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-8 w-8 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3
              className={`text-lg font-semibold ${
                darkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              No messages yet
            </h3>

            <p
              className={`text-sm mt-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, messages]) => (
            <div key={date} className="mb-4">
              <div className="flex justify-center mb-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${
                    dateHeaderStyles
                  }`}
                >
                  {date}
                </span>
              </div>
              {messages.map((msg) => (
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
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/default-avatar.png";
                        }}
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] ${msg.sender.id === user?.id ? "flex flex-col items-end" : ""}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl ${messageBubbleStyles(msg.sender.id === user?.id)}`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <div className="flex items-center mt-1 space-x-1">
                      <span
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </span>
                      {msg.sender.id === user?.id && (
                        <IoCheckmarkDone
                          size={16}
                          className={
                            msg.seen
                              ? darkMode
                                ? "text-blue-400"
                                : "text-blue-500"
                              : darkMode
                                ? "text-gray-500"
                                : "text-gray-400"
                          }
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

        {/* Scroll to bottom button */}
        <ScrollToBottomButton />
      </div>

      {clean === false && (
        <div className="flex items-center justify-center  p-4">
          <div className=" w-[95%] p-4 mb-4 text-red-700 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md animate-fade-in">
          <div className="flex items-start">
            <svg
              className="flex-shrink-0 w-5 h-5 mt-0.5 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium">Content Warning</h3>
              <div className="mt-2 text-sm text-red-600">
                <p>
                  Our system detected language that violates our community
                  guidelines.
                </p>
                <ul className="mt-1 list-disc list-inside">
                  <li>This is your {3} of 3 warnings</li>
                  <li>Account suspension occurs after 3 warnings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        </div>
        
      )}
      {/* Message Input */}
      <div
        className={`p-3 border-t sticky bottom-0 ${
          darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
        }`}
      >
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className={darkMode ? "text-gray-300" : "text-gray-600"}
          >
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
                darkMode
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              <FiSend size={18} />
            </button>
          ) : (
            <button
              type="button"
              className={darkMode ? "text-gray-300" : "text-gray-600"}
            >
              <FiHeart size={24} />
            </button>
          )}
        </form>
      </div>

      {/* Add CSS for custom scrollbar */}
      <style>{`
        /* Custom scrollbar styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--scrollbar-track);
          border-radius: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--scrollbar-thumb);
          border-radius: 8px;
          transition: background-color 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--scrollbar-hover);
        }
        
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
        }
        
        /* Make sure scrollbar doesn't affect layout */
        .custom-scrollbar {
          overflow-y: overlay;
        }
      `}</style>
    </div>
  );
};

export default Chats;
