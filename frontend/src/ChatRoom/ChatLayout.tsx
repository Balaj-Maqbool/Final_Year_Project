import { useState } from "react";
import ThreadsSidebar from "../ChatRoom/ThreadsSidebar";
import ChatWindow from "../ChatRoom/ChatWindow";
import "./Chat.css";

const ChatLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="d-flex chat-layout position-relative">
            {sidebarOpen && (
                <div 
                    className="sidebar-overlay d-md-none" 
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
            <div className={`chat-sidebar-wrapper ${sidebarOpen ? 'open' : ''}`}>
                <ThreadsSidebar onThreadSelect={() => setSidebarOpen(false)} />
            </div>
            <div className="flex-grow-1 h-100 overflow-hidden">
                <ChatWindow onMenuClick={() => setSidebarOpen(true)} />
            </div>
        </div>
    );
};

export default ChatLayout;