const test = require("../models/test");
const Submission = require("../models/subm");
const Quiz = require('../models/test');

const formatQuestions = (questions) => {
    return questions.map((q, index) => ({
        questionText: q.text,
        questionId: Date.now() + index,
        options: {
            A: q.options[0],
            B: q.options[1],
            C: q.options[2],
            D: q.options[3]
        },
        correctAnswer: q.correctAnswer,
        points: q.points || 1,
    }));
};

exports.addquestion = async (req, res) => {
    const { title, questions } = req.body;

    try {
        let quiz = await Quiz.findOne({ title });

        if (!quiz) {
            quiz = new Quiz({
                title,
                questions: formatQuestions(questions)
            });
        } else {
            quiz.questions = [...quiz.questions, ...formatQuestions(questions)];
        }

        await quiz.save();

        return res.status(201).json({
            success: true,
            msg: "Questions added successfully",
            quiz
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            msg: 'Failed to save quiz',
            error: error.message
        });
    }
};


exports.viewTitle = async (req, res) => {
    try {
        const quizzes = await test.find().select('title');
        const titles = quizzes.map(quiz => quiz.title);
        return res.status(200).json({ success: true, titles });
    } catch (error) {
        return res.status(500).json({ success: false, msg: 'Server error' });
    }
};


exports.viewAssessment = async (req, res) => {
    const { title } = req.params;
    try {
        const quiz = await test.findOne({ title });
        if (!quiz) {
            return res.status(404).json({ success: false, msg: "Quiz not found" });
        }
        
        return res.status(200).json({ success: true, quiz });
    } catch (err) {
        return res.status(500).json({ success: false, msg: "Server error", error: err.message });
    }
};


exports.ViewResult = async (req, res) => {
    const studentId = req.adm;
    const { title } = req.params;

    try {
        const quiz = await test.findOne({ title });
        if (!quiz) {
            return res.status(404).json({ success: false, msg: 'Quiz not found' });
        }

        const ans = await Submission.findOne({ quizTitle: title, studentId: studentId.id });
        if (!ans) {
            return res.status(404).json({ success: false, msg: 'Submission not found for this student' });
        }

        let correctCount = 0;
        let total = quiz.questions.length;
        let studentScore = 0;
        let totalPossibleScore = 0;


        const resultDetails = quiz.questions.map(question => {
            const stuans = ans.answers[question.questionId];
            const isCorrect = stuans === question.correctAnswer;
            const questionPoints = question.points || 1;
            
            totalPossibleScore += questionPoints;
            
            if (isCorrect) {
                correctCount++;
                studentScore += questionPoints;
            }

            return {
                questionId: question.questionId,
                questionText: question.questionText,
                correctAnswer: question.correctAnswer,
                studentAnswer: stuans,
                isCorrect: isCorrect
            };
        });

        const result = {
            score: studentScore, 
            correctAnswers: correctCount,
            totalQuestions: total,
            totalPossibleScore: totalPossibleScore, 
            resultDetails
        };
        
        return res.status(200).json({
            success: true,
            msg: 'Quiz result fetched successfully',
            result
        });

    } catch (error) {
        return res.status(500).json({ success: false, msg: 'Failed to fetch result', error: error.message });
    }
};


exports.AssessmentSubmission = async (req, res) => {
    const student = req.adm;
    const { quizTitle, answers } = req.body;

    try {
        const existingSubmission = await Submission.findOne({
            studentId: student.id,
            quizTitle: quizTitle,
        });

        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                msg: 'You have already submitted this quiz.',
            });
        }

        const newSubmission = new Submission({
            studentName: student.name,
            quizTitle,
            answers,
            studentId: student.id,
        });

        await newSubmission.save();

        return res.status(200).json({ success: true, msg: 'Quiz submission successful' });

    } catch (error) {
        return res.status(500).json({ success: false, msg: 'Server error', error: error.message });
    }
};