import type { Message } from "../services/useChats";

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
}

const MessageBubble = ({ message, isMe }: MessageBubbleProps) => {
    return (
        <div className={`message-row ${isMe ? "me" : "other"}`}>
            <div className={`message-bubble ${isMe ? "me" : "other"}`}>
                <p className="m-0 text-break">{message.content}</p>
                <span className="message-time">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
