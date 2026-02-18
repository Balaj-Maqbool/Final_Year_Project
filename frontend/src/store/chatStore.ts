import { create } from "zustand";

interface ChatState {
    activeThreadId: string | null;
    setActiveThread: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    activeThreadId: null,
    setActiveThread: (id) => set({ activeThreadId: id })
}));
