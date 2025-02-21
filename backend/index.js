const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Habit Schema
const habitSchema = new mongoose.Schema({
    name: String,
    completed: Boolean,
    date: String
});
const Habit = mongoose.model('Habit', habitSchema);

// Middleware to check secret key
const checkKey = (req, res, next) => {
    const key = req.headers['x-secret-key'];
    if (key !== process.env.SECRET_KEY) return res.status(403).send('Invalid key');
    next();
};

// API Routes
app.get('/habits', checkKey, async (req, res) => {
    const habits = await Habit.find();
    res.json(habits);
});

app.post('/habits', checkKey, async (req, res) => {
    const { name, completed, date } = req.body;
    const habit = new Habit({ name, completed, date });
    await habit.save();
    res.json(habit);
});

app.put('/habits/:id', checkKey, async (req, res) => {
    const { completed, date } = req.body;
    const habit = await Habit.findByIdAndUpdate(req.params.id, { completed, date }, { new: true });
    res.json(habit);
});

app.delete('/habits/:id', checkKey, async (req, res) => {
    await Habit.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));