import { knexInstance } from '../db.js';

// Get all results
export const getAllResults = async (req, res) => {
  try {
    const results = await knexInstance('results').select('*');
    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Error fetching results' });
  }
};

// Create a new result
export const createResult = async (req, res) => {
  const { user_id, quiz_id, score, answers, time_taken } = req.body;

  // Ensure the answers are a proper JSON array (if it's not already)
  const formattedAnswers = Array.isArray(answers) ? answers : JSON.parse(answers);

  try {
    const [newResult] = await knexInstance('results')
      .insert({
        user_id,
        quiz_id,
        score,
        answers: JSON.stringify(formattedAnswers),  // Ensure answers is valid JSON format
        time_taken,
      })
      .returning('*');
    res.status(201).json(newResult);
  } catch (error) {
    console.error('Error creating result:', error);
    res.status(500).json({ error: 'Error creating result' });
  }
};

// Get a result by ID
export const getResultById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await knexInstance('results').where({ id }).first();

    if (!result) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching result by ID:', error);
    res.status(500).json({ error: 'Error fetching result' });
  }
};

// Update a result by ID
export const updateResult = async (req, res) => {
  const { id } = req.params;
  const { score, answers, time_taken } = req.body;
  try {
    const [updatedResult] = await knexInstance('results')
      .where({ id })
      .update({ score, answers, time_taken })
      .returning('*');

    if (!updatedResult) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.json(updatedResult);
  } catch (error) {
    console.error('Error updating result:', error);
    res.status(500).json({ error: 'Error updating result' });
  }
};

// Delete a result by ID
export const deleteResult = async (req, res) => {
  const { id } = req.params;
  try {
    const [deletedResult] = await knexInstance('results')
      .where({ id })
      .del()
      .returning('*');

    if (!deletedResult) {
      return res.status(404).json({ error: 'Result not found' });
    }
    res.json(deletedResult);
  } catch (error) {
    console.error('Error deleting result:', error);
    res.status(500).json({ error: 'Error deleting result' });
  }
};