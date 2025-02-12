import express from 'express';
import dotenv from 'dotenv';
import  { knexInstance } from './db.js'; // Import knex instance
import usersRoutes from './routes/users.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/users', usersRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    // Attempt to connect to the database by querying a simple statement to test the connection
    await knexInstance.raw('SELECT 1+1 AS result');
    console.log('Database connected successfully'); // Log success
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    // Log database connection error
    console.error('Error connecting to the database:', err);
  }
});
