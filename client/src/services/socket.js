import { io } from 'socket.io-client';

// Use environment variable VITE_API_URL or fallback to window.location.origin
const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
  : window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});

export function connectSocket(user) {
  if (!socket.connected) {
    socket.connect();
  }

  if (user) {
    if (user.role === 'doctor' && user.doctorId) {
      socket.emit('join:doctor', user.doctorId);
    } else if (user.role === 'patient') {
      socket.emit('join:patient', user.id);
    } else if (user.role === 'admin') {
      socket.emit('join:admin');
    }
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}
