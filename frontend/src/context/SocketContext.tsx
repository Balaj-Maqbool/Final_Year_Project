import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;

        // Assuming backend runs on port 8000
        const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', {
            withCredentials: true,
            transports: ['polling', 'websocket'],
        });

        newSocket.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('new_notification', (notification) => {
            console.log('New notification received:', notification);
            // Invalidate notifications query to refresh the list
            queryClient.invalidateQueries({ queryKey: ['notifications'] });

            // Optional: Show a toast or play a sound here
            // toast.info(notification.message);
        });

        // Listen for new messages to update chat threads list
        newSocket.on('new_message_notification', () => {
            queryClient.invalidateQueries({ queryKey: ['threads'] });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [queryClient]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
