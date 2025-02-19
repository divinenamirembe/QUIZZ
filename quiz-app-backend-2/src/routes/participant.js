// src/routes/participantRoutes.js
import express from 'express';
import { joinQuiz, getQuizParticipants, getParticipantsByQuiz, checkIfUserJoined } from '../controllers/participantController.js';

const router = express.Router();

// Route for joining a quiz
router.post('/join', joinQuiz);



router.post('/check', checkIfUserJoined);

// Route for getting participants of a specific quiz
router.get('/:quizId/participants', getQuizParticipants);

router.get('/:quizId', getParticipantsByQuiz);

export default router;
