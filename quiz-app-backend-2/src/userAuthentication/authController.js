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
    console.log("🔍 Checking if user exists for email:", email);
    const user = await knexInstance('users').where({ email }).first();

    if (!user) {
      console.warn("🔴 User not found for email:", email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log("🟢 User found:", user);

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.warn("🔴 Incorrect password for user:", user.id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ Include `email` in the JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role }, 
      SECRET_KEY,
      { expiresIn: '12h' }
    );

    console.log("🟢 Login Successful:", { id: user.id, name: user.name, email: user.email, token });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,  // ✅ Make sure this is included
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Create Quiz and Automatically Update User Role
export const createQuiz = async (req, res) => {
  const { title, description, timer, category } = req.body;
  const creatorId = req.user.id; // Ensure this is the correct user ID

  console.log('Request body:', req.body);
  console.log('Creator ID:', creatorId);

  try {
    // Check if user exists
    const user = await knexInstance('users').where({ id: creatorId }).first();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Insert quiz with correct creatorId, timer, and category
    const [quiz] = await knexInstance('quizzes')
      .insert({
        title,
        description,
        timer,      // Ensure this column exists in the DB
        category,   // Ensure this column exists in the DB
        creatorId,  // Assign creatorId correctly
      })
      .returning('*');

    // If user role isn't 'CREATOR', update it
    if (user.role !== 'CREATOR') {
      await knexInstance('users').where({ id: creatorId }).update({ role: 'CREATOR' });
    }

    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Fetch quizzes created by a specific user
export const getQuizzesByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;

    if (!creatorId) {
      return res.status(400).json({ error: 'Missing creatorId' });
    }

    // ✅ Fetch quizzes ordered by most recent
    const quizzes = await knexInstance('quizzes')
      .where({ creatorId })
      .orderBy('created_at', 'desc') // ✅ Order by newest first
      .select('*');

    // ✅ Fetch questions for each quiz
    const quizzesWithQuestions = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions = await knexInstance('questions')
          .where({ quiz_id: quiz.id })
          .select('*');
        return { ...quiz, questions };
      })
    );

    res.status(200).json(quizzesWithQuestions);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};
