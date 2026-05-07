import { useEffect, useRef } from "react";
import type { Message } from "../services/useChats";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
}

const MessageList = ({ messages, currentUserId }: MessageListProps) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="message-list custom-scrollbar">
            {[...messages].reverse().map((msgRef) => (
                <MessageBubble
                    key={msgRef._id}
                    message={msgRef}
                    isMe={msgRef.from._id === currentUserId}
                />
            ))}
            <div ref={bottomRef} />
        </div>
    );
};

export default MessageList;
