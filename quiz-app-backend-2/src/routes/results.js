import express from 'express';
import { getAllResults, createResult, getResultsForQuiz, deleteResult, getUserResults, submitQuiz } from '../controllers/resultController.js';

const router = express.Router();

router.get('/user/:userId', getUserResults);
router.get('/', getAllResults);

// Route for submitting a quiz score
router.post('/submit', createResult);
// router.post('/', createResult);
router.get('/:quizId', getResultsForQuiz);
//router.put('/:id', updateResult);
router.delete('/:id', deleteResult);

export default router;
