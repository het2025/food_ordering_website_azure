import { io } from 'socket.io-client';

// Production : VITE_SOCKET_URL = 'https://delivery-backend-xxxx.onrender.com'
// Development: No env var → connect to window.location (Vite proxy handles /socket.io)
// NEVER fall back to http://hostname:5003 in production — that hits the Vercel frontend!
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined; // undefined = connect to same origin (works with Vite proxy in dev)


let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
  }
  return socket;
};

export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const getSocket = () => socket;

export default { initSocket, connectSocket, disconnectSocket, getSocket };
