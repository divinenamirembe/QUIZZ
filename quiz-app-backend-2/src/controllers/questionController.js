import { knexInstance } from '../db.js';

// Get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await knexInstance('questions').select('*');
    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching all questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
};

// Get a question by ID
export const getQuestionById = async (req, res) => {
  const { id } = req.params;
  try {
    const question = await knexInstance('questions').where({ id }).first();
    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }
    res.status(200).json(question);
  } catch (error) {
    console.error(`Error fetching question with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch the question.' });
  }
};

// Create a new question
export const createQuestion = async (req, res) => {
  const { text, quiz_id } = req.body;

  try {
    // Validate input
    if (!text || !quiz_id) {
      return res.status(400).json({ error: 'Question text and quiz ID are required.' });
    }

    // Ensure that quiz_id is a valid UUID
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(quiz_id)) {
      return res.status(400).json({ error: 'Invalid quiz ID format. Must be a UUID.' });
    }

    // Insert question and retrieve the inserted row directly
    const [newQuestion] = await knexInstance('questions')
      .insert({ text, quiz_id })
      .returning(['id', 'text', 'quiz_id']); // Return inserted fields directly

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error creating a new question:', error.message || error);
    res.status(500).json({ error: 'Failed to create the question.' });
  }
};


// Update a question by ID
export const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { text, quiz_id } = req.body;

  try {
    if (!text && !quiz_id) {
      return res.status(400).json({ error: 'At least one field (text or quiz_id) is required for update.' });
    }

    const updated = await knexInstance('questions')
      .where({ id })
      .update({ text, quiz_id }, ['id', 'text', 'quiz_id']);

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    res.status(200).json(updated[0]);
  } catch (error) {
    console.error(`Error updating question with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to update the question.' });
  }
};

// Delete a question by ID
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRows = await knexInstance('questions').where({ id }).del();

    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    res.status(200).json({ message: 'Question deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting question with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete the question.' });
  }
};
