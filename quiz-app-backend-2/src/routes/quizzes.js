import express from 'express';
import { getAllQuizzes, getQuizById, updateQuiz, deleteQuiz } from '../controllers/quizController.js';

const router = express.Router();

router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);
router.put('/:id', updateQuiz);
router.delete('/:id', deleteQuiz);

export default router;
