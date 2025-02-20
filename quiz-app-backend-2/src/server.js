import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { knexInstance, testDbConnection } from './db.js';
import usersRoutes from './routes/users.js';
import participantRoutes from './routes/participant.js';
import quizroutes from './routes/quizzes.js';
import questionroutes from './routes/questions.js';
import resultroutes from './routes/results.js';
import leaderboardroutes from './routes/leaderboard.js';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();

// Ensure 'uploads/' directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Enable CORS for frontend (localhost:3000)
const corsOptions = {
 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images publicly
app.use('/uploads', express.static('uploads'));

// Define API routes
app.use('/api/users', usersRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/quizzes', quizroutes);
app.use('/api/questions', questionroutes);
app.use('/api/results', resultroutes);
app.use('/api/leaderboard', leaderboardroutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await testDbConnection();
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
});