import ThreadsSidebar from "../ChatRoom/ThreadsSidebar";
import ChatWindow from "../ChatRoom/ChatWindow";  

const ChatLayout = () => {
    return (
       <div className="flex h-screen">
   <ThreadsSidebar />
   <ChatWindow />
</div>

    );
};

export default ChatLayout;