import ThreadsSidebar from "../ChatRoom/ThreadsSidebar";
import ChatWindow from "../ChatRoom/ChatWindow";
import "./Chat.css";

const ChatLayout = () => {
    return (
        <div className="d-flex chat-layout">
            <ThreadsSidebar />
            <ChatWindow />
        </div>
    );
};

export default ChatLayout;