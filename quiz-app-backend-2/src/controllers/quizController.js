import { knexInstance } from '../db.js';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

// Get all quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await knexInstance('quizzes')
      .select('*')
      .leftJoin('questions', 'quizzes.id', 'questions.quiz_id')
      .leftJoin('leaderboard', 'quizzes.id', 'leaderboard.quiz_id');

    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Error fetching quizzes' });
  }
};

// Get a quiz by ID

export const getQuizById = async (req, res) => {
  const { id } = req.params;

  if (!uuidValidate(id)) {
    return res.status(400).json({ error: 'Invalid quiz ID' });
  }

  try {
    console.log(`Fetching quiz with ID: ${id}`);

    const quiz = await knexInstance('quizzes')
      .select('id', 'title', 'description', 'timer')
      .where({ id })
      .first();

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const questions = await knexInstance('questions')
      .select('id', 'question', 'image_url', 'options', 'correct_answer')
      .where('quiz_id', id)
      .orderBy('created_at', 'asc');

    // ✅ Convert relative image paths to absolute URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`; // e.g., http://localhost:5000
    quiz.questions = questions.map((q, index) => ({
      number: index + 1,
      ...q,
      image_url: q.image_url ? `${baseUrl}${q.image_url}` : null, // Convert image path
    }));

    console.log("🟢 Quiz Fetched Successfully:", quiz);
    res.json(quiz);
  } catch (error) {
    console.error('❌ Database Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a quiz by ID
export const updateQuiz = async (req, res) => {
  const { id } = req.params;
  const { title, description, timer, category } = req.body; // ✅ Ensure fields match frontend

  // Validate UUID format
  if (!uuidValidate(id)) {
    return res.status(400).json({ error: 'Invalid quiz ID' });
  }

  // Ensure at least one field is provided
  if (!title && !description && !timer && !category) {
    return res.status(400).json({
      error: 'At least one field (title, description, timer, category) must be provided for update.',
    });
  }

  try {
    // Check if the quiz exists before updating
    const existingQuiz = await knexInstance('quizzes').where({ id }).first();
    if (!existingQuiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Update only provided fields
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (timer) updateData.timer = timer;
    if (category) updateData.category = category;

    // Perform update
    await knexInstance('quizzes').where({ id }).update(updateData);

    // Fetch updated quiz
    const updatedQuiz = await knexInstance('quizzes').where({ id }).first();

    res.json(updatedQuiz);
  } catch (error) {
    console.error('❌ Error updating quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// Delete a quiz by ID
export const deleteQuiz = async (req, res) => {
  const { id } = req.params;

  // Validate UUID
  if (!uuidValidate(id)) {
    return res.status(400).json({ error: 'Invalid quiz ID' });
  }

  try {
    const deletedQuiz = await knexInstance('quizzes')
      .where({ id })
      .del()
      .returning('*');

    if (deletedQuiz.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(deletedQuiz[0]);
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Error deleting quiz' });
  }
};

// Fetch unique quiz categories
export const getQuizCategories = async (req, res) => {
  console.log("🔹 getQuizCategories called");

  // Debug: Log unexpected parameters
  console.log("req.params:", req.params); // Should be empty
  console.log("req.query:", req.query);   // Should also be empty

  try {
    const categories = await knexInstance('quizzes')
      .distinct('category')
      .whereNotNull('category')
      .pluck('category');

    console.log("✅ Categories fetched:", categories);

    if (!categories || categories.length === 0) {
      return res.status(200).json({ categories: [] });
    }

    res.json({ categories });
  } catch (error) {
    console.error('❌ Error in getQuizCategories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch quizzes by category
export const getQuizzesByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const quizzes = await knexInstance('quizzes')
      .select('*')
      .where('category', category);

    if (quizzes.length === 0) {
      return res.status(404).json({ message: 'No quizzes found in this category' });
    }

    res.json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes by category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Fetch categories by quiz IDs
export const getCategoriesByQuizIds = async (req, res) => {
  try {
    const quizIds = req.query.quizIds;

    if (!quizIds || quizIds.length === 0) {
      return res.status(400).json({ message: 'Quiz IDs are required' });
    }

    const categories = await knexInstance('quizzes')
      .select('id', 'category')
      .whereIn('id', quizIds)
      .whereNotNull('category');

    if (!categories.length) {
      return res.status(404).json({ message: 'No categories found for these quiz IDs' });
    }

    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories by quiz IDs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};