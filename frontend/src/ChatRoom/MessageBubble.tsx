import { useState } from "react";
import type { Message } from "../services/useChats";

interface MessageBubbleProps {
    message: Message;
    isMe: boolean;
    onDelete?: () => void;
}

const MessageBubble = ({ message, isMe, onDelete }: MessageBubbleProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className={`message-row ${isMe ? "me" : "other"}`}>
            <div 
                className={`message-bubble ${isMe ? "me" : "other"}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {message.isDeleted ? (
                    <p className="m-0 text-break fst-italic opacity-75">{message.content}</p>
                ) : (
                    <>
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
                    </>
                )}

                <div className="d-flex justify-content-end align-items-center mt-1 gap-2">
                    {isMe && !message.isDeleted && (
                        <button 
                            onClick={onDelete}
                            className="btn btn-link btn-sm p-0 text-decoration-none"
                            title="Delete message"
                            style={{ 
                                fontSize: '0.75rem', 
                                color: 'inherit',
                                opacity: isHovered ? 0.8 : 0,
                                transition: 'opacity 0.2s',
                                pointerEvents: isHovered ? 'auto' : 'none'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
                        >
                            Delete
                        </button>
                    )}
                    <span className="message-time d-block text-end opacity-75" style={{ fontSize: '0.75rem' }}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
