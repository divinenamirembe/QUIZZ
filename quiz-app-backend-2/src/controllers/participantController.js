// src/controllers/participantController.js

import { knexInstance } from '../db.js'; // Make sure knexInstance is imported from your db configuration

export const joinQuiz = async (req, res) => {
  const { userId, quizid } = req.body;  // Ensure only userId and quizid are in the request body

  if (!userId || !quizid) {
    return res.status(400).json({ message: 'UserId and QuizId are required' });
  }

  try {
    console.log(`Looking for quiz with id: ${quizid}`);  // Log quizId for debugging

    // Check if the quiz exists
    const quiz = await knexInstance('quizzes').where({ id: quizid }).first();
    if (!quiz) {
      console.error(`Quiz not found for quizId: ${quizid}`);  // Log error to terminal
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if the user exists and retrieve the user's name and email
    const user = await knexInstance('users').where({ id: userId }).first();
    if (!user) {
      console.error(`User not found for userId: ${userId}`);  // Log error to terminal
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email } = user;  // Extract the name and email from the user record

    // Check if the user has already joined the quiz
    const existingParticipation = await knexInstance('participants')
      .where({ id: userId, quizid })  // Ensure 'quizid' is used correctly here
      .first();

    if (existingParticipation) {
      console.error(`User ${userId} already joined the quiz ${quizid}`);  // Log error to terminal
      return res.status(400).json({ message: 'User already joined the quiz' });
    }

    // Register the participant using the user's name and email
    const [participant] = await knexInstance('participants').insert({
      id: userId,  // Use userId as 'id' in participants
      quizid,  // Ensure quizId is passed correctly
      name,  // Use the user's name
      email,  // Use the user's email
    }).returning('*');

    res.status(201).json({ message: 'Successfully joined the quiz', participant });
  } catch (error) {
    console.error('Error in joinQuiz:', error);  // Log error to terminal
    res.status(500).json({ error: error.message });
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



export const getQuizParticipants = async (req, res) => {
  const { quizId } = req.params;

  try {
    console.log(`Received request to get participants for quiz ${quizId}`);

    const participants = await knexInstance('participants')
      .where({ quizid: quizId })  // Changed quizId to quizid
      .join('users', 'participants.id', '=', 'users.id')  // Updated join logic
      .select('users.name', 'participants.score', 'participants.attemptdate');

    res.status(200).json({ participants });
  } catch (error) {
    console.error('Error in getQuizParticipants:', error);  // Log the error to the terminal
    res.status(500).json({ error: error.message });
  }
};
