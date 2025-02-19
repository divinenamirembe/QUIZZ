// src/controllers/participantController.js

import { knexInstance } from '../db.js'; // Make sure knexInstance is imported from your db configuration


export const joinQuiz = async (req, res) => {
  const { userId, name, email, quizId } = req.body;

  if (!userId || !name || !email || !quizId) {
    return res.status(400).json({ error: 'UserId, Name, Email, and QuizId are required' });
  }

  try {
    console.log("🔵 Received Join Request:", { userId, name, email, quizId });

    const existingParticipant = await knexInstance('participants')
      .where({ id: userId, quizid: quizId })
      .first();

    if (existingParticipant) {
      return res.status(400).json({ error: 'User already joined this quiz' });
    }

    // ✅ FIX: Add `email` to the INSERT statement
    const newParticipant = await knexInstance('participants')
      .insert({
        id: userId,
        name,
        email,  // ✅ Ensure `email` is inserted into the table
        quizid: quizId,
      })
      .returning('*');

    res.status(201).json({ message: 'Joined successfully', participant: newParticipant });
  } catch (error) {
    console.error("❌ Error joining quiz:", error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};



export const getParticipantsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({ message: 'Quiz ID is required' });
    }

    // ✅ Check if the quiz exists
    const quiz = await knexInstance('quizzes')
      .where({ id: quizId })
      .first();

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // ✅ Fetch participants for this quiz
    const participants = await knexInstance('participants')
      .where({ quizid: quizId })
      .select('name', 'email');

    res.status(200).json({
      quizTitle: quiz.title,
      participants,
    });
  } catch (error) {
    console.error('Error fetching quiz participants:', error);
    res.status(500).json({ error: 'Failed to fetch quiz participants' });
  }
};


export const getQuizParticipants = async (req, res) => {
  try {
    const { quizId } = req.params; // Get the quiz ID from URL params

    if (!quizId) {
      return res.status(400).json({ message: 'Quiz ID is required' });
    }

    // ✅ Fetch the quiz details
    const quiz = await knexInstance('quizzes')
      .where({ id: quizId })
      .first();

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // ✅ Fetch participants for this quiz
    const participants = await knexInstance('participants')
      .where({ quizid: quizId }) // Ensure the column name matches your database
      .select('name', 'email');

    res.status(200).json({
      quizTitle: quiz.title,
      participants,
    });
  } catch (error) {
    console.error('Error fetching quiz participants:', error);
    res.status(500).json({ error: 'Failed to fetch quiz participants' });
  }
};

export const checkIfUserJoined = async (req, res) => {
  const { userId, quizId } = req.body;

  if (!userId || !quizId) {
    return res.status(400).json({ error: 'Missing userId or quizId' });
  }

  try {
    const participant = await knexInstance('participants')
      .where({ user_id: userId, quiz_id: quizId })
      .first();

    if (participant) {
      return res.json({ joined: true });
    } else {
      return res.json({ joined: false });
    }
  } catch (error) {
    console.error('❌ Error checking participant:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

