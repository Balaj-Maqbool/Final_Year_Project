import type { Participant } from "../services/useChats";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
    participants: Participant[];
    currentUserId: string;
    onMenuClick?: () => void;
}

const ChatHeader = ({ participants, currentUserId, onMenuClick }: ChatHeaderProps) => {
    const navigate = useNavigate();
    // Filter out the current user to show the other participant(s)
    const otherParticipant = participants.find(p => p._id !== currentUserId) || participants[0];
    const title = otherParticipant?.fullName || "Chat";
    const avatar = otherParticipant?.profileImage;

    return (
        <div className="chat-header">
            <div className="d-flex align-items-center gap-2 gap-md-3">
                {/* Hamburger Menu for Mobile */}
                <button 
                    className="btn btn-light btn-sm d-md-none me-1" 
                    onClick={onMenuClick}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <div 
                    className="avatar-container" 

                    style={{ width: '40px', height: '40px', cursor: 'pointer' }}
                    onClick={() => otherParticipant?._id && navigate(`/profile/${otherParticipant._id}`)}
                >
                    {avatar ? (
                        <img src={avatar} alt={title} className="avatar-image" />
                    ) : (
                        <div className="avatar-placeholder" style={{ fontSize: '1rem' }}>
                            {title.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div>
                    <h5 
                        className="m-0 fw-bold text-dark" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => otherParticipant?._id && navigate(`/profile/${otherParticipant._id}`)}
                    >
                        {title}
                    </h5>
                    <small className="text-success d-flex align-items-center gap-1">
                        <span className="bg-success rounded-circle d-inline-block" style={{ width: '8px', height: '8px' }}></span> Online
                    </small>
                </div>
            </div>
            {/* Add more header actions here if needed */}
        </div>
    );
};

export default ChatHeader;
