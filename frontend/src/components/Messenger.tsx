import React, { useState } from "react";
import ConversationBar from "./sub/ConversationsBar";
import Chats from "./sub/Chats";
import { useTheme } from "../context/themeContext";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

const Messenger: React.FC = () => {
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const { darkMode } = useTheme();

  const auth = useContext(AuthContext);

  if (!auth) {
    return;
  }

  


  return (
    <section className={`absolute right-4 top-full mt-2 w-[90%] sm:w-[28rem] md:w-[32rem] lg:w-[36rem] h-[28rem] sm:h-[30rem] border rounded-lg shadow-xl flex transition-all duration-300 overflow-hidden ${
      darkMode 
        ? "border-gray-700 bg-gray-800 text-white" 
        : "border-gray-300 bg-white text-black"
    }`}>
      {/* Sidebar - Conversation List */}
      {!currentChat ? (
        <div className="flex-1 flex flex-col overflow-hidden">
         
          <div className={`overflow-y-auto scrollbar-thin flex-1 ${
            darkMode 
              ? "scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500" 
              : "scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400"
          }`}>
            <ConversationBar setCurrentChat={setCurrentChat} />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <Chats currentChat={currentChat} />
        </div>
      )}
    </section>
  );
};

export default Messenger;