import type { Participant } from "../services/useChats";

interface ChatHeaderProps {
    participants: Participant[];
    currentUserId: string;
}

const ChatHeader = ({ participants, currentUserId }: ChatHeaderProps) => {
    // Filter out the current user to show the other participant(s)
    const otherParticipant = participants.find(p => p._id !== currentUserId) || participants[0];
    const title = otherParticipant?.fullName || "Chat";
    const avatar = otherParticipant?.profileImage;

    return (
        <div className="chat-header">
            <div className="d-flex align-items-center gap-3">
                <div className="avatar-container" style={{ width: '40px', height: '40px' }}>
                    {avatar ? (
                        <img src={avatar} alt={title} className="avatar-image" />
                    ) : (
                        <div className="avatar-placeholder" style={{ fontSize: '1rem' }}>
                            {title.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div>
                    <h5 className="m-0 fw-bold text-dark">{title}</h5>
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
