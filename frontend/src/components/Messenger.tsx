import React, { useState } from "react";
import ConversationBar from "./sub/ConversationsBar";
import Chats from "./sub/Chats";

const Messenger: React.FC = () => {
  const [currentChat, setCurrentChat] = useState<string | null>(null);

  return (
    <section className="absolute right-4 top-full mt-2 w-[90%] sm:w-[28rem] md:w-[32rem] lg:w-[36rem] h-[28rem] sm:h-[30rem] border border-gray-300 rounded-lg shadow-xl flex transition-all duration-300 bg-white text-black"
>
      {/* Sidebar - Conversation List */}
      {!currentChat ? (
        <div className="flex-1 border-r border-gray-300 overflow-y-auto shadow-lg transition-all duration-300 bg-gray-100">
          <h2 className="text-xl font-semibold p-4 border-b border-gray-300 bg-gray-200 text-gray-700">
          </h2>
          <ConversationBar setCurrentChat={setCurrentChat} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col shadow-md transition-all duration-300 bg-white text-black">
          <Chats currentChat={currentChat} />
        </div>
      )}
    </section>
  );
};

export default Messenger;
