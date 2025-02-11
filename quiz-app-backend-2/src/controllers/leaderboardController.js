import { knexInstance } from '../db.js';  // Import knexInstance from db.js
import { v4 as uuidValidate } from 'uuid';  // Import uuidValidate to validate quiz_id

export const getLeaderboard = async (req, res) => {
  let { quiz_id } = req.query;  // Get quiz_id from query params
  console.log("Quiz ID:", quiz_id);  // Debugging: Log the quiz_id

  try {
    // Check if quiz_id is provided
    if (!quiz_id) {
      return res.status(400).json({ error: 'quiz_id is required' });
    }

    // Trim any leading or trailing whitespace from the quiz_id
    quiz_id = quiz_id.trim();

    // Validate if quiz_id is a valid UUID
    if (!uuidValidate(quiz_id)) {
      return res.status(400).json({ error: 'Invalid quiz_id format' });
    }

    // Fetch leaderboard data using knex
    const leaderboard = await knexInstance('leaderboard')
      .whereRaw('leaderboard.quiz_id::uuid = ?', [quiz_id])  // Cast quiz_id to uuid
      .join('users', 'leaderboard.user_id', '=', 'users.id')
      .join('quizzes', 'leaderboard.quiz_id', '=', 'quizzes.id')
      .select('leaderboard.*', 'users.username as user_name', 'quizzes.title as quiz_name');

    if (leaderboard.length === 0) {
      return res.status(404).json({ error: 'No leaderboard entries found for the provided quiz_id' });
    }

    // Return the leaderboard as a response
    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    // Return error message
    res.status(500).json({ error: error.message || 'Error fetching leaderboard' });
  }
};

// Create leaderboard entry
export const createLeaderboardEntry = async (req, res) => {
  const { user_id, quiz_id, score } = req.body;

  try {
    // Check if all necessary fields are provided
    if (!user_id || !quiz_id || score === undefined) {
      return res.status(400).json({ error: 'user_id, quiz_id, and score are required' });
    }

    // Insert the new leaderboard entry into the database
    const [newLeaderboardEntry] = await knexInstance('leaderboard')
      .insert({ user_id, quiz_id, score })
      .returning('*');  // Returning the newly inserted row

    res.status(201).json(newLeaderboardEntry);  // Respond with the new leaderboard entry
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error creating leaderboard entry' });
  }
};

// Delete leaderboard entry
export const deleteLeaderboardEntry = async (req, res) => {
  const { id } = req.params;
  try {
    const [deletedLeaderboardEntry] = await knexInstance('leaderboard')
      .where({ id })
      .del()
      .returning('*');  // Returning the deleted row

    if (!deletedLeaderboardEntry) {
      throw new Error(`Leaderboard entry with id ${id} not found`);
    }

    res.json(deletedLeaderboardEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error deleting leaderboard entry' });
  }
};


// Update leaderboard entry
export const updateLeaderboardEntry = async (req, res) => {
  const { id } = req.params;  // Get leaderboard entry ID from URL params
  const { user_id, quiz_id, score } = req.body;  // Get new data from the request body

  try {
    // Check if the leaderboard entry exists
    const existingEntry = await knexInstance('leaderboard').where({ id }).first();
    
    if (!existingEntry) {
      return res.status(404).json({ error: `Leaderboard entry with id ${id} not found` });
    }

    // Update leaderboard entry with new data
    const [updatedEntry] = await knexInstance('leaderboard')
      .where({ id })
      .update({ user_id, quiz_id, score })
      .returning('*');  // Return the updated row

    res.json(updatedEntry);  // Respond with the updated leaderboard entry
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error updating leaderboard entry' });
  }
};
