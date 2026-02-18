import { useQuery } from "@tanstack/react-query";
import { useChatStore } from "../store/chatStore";
import { getMyThreads } from "../services/useChats";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const ThreadsSidebar = () => {
    const activeThreadId = useChatStore((state) => state.activeThreadId);
    const setActiveThread = useChatStore((state) => state.setActiveThread);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: user } = useQuery({ queryKey: ['user'], queryFn: () => JSON.parse(localStorage.getItem('user') || '{}') });

    const { data, isLoading, isError } = useQuery({
        queryKey: ["threads"],
        queryFn: getMyThreads,
    });

    if (isLoading) return <div className="chat-sidebar p-3 d-flex align-items-center justify-content-center">Loading...</div>;
    if (isError) return <div className="chat-sidebar p-3 text-danger">Error loading chats</div>;

    const threads = data?.docs || [];
    const filteredThreads = threads.filter(thread => {
        const otherParticipant = thread.participants.find(p => p._id !== user?._id);
        return otherParticipant?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="chat-sidebar">
            <div className="sidebar-header">
                <h4 className="mb-0 fw-bold text-dark">Messages</h4>
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-control search-input"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </div>
            </div>

            <div className="thread-list">
                {filteredThreads.length === 0 ? (
                    <div className="p-4 text-center text-muted small">
                        No conversations found
                    </div>
                ) : (
                    <div className="d-flex flex-column">
                        {filteredThreads.map((thread) => {
                            const otherParticipant = thread.participants.find(p => p._id !== user?._id) || thread.participants[0];
                            const isActive = activeThreadId === thread._id;
                            const unreadCount = thread.unreadCounts?.[user?._id] || 0;

                            return (
                                <div
                                    key={thread._id}
                                    onClick={() => setActiveThread(thread._id)}
                                    className={`thread-item d-flex gap-3 align-items-center ${isActive ? 'active' : ''}`}
                                >
                                    <div className="avatar-container">
                                        {otherParticipant?.profileImage ? (
                                            <img src={otherParticipant.profileImage} alt="" className="avatar-image" />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {otherParticipant?.fullName?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        {/* Status indicator - can make conditional later */}
                                        <div className="status-indicator"></div>
                                    </div>

                                    <div className="thread-content flex-grow-1">
                                        <div className="thread-top-row">
                                            <h6 className="thread-name">
                                                {otherParticipant?.fullName}
                                            </h6>
                                            {thread.lastMessage?.timestamp && (
                                                <span className="thread-time">
                                                    {formatDistanceToNow(new Date(thread.lastMessage.timestamp), { addSuffix: false }).replace('about ', '')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="thread-bottom-row">
                                            <p className="thread-preview mb-0">
                                                {thread.lastMessage?.from === user?._id ? <span className="text-secondary fw-normal">You: </span> : ''}
                                                {thread.lastMessage?.content || 'Sent an attachment'}
                                            </p>
                                            {unreadCount > 0 && (
                                                <span className="unread-badge">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ThreadsSidebar;