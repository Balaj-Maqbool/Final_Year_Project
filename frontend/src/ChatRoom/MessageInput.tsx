import { useState, useRef } from "react";
import { mediaHandler } from "../services/mediaHandler";
import { useChatStore } from "../store/chatStore";

interface MessageInputProps {
    onSendMessage: (content: string, attachments?: any[]) => void;
    isLoading: boolean;
}

const MessageInput = ({ onSendMessage, isLoading }: MessageInputProps) => {
    const [message, setMessage] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const activeThreadId = useChatStore((state) => state.activeThreadId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!message.trim() && !file) return;

        try {
            setUploading(true);
            let attachments: any[] = [];

            if (file) {
                // 1. Get Signature
                const config = await mediaHandler.getUploadSignature("chat", activeThreadId || undefined);
                // 2. Upload file to Cloudinary
                const uploadedAttachment = await mediaHandler.uploadFileToCloudinary(file, config);
                attachments.push(uploadedAttachment);
            }

            // Send actual message
            onSendMessage(message || "Sent an attachment", attachments.length > 0 ? attachments : undefined);
            
            setMessage("");
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            console.error("Error sending message with attachment:", error);
            alert("Failed to send attachment.");
        } finally {
            setUploading(false);
        }
    };

    const isWorking = isLoading || uploading;

    return (
        <form onSubmit={handleSubmit} className="input-area border-top p-3 bg-white d-flex flex-column gap-2">
            {file && (
                <div className="d-flex align-items-center justify-content-between bg-light border p-2 rounded" style={{ fontSize: '0.85rem' }}>
                    <span className="text-truncate" style={{ maxWidth: '200px' }}>📎 {file.name}</span>
                    <button type="button" className="btn-close ms-2" style={{ fontSize: '0.7rem' }} onClick={() => {
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                    }} title="Remove attachment"></button>
                </div>
            )}
            <div className="d-flex gap-2 w-100">
                <button 
                    type="button" 
                    className="btn btn-outline-secondary d-flex align-items-center justify-content-center flex-shrink-0" 
                    style={{ width: '45px', height: '45px', borderRadius: '50%' }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isWorking}
                    title="Attach a file"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                    className="d-none" 
                    // Optional: accept="image/*,application/pdf"
                />
                
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={file ? "Add a message..." : "Type a message..."}
                    disabled={isWorking}
                    className="form-control chat-input flex-grow-1"
                    style={{ borderRadius: '25px', paddingLeft: '1rem' }}
                />
                <button
                    type="submit"
                    disabled={isWorking || (!message.trim() && !file)}
                    className="btn btn-primary send-btn d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: '45px', height: '45px', borderRadius: '50%' }}
                >
                    {isWorking ? (
                        <div className="spinner-border spinner-border-sm text-light" role="status"></div>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    )}
                </button>
            </div>
        </form>
    );
};

export default MessageInput;
