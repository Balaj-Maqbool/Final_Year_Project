import type { Message } from "../services/useChats";

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
}

const MessageBubble = ({ message, isMe }: MessageBubbleProps) => {
    return (
        <div className={`message-row ${isMe ? "me" : "other"}`}>
            <div className={`message-bubble ${isMe ? "me" : "other"}`}>
                {message.content && <p className="m-0 text-break">{message.content}</p>}
                
                {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 d-flex flex-column gap-1">
                        {message.attachments.map((att, index) => {
                            const isImage = att.resourceType === 'image' || att.url.match(/\.(jpeg|jpg|gif|png|webp)$/i);
                            return isImage ? (
                                <img 
                                    key={index} 
                                    src={att.url} 
                                    alt="attachment" 
                                    className="img-fluid rounded" 
                                    style={{ maxHeight: '200px', objectFit: 'cover' }} 
                                />
                            ) : (
                                <a 
                                    key={index} 
                                    href={att.url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className={`btn btn-sm text-start text-truncate ${isMe ? "btn-light" : "btn-primary text-white"} opacity-75`}
                                    style={{ maxWidth: '100%' }}
                                >
                                    📎 {att.originalName || "View Attachment"}
                                </a>
                            );
                        })}
                    </div>
                )}

                <span className="message-time mt-1 d-block text-end opacity-75" style={{ fontSize: '0.75rem' }}>
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
