import { useContext, useEffect, useState } from "react";
import { getRequest} from "../../services/apiRequests";
import { AuthContext } from "../../context/authContext";
import { useTheme } from "../../context/themeContext";
import { GeneralContext } from "../../context/generalContext";
import { useSocketContext } from "../../context/socketContext";

type ConversationBarProps = {
  setCurrentChat: React.Dispatch<React.SetStateAction<string | null>>;
};

interface Message {
  id: string;
  message: string;
  time: string;
  senderId: string;
  seen: boolean;
  conversationId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  users: any[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

const ConversationBar: React.FC<ConversationBarProps> = ({
  setCurrentChat,
}) => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const auth = useContext(AuthContext);
  const { socket } = useSocketContext();
  const generalContext = useContext(GeneralContext);

  if (!auth || !generalContext) return null;


  if (auth.user?.isSuspended) {
    return (
      <div
        className={`flex items-center justify-center mt-5 px-4 ${
          darkMode ? "bg-[bg-gray-900]" : "bg-white"
        }`}
      >
        <div
          className={`border rounded-2xl shadow-xl p-8 max-w-md text-center ${
            darkMode
              ? "bg-[bg-gray-500] border-gray-700 text-gray-100"
              : "bg-[bg-gray-500] border-gray-200 text-gray-800"
          }`}
        >
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            Your account has been suspended
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please contact the admin for more information or assistance.
          </p>
        </div>
      </div>
    );
  }


  const accessToken = auth.accessToken;

 

  // Dynamic styles based on dark mode
  const containerStyles = darkMode
    ? "bg-gray-800 border-gray-700 text-gray-100"
    : "bg-white border-gray-200 text-gray-800";

  const searchInputStyles = darkMode
    ? "bg-gray-700 border-gray-600 focus:border-blue-400 placeholder-gray-400"
    : "bg-gray-100 border-gray-300 focus:border-blue-500 placeholder-gray-500";

  const conversationItemStyles = darkMode
    ? "hover:bg-gray-700"
    : "hover:bg-gray-100";

  const emptyStateStyles = darkMode ? "text-gray-400" : "text-gray-500";

  useEffect(() => {
    const getUserConversations = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getRequest(
          "/chat/conversations",
          accessToken,
          setLoading,
          setError
        );
        setConversations(res?.conversations || []);
      } catch {
        setError("Failed to fetch conversations");
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      getUserConversations();
    }
  }, [accessToken]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) => {
    const otherUser = conv.users.find((user: any) => user.id !== auth.user?.id);
    return otherUser?.username
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    if (!socket) return;
  
    const handleNewMessage = (newMessage: Message) => {
      setConversations((prevConversations) => {
        const conversationIndex = prevConversations.findIndex(
          (conv) => conv.id === newMessage.conversationId
        );

        if (conversationIndex === -1) return prevConversations;

        const updatedConversations = [...prevConversations];
        const targetConversation = { 
          ...updatedConversations[conversationIndex],
          messages: [...updatedConversations[conversationIndex].messages, newMessage],
          lastMessage: newMessage,
          unreadCount: newMessage.senderId !== auth.user?.id 
            ? updatedConversations[conversationIndex].unreadCount + 1 
            : updatedConversations[conversationIndex].unreadCount
        };

        // Move conversation to top
        updatedConversations.splice(conversationIndex, 1);
        updatedConversations.unshift(targetConversation);

        return updatedConversations;
      });
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, auth.user]);

  return (
    <div
      className={`w-full h-full rounded-xl shadow-lg overflow-hidden border flex flex-col ${containerStyles}`}
    >
      {/* ... (rest of your JSX remains the same) ... */}
      <h2 className={`px-4 py-3 text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
        Chats
      </h2>

      {/* Search Bar */}
      <div className="px-4 pb-2">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full p-2 border rounded-full focus:outline-none ${searchInputStyles}`}
        />
      </div>

      {/* Loading & Error Handling */}
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div
            className={`w-8 h-8 border-4 rounded-full animate-spin ${
              darkMode
                ? "border-gray-600 border-t-blue-400"
                : "border-gray-300 border-t-blue-500"
            }`}
          ></div>
        </div>
      )}

      {error && (
        <p className={`p-4 text-center ${darkMode ? "text-red-400" : "text-red-500"}`}>
          {error}
        </p>
      )}

      {!loading && !error && filteredConversations.length === 0 && (
        <p className={`p-4 text-center ${emptyStateStyles}`}>
          {searchQuery ? "No matching conversations" : "No conversations found"}
        </p>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv) => {
          const otherUser = conv.users.find(
            (user: any) => user.id !== auth.user?.id
          );
          const lastMessage = conv.messages[conv.messages.length - 1];
          
          return (
            <div
              key={conv.id}
              className={`flex items-center space-x-3 px-4 py-3 cursor-pointer transition-all rounded-lg ${conversationItemStyles}`}
              onClick={() => setCurrentChat(conv.id)}
            >
              <img
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-400"
                src={otherUser?.profilePic || "/default-avatar.png"}
                alt="User Avatar"
              />

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium truncate ${darkMode ? "text-gray-100" : "text-gray-800"}`}
                >
                  {otherUser?.username || "Unknown User"}
                </p>
                {lastMessage && (
                  <div className="flex items-center space-x-2 truncate">
                    {!lastMessage.seen &&
                      lastMessage.senderId !== auth.user?.id && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                      )}

                    <span
                      className={`text-xs truncate ${
                        !lastMessage.seen &&
                        lastMessage.senderId !== auth.user?.id
                          ? darkMode
                            ? "text-white font-semibold"
                            : "text-black font-semibold"
                          : darkMode
                            ? "text-gray-400 font-normal"
                            : "text-gray-500 font-normal"
                      }`}
                    >
                      {lastMessage.senderId === auth.user?.id
                        ? `You: ${lastMessage.message}`
                        : lastMessage.message}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end space-y-1">
                <span
                  className={`w-3 h-3 rounded-full ${
                    otherUser?.isOnline
                      ? darkMode
                        ? "bg-green-400"
                        : "bg-green-500"
                      : darkMode
                        ? "bg-gray-500"
                        : "bg-gray-400"
                  }`}
                ></span>
                {conv.unreadCount > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      darkMode
                        ? "bg-blue-600 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationBar;