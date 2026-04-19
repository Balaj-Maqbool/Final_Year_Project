import { apiRequest } from "./apiClient"
import type { PaginatedResponse } from "./jobHandler";

export interface Participant {
    _id: string;
    fullName: string;
    profileImage?: string;
    email?: string;
}

export interface Chat{
    participants:Participant[],
    jobId:string,
    bidId:string,
    status:string,
    lastMessage?: {
        content: string;
        from: Participant;
        timestamp: string;
    };
     unreadCounts?: Record<string, number>;
    _id:string,
    createdAt:string,
    updatedAt:string,
    __v:number

}

export interface Message{
    _id:string,
    content:string,
    from:Participant,
    status:string,
    createdAt:string,
    updatedAt:string,
    __v:number,
    attachments?: { url: string; publicId: string; resourceType: string; originalName?: string; }[]
}

export const InitializeChat = async(bidId:string)=>{
    return await apiRequest (`/chats/start/${bidId}`, "POST")
}

export const getMyThreads = async ()=>{
    return await apiRequest<PaginatedResponse<Chat>>(`/chats`)
}

export const deleteThread = async(threadId:string)=>{

    return await apiRequest<void>(`/chats/${threadId}`)
}

export const getThreadMessages = async (threadId:string)=>{
return await apiRequest<PaginatedResponse<Message>>(`/chats/${threadId}/messages`)

}

export const deleteMessage = async (messageId:string)=>{
return await apiRequest<Message>(`/chats/messages/${messageId}`)

}

export const markMessagesAsRead = async (threadId:string)=>{
return await apiRequest<void>(`/chats/${threadId}/read`)

}

export const blockThread = async (threadId:string)=>{
return await apiRequest<void>(`/chats/${threadId}/block`)

}

export const unblockThread = async (threadId:string)=>{
    return await apiRequest<void>(`/chats/${threadId}/unblock`)
}

export const sendMessage = async (threadId: string, content: string, attachments?: any[]) => {
    return await apiRequest<Message>(`/chats/${threadId}/messages`, "POST", { content, attachments });
}
    