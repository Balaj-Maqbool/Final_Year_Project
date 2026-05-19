import { useEffect, useRef } from "react";
import type { Message } from "../services/useChats";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
    activeThreadId?: string;
    onDeleteMessage?: (messageId: string) => void;
}

const MessageList = ({ messages, currentUserId, activeThreadId, onDeleteMessage }: MessageListProps) => {
    const listRef = useRef<HTMLDivElement>(null);
    const prevThreadId = useRef(activeThreadId);

    useEffect(() => {
        if (listRef.current) {
            if (prevThreadId.current !== activeThreadId) {
                // Jump instantly when switching threads
                listRef.current.scrollTop = listRef.current.scrollHeight;
                prevThreadId.current = activeThreadId;
            } else {
                // Smooth scroll when new messages arrive
                listRef.current.scrollTo({
                    top: listRef.current.scrollHeight,
                    behavior: "smooth"
                });
            }
        }
    }, [messages.length, activeThreadId]);

    return (
        <div className="message-list custom-scrollbar" ref={listRef}>
            {[...messages].reverse().map((msgRef) => (
                <MessageBubble
                    key={msgRef._id}
                    message={msgRef}
                    isMe={typeof msgRef.from === 'object' && msgRef.from !== null ? msgRef.from._id === currentUserId : msgRef.from === currentUserId}
                    onDelete={() => onDeleteMessage && onDeleteMessage(msgRef._id)}
                />
            ))}
        </div>
    );
};

export default MessageList;
