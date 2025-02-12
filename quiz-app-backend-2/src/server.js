import express from 'express';
import dotenv from 'dotenv';
import { knexInstance, testDbConnection } from './db.js'; // Import testDbConnection function
import usersRoutes from './routes/users.js';
import participantRoutes from './routes/participant.js';
import quizroutes from "./routes/quizzes.js";
import questionroutes from "./routes/questions.js";
import resultroutes from "./routes/results.js";
import leaderboardroutes from "./routes/leaderboard.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/users', usersRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/quizzes', quizroutes);
app.use('/api/question', questionroutes);
app.use('/api/result', resultroutes);
app.use('/api/leaderboard', leaderboardroutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    // Test the database connection on server start
    await testDbConnection();  // Calling the test function to check DB connection
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    // Log database connection error if connection fails
    console.error('Error connecting to the database:', err);
  }
});
