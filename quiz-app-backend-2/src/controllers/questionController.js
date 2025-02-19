import { knexInstance } from '../db.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Set up multer for file uploads (storing files on disk)
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

// Get all questions
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await knexInstance('questions')
      .select('id', 'question', 'quiz_id', 'options', 'correct_answer')
      .select(knexInstance.raw("encode(image_data, 'base64') as image")); // Convert BYTEA to base64

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching all questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
};

// Get a question by ID
export const getQuestionById = async (req, res) => {
  const { id } = req.params;
  try {
    const question = await knexInstance('questions')
      .select('id', 'question', 'options', 'correct_answer', 'image_url') // ✅ Include image_url
      .where({ id })
      .first();

    if (!question) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    res.status(200).json(question);
  } catch (error) {
    console.error(`Error fetching question with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch the question.' });
  }
};


export const createQuestion = async (req, res) => {
  try {
    console.log('🔹 Received Request Body:', req.body);
    console.log('🔹 Received File:', req.file);

    const { quiz_id, question, options, correct_answer, number } = req.body; // ✅ Include number

    console.log(`🔎 Checking if quiz_id exists: ${quiz_id}`);
    const quiz = await knexInstance('quizzes').where('id', quiz_id).first();
    if (!quiz) {
      console.error('❌ Quiz not found!');
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    if (!question || !options || !correct_answer || !number) {
      console.error('❌ Missing required fields:', { question, options, correct_answer, number });
      return res.status(400).json({ error: 'Each question must have text, options, a correct answer, and a number.' });
    }

    // Convert `number` to integer
    const questionNumber = parseInt(number, 10);
    if (isNaN(questionNumber)) {
      console.error('❌ Invalid number:', number);
      return res.status(400).json({ error: 'Number must be a valid integer.' });
    }

    // Handle file upload
    let imageUrl = null;
    if (req.file) {
      console.log('🔹 File details:', req.file);
      imageUrl = `/uploads/${req.file.filename}`;
      console.log('🔹 File uploaded successfully. Image URL:', imageUrl);
    } else {
      console.log('🔹 No file uploaded.');
    }

    // ✅ Ensure options is a properly formatted JavaScript object
    let cleanedOptions;
    try {
      console.log('🔎 Raw options received:', options);
      cleanedOptions = typeof options === 'string' ? JSON.parse(options) : options;
      console.log('✅ Parsed options as JavaScript object:', cleanedOptions);
    } catch (error) {
      console.error('❌ Invalid JSON format for options:', options);
      return res.status(400).json({ error: 'Invalid JSON format in options field.' });
    }

    // ✅ Ensure correct_answer is a valid JSON value
    const cleanedCorrectAnswer = JSON.stringify(correct_answer);

    console.log('📌 Inserting question:', {
      question,
      quiz_id,
      number: questionNumber, // ✅ Ensure number is submitted
      options: JSON.stringify(cleanedOptions),
      correct_answer: cleanedCorrectAnswer,
      image_url: imageUrl
    });

    const [newQuestion] = await knexInstance('questions')
      .insert({
        question,
        quiz_id,
        number: questionNumber, // ✅ Submit number to database
        options: JSON.stringify(cleanedOptions),
        correct_answer: cleanedCorrectAnswer,
        image_url: imageUrl
      })
      .returning(['id', 'question', 'quiz_id', 'number', 'options', 'correct_answer', 'image_url']);

    console.log('✅ Question successfully inserted:', newQuestion);
    return res.status(201).json({ message: 'Question added successfully!', newQuestion });
  } catch (error) {
    console.error('❌ Error creating question:', error.message || error);
    return res.status(500).json({ error: 'Failed to create the question.' });
  }
};

// Update a question by ID
export const updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { question, quiz_id } = req.body;

  try {
    if (!question && !quiz_id) {
      return res.status(400).json({ error: 'At least one field (text or quiz_id) is required for update.' });
    }

    const updated = await knexInstance('questions')
      .where({ id })
      .update({ question, quiz_id }, ['id', 'question', 'quiz_id']);

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    res.status(200).json(updated[0]);
  } catch (error) {
    console.error(`Error updating question with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to update the question.' });
  }
};

// Delete a question by ID
export const deleteQuestion = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRows = await knexInstance('questions').where({ id }).del();

    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Question not found.' });
    }

    res.status(200).json({ message: 'Question deleted successfully.' });
  } catch (error) {
    console.error(`Error deleting question with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to delete the question.' });
  }
};

export const getQuestionsByQuizId = async (req, res) => {
  const { quizId } = req.params;

  try {
    const questions = await knexInstance('questions')
      .select('id', 'question', 'options', 'correct_answer', 'image_url', 'quiz_id')
      .where({ quiz_id: quizId });

    if (questions.length === 0) {
      return res.status(200).json([]); // ✅ Return empty array instead of 404
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error(`❌ Error fetching questions for quiz ${quizId}:`, error);
    res.status(500).json({ error: 'Failed to fetch questions.' });
  }
};
