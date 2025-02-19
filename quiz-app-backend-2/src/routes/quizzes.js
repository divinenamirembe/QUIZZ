import express from 'express';
import {
  getAllQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizCategories,
  getCategoriesByQuizIds,
  getQuizzesByCategory,
} from '../controllers/quizController.js';

const router = express.Router();

router.get('/categories-by-id', getCategoriesByQuizIds);
router.get('/category/:category', getQuizzesByCategory);
router.get('/categories', getQuizCategories);
router.get('/:id', getQuizById);
router.get('/', getAllQuizzes);
router.put('/:id', updateQuiz);
router.delete('/:id', deleteQuiz);


export default router;