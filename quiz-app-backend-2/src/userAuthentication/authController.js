import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { knexInstance } from '../db.js'; // Import knex instance

const SECRET_KEY = process.env.JWT_SECRET || 'your_jwt_secret';

// User registration
export const registerUser = async (req, res) => {
  const { email, password, username, name } = req.body;

  // Check if all required fields are provided
  if (!email || !password || !username || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate email format using regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Check if the email is already registered
    const existingUser = await knexInstance('users').where({ email }).first();

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Set default role to 'USER' if not already provided
    const role = 'user'; // Default role assignment

    // Create the new user in the database
    const [user] = await knexInstance('users').insert({
      email,
      password: hashedPassword,
      username,
      name,
      role,  // Ensure role is assigned as 'USER'
    }).returning('*');

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Error during user registration:', error); // Logging error to terminal
    res.status(500).json({ error: error.message });
  }
};

// User login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await knexInstance('users').where({ email }).first();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create Quiz and Automatically Update User Role
export const createQuiz = async (req, res) => {
  const { title, description, creatorId } = req.body;
  console.log('Request body:', req.body);

  try {
    const [quiz] = await knexInstance('quizzes').insert({
      title,
      description,
      creatorId, // This should now match your database schema
    }).returning('*');

    const user = await knexInstance('users').where({ id: creatorId }).first();
    if (user && user.role !== 'CREATOR') {
      await knexInstance('users').where({ id: creatorId }).update({
        role: 'CREATOR',
      });
    }

    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: error.message });
  }
};
