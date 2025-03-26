const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // ✅ Added
const StudentModel = require('./models/Student');
require('dotenv').config();

const app = express();
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || "supersecret"; // ✅ For demo

console.log("Mongo URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Atlas Connected Successfully"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err.message);
        process.exit(1);
    });

/* ---------------------- JWT AUTHENTICATION ---------------------- */

// ✅ Login route — use hardcoded user or student for demo
app.post('/login', (req, res) => {
    const { username } = req.body;

    // Dummy check
    if (username !== "admin") {
        return res.status(403).json({ message: "Unauthorized" });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// ✅ Middleware to verify token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// ✅ Protected route example
app.get('/student-protected', authenticateToken, async (req, res) => {
    try {
        const students = await StudentModel.find();
        res.json({ user: req.user, students });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ---------------------- STUDENT ROUTES ---------------------- */

app.post("/student", async (req, res) => {
    try {
        const { studentID, studentName, course, presentDate } = req.body;

        if (!studentID || !studentName || !course || !presentDate) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const newStudent = new StudentModel({ studentID, studentName, course, presentDate });
        await newStudent.save();

        res.status(201).json({ message: "✅ Student created successfully", student: newStudent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/student/:id', async (req, res) => {
    try {
        const student = await StudentModel.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not exists" });

        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/student/:id', async (req, res) => {
    try {
        const { studentID, studentName, course, presentDate } = req.body;

        const student = await StudentModel.findByIdAndUpdate(
            req.params.id,
            { studentID, studentName, course, presentDate },
            { new: true }
        );

        if (!student) return res.status(404).json({ message: '❌ Student not found' });

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/student', async (req, res) => {
    try {
        const students = await StudentModel.find();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/student/:id', async (req, res) => {
    try {
        const student = await StudentModel.findById(req.params.id);
        if (!student) return res.status(404).json({ message: '❌ Student not found' });

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* ---------------------- TEST ROUTES ---------------------- */

app.get('/', (req, res) => res.send('✅ Welcome to the server!'));
app.get('/test', (req, res) => res.send('✅ This is the test page!'));

/* ---------------------- SERVER START ---------------------- */

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`));
