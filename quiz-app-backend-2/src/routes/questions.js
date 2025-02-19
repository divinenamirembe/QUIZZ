import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { createQuestion, getAllQuestions, getQuestionById, updateQuestion, deleteQuestion, getQuestionsByQuizId } from '../controllers/questionController.js';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // ✅ Create directory if it doesn't exist
}

// ✅ Configure Multer for Single File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

// ✅ Use `upload.single('image')` to process **one image**
router.get('/', getAllQuestions);
router.post('/', upload.single('image'), createQuestion); // ✅ FIXED
router.get('/:quizId', getQuestionsByQuizId);
router.get('/:id', getQuestionById);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;
