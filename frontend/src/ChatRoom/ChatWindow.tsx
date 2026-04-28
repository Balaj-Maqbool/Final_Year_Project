import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/useAuthStore";
import { getThreadMessages, sendMessage, getMyThreads, type Chat } from "../services/useChats";
import { useParams, Link } from "react-router-dom";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatWindow = () => {
    const activeThreadId = useChatStore((state) => state.activeThreadId);
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const { jobId } = useParams();

    const { data: threads } = useQuery({
        queryKey: ["threads"],
        queryFn: getMyThreads
    });
    const activeThread = threads?.docs.find((t: Chat) => t._id === activeThreadId);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["messages", activeThreadId],
        queryFn: () => getThreadMessages(activeThreadId!),
        enabled: !!activeThreadId,
        refetchInterval: 3000,
    });

    const mutation = useMutation({
        mutationFn: ({ content, attachments }: { content: string, attachments?: any[] }) => sendMessage(activeThreadId!, content, attachments),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages", activeThreadId] });
            queryClient.invalidateQueries({ queryKey: ["threads"] });
        },
    });

    const handleSendMessage = (content: string, attachments?: any[]) => {
        if (!activeThreadId) return;
        mutation.mutate({ content, attachments });
    };

    if (!activeThreadId) {
        return (
            <div className="chat-window d-flex align-items-center justify-content-center text-muted">
                {jobId ? (
                    <div className="text-center p-5 bg-white rounded-3 shadow-sm border" style={{ maxWidth: '400px' }}>
                        <div className="mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary opacity-25">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                        </div>
                        <h4 className="fw-bold mb-2 text-dark">Start a Conversation</h4>
                        <p className="mb-4 small">Select a freelancer to start chatting with.</p>
                        <Link
                            to={`/client/view-bids/${jobId}`}
                            className="btn btn-primary px-4 py-2 w-100 fw-medium"
                        >
                            Select Freelancer
                        </Link>
                    </div>
                ) : (
                    <p>Select a thread to start chatting</p>
                )}
            </div>
        );
    }

    if (isLoading) return <div className="chat-window d-flex align-items-center justify-content-center p-4">Loading messages...</div>;
    if (isError) return <div className="chat-window d-flex align-items-center justify-content-center p-4 text-danger">Error loading messages</div>;

    const messages = data?.docs || [];

    return (
        <div className="chat-window">
            {activeThread && user && (
                <ChatHeader
                    participants={activeThread.participants}
                    currentUserId={user?._id}
                />
            )}

            <MessageList
                messages={messages}
                currentUserId={user?._id}
            />

            <MessageInput
                onSendMessage={handleSendMessage}
                isLoading={mutation.isPending}
            />
        </div>
    );
};

export default ChatWindow;