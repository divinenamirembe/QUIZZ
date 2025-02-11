// src/routes/participantRoutes.js
import express from 'express';
import { joinQuiz, submitQuiz, getQuizParticipants } from '../controllers/participantController.js';

const router = express.Router();

// Route for joining a quiz
router.post('/join', joinQuiz);

// Route for submitting a quiz score
router.post('/submit', submitQuiz);

// Route for getting participants of a specific quiz
router.get('/:quizId/participants', getQuizParticipants);

export default router;
