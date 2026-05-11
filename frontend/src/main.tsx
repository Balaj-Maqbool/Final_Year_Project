import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './ChatRoom/Chat.css';
import './index.css'
import router from '../router'
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <ThemeProvider>
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
          <RouterProvider router={router} />
        </ThemeProvider>
      </SocketProvider>
    </QueryClientProvider>
  </StrictMode>,
)
