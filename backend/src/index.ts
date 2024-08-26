import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins (you can specify your frontend URL here)
  },
});

app.use(cors())

// Store active whiteboard sessions
const sessions: { [key: string]: { users: string[] } } = {};

// Route to create a new session
app.get('/create', (req, res) => {
  const sessionId = uuidv4(); // Generate a unique ID
  sessions[sessionId] = { users: [] }; // Initialize the session
  res.json({ sessionId });
});

// Socket.io connection handler
io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  // Join a whiteboard session
  socket.on('join-session', (sessionId: string) => {
    if (sessions[sessionId]) {
      socket.join(sessionId);
      sessions[sessionId].users.push(socket.id);
      console.log(`User ${socket.id} joined session ${sessionId}`);

      // Notify others that a new user joined
      socket.to(sessionId).emit('user-joined', socket.id);

      // Share the list of connected users with the new user
      socket.emit('connected-users', sessions[sessionId].users);
    } else {
      socket.emit('session-not-found');
    }
  });

  // Listen for drawing data and broadcast it to others in the session
  socket.on('draw', (data) => {
    socket.to(data.sessionId).emit('draw', data);
  });

  // Listen for cursor movements and broadcast them
  socket.on('cursor-move', (data) => {
    socket.to(data.sessionId).emit('cursor-move', data);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove user from all sessions
    Object.keys(sessions).forEach((sessionId) => {
      sessions[sessionId].users = sessions[sessionId].users.filter(
        (userId) => userId !== socket.id
      );
      socket.to(sessionId).emit('user-left', socket.id);
    });
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



