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

export const submitQuiz = async (req, res) => {
  const { userId, quizid, score } = req.body;

  if (!userId || !quizid || score === undefined) {
    return res.status(400).json({ message: 'UserId, QuizId, and Score are required' });
  }

  try {
    console.log(`Received request to submit score for user ${userId}, quiz ${quizid}`);

    // Check if the quiz exists
    const quiz = await knexInstance('quizzes').where({ id: quizid }).first();
    if (!quiz) {
      console.error(`Quiz not found for quizId: ${quizid}`);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if the participant is already registered for the quiz
    const participant = await knexInstance('participants')
      .where({ id: userId, quizid: quizid })  // Use 'id' for userId and 'quizid' for quizid
      .first();

    if (!participant) {
      console.error(`User ${userId} is not registered for quiz ${quizid}`);
      return res.status(400).json({ message: 'User not registered for this quiz' });
    }

    // Update the participant with the score
    const updatedParticipant = await knexInstance('participants')
      .where({ id: userId, quizid: quizid })
      .update({ score })  // Update the score column
      .returning('*');  // Return the updated participant

    res.status(200).json({ message: 'Score submitted successfully', updatedParticipant });
  } catch (error) {
    console.error('Error in submitQuiz:', error);
    res.status(500).json({ error: error.message });
  }
};


// Create a new result
export const createResult = async (req, res) => { 
  const { user_id, quiz_id, correct_answers, wrong_answers, unanswered, total_questions, time_taken } = req.body;

  // ✅ Ensure all required fields are present
  if (!user_id || !quiz_id || correct_answers === undefined || wrong_answers === undefined || unanswered === undefined || total_questions === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log("🟢 Fetching user details for:", user_id);

    // ✅ Fetch user details from `users` table
    const user = await knexInstance('users').where({ id: user_id }).first();

    if (!user) {
      console.warn("⚠️ User not found in database:", user_id);
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, email } = user; // Extract user details

    // ✅ Calculate score as a percentage
    const score = total_questions > 0 ? ((correct_answers / total_questions) * 100).toFixed(2) : 0;

    console.log("🟢 Inserting result into database...");
    console.log({
      user_id,
      quiz_id,
      correct_answers,
      wrong_answers,
      unanswered,
      total_questions,
      score,
      time_taken,
      name,
      email,
    });

    // ✅ Insert result into `results` table
    const [newResult] = await knexInstance('results')
      .insert({
        user_id,
        quiz_id,
        correct_answers,
        wrong_answers,
        unanswered,       // ✅ Ensure unanswered is stored
        total_questions,
        score,            // ✅ Now calculated as percentage
        time_taken,
        name,  
        email,
        created_at: new Date(),  // ✅ Store timestamp
      })
      .returning('*');

    console.log("✅ Successfully stored result:", newResult);

    res.status(201).json(newResult);
  } catch (error) {
    console.error('❌ Error creating result:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a result by ID
export const getUserResults = async (req, res) => {
  const { userId } = req.params;

  try {
    const results = await knexInstance('results')
      .join('quizzes', 'results.quiz_id', '=', 'quizzes.id') // ✅ Join with quizzes table
      .select(
        'results.*',
        'quizzes.title as quiz_title' // ✅ Fetch quiz title
      )
      .where('results.user_id', userId);

    if (results.length === 0) {
      return res.json([]); // ✅ Return empty array instead of 404
    }

    res.json(results);
  } catch (error) {
    console.error("❌ Error fetching user results:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



export const getResultsForQuiz = async (req, res) => {
  const { quizId } = req.params;

  console.log(`🔍 Fetching results for quizId: ${quizId}`); // ✅ Log the quizId

  try {
    // Check if the quiz exists
    const quiz = await knexInstance('quizzes').where({ id: quizId }).first();
    if (!quiz) {
      console.warn(`⚠️ Quiz not found for quizId: ${quizId}`);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Fetch results for this quiz
    const results = await knexInstance('results')
      .where({ quiz_id: quizId })
      .select('*');

    if (results.length === 0) {
      console.log(`ℹ️ No results found for quizId: ${quizId}`);
      return res.status(200).json({ quizTitle: quiz.title, results: [] }); // ✅ Return empty array
    }

    console.log(`✅ Found ${results.length} results for quizId: ${quizId}`);
    res.status(200).json({ quizTitle: quiz.title, results });
  } catch (error) {
    console.error('❌ Error fetching quiz results:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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