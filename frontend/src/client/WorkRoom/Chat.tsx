import { useParams } from "react-router-dom";
import ChatLayout from "../../ChatRoom/ChatLayout";
import { useQuery } from "@tanstack/react-query";
import { getMyThreads } from "../../services/useChats";
import { useChatStore } from "../../store/chatStore";
import { useEffect } from "react";

const Chat = () => {
    const { jobId } = useParams();
    const activeThreadId = useChatStore((state) => state.activeThreadId);
    const setActiveThread = useChatStore((state) => state.setActiveThread);

    const { data: threads } = useQuery({
        queryKey: ["threads"],
        queryFn: getMyThreads,
    });

    useEffect(() => {
        if (jobId && threads?.docs) {
            const thread = threads.docs.find((t) => t.jobId === jobId);
            if (thread && thread._id !== activeThreadId) {
                setActiveThread(thread._id);
            }
        }
    }, [jobId, threads, setActiveThread, activeThreadId]);

    return <ChatLayout />;
};

export default Chat;