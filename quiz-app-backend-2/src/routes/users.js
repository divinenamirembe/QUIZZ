import express from 'express';
import {registerUser, loginUser} from '../userAuthentication/authController.js';
import { authenticateToken } from '../userAuthentication/authMiddleware.js';
import { createQuiz, getQuizzesByCreator} from '../userAuthentication/authController.js'


const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/quizzes', authenticateToken, createQuiz);
router.get('/creator/:creatorId', getQuizzesByCreator);
export default router;
