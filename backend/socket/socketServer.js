import { Server } from 'socket.io';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getChatAccess } from '../utils/chatAccess.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    // Same origin rules as the Express CORS config in server.js
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL
          : 'http://localhost:5173',
      credentials: true,
    },
  });

  // ─── AUTH: runs once per connection, same checks as the `protect` middleware ───
  io.use(async (socket, next) => {
    try {
      const cookies = parse(socket.handshake.headers.cookie || '');
      const token = cookies.accessToken;
      if (!token) return next(new Error('Unauthorized: no token'));

      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Unauthorized: user not found'));
      if (!user.isActive) return next(new Error('Unauthorized: account inactive'));

      socket.user = user; // available in every event handler for this connection
      next();
    } catch (_error) {
      next(new Error('Unauthorized: token failed or expired'));
    }
  });

  io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.user.email} (${socket.id})`);

  // Client asks to enter a project's chat room
  socket.on('chat:join', async (projectId, ack) => {
    try {
      const access = await getChatAccess(projectId, socket.user._id);
      if (!access.ok) return ack?.({ ok: false, message: access.message });

      socket.join(`project:${projectId}`);
      ack?.({ ok: true, canSend: access.canSend });
    } catch (_error) {
      ack?.({ ok: false, message: 'Could not join chat' });
    }
  });

  socket.on('chat:leave', (projectId) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.user.email}`);
  });
});
  return io;
};

// Lets controllers (like sendMessage in Step 4) emit events
export const getIO = () => {
  if (!io) throw new Error('Socket.IO has not been initialised');
  return io;
};