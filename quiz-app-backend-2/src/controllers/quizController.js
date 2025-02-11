import {knexInstance} from '../db.js';

// Get all quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await knexInstance('quizzes')
      .select('*')
      .leftJoin('questions', 'quizzes.id', 'questions.quiz_id')
      .leftJoin('leaderboard', 'quizzes.id', 'leaderboard.quiz_id');

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching quizzes' });
  }
};

// Get a quiz by ID
export const getQuizById = async (req, res) => {
  const { id } = req.params;
  try {
    const quiz = await knexInstance('quizzes')
      .select('quizzes.*', knexInstance.raw('array_agg(questions.*) as questions'), knexInstance.raw('array_agg(leaderboard.*) as leaderboard'))
      .leftJoin('questions', 'quizzes.id', 'questions.quiz_id')
      .leftJoin('leaderboard', 'quizzes.id', 'leaderboard.quiz_id')
      .where('quizzes.id', id)
      .groupBy('quizzes.id')
      .first();

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Error fetching quiz' });
  }
};

// Update a quiz by ID
export const updateQuiz = async (req, res) => {
  const { id } = req.params;
  const { title, description, settings, status } = req.body;

  // Check if required fields are provided
  if (!title || !description || !status) {
    return res.status(400).json({
      error: 'Missing required fields: title, description, or status.'
    });
  }

  try {
    // Perform the update
    const updatedQuiz = await knexInstance('quizzes')
      .where({ id })
      .update({ title, description, settings, status })
      .returning('*');

    // If no quiz was updated (id not found)
    if (updatedQuiz.length === 0) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Return the updated quiz
    res.json(updatedQuiz[0]);
  } catch (error) {
    console.error('Error updating quiz:', error); // Log the error to the terminal
    res.status(500).json({ error: 'Error updating quiz' });
  }
};



// Delete a quiz by ID
export const deleteQuiz = async (req, res) => {
  const { id } = req.params;
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
    res.status(500).json({ error: 'Error deleting quiz' });
  }
};
