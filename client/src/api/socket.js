import { io } from 'socket.io-client';

// One shared connection; the browser sends the accessToken cookie automatically
const socket = io(import.meta.env.VITE_API_BASE_URL, {
  withCredentials: true,
  autoConnect: false,
});

export default socket;