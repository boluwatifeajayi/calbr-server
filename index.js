const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Import cors package

const app = express();
const port = 5000;
const secretKey = 'yourSecretKey';

// Connect to MongoDB
mongoose.connect('mongodb+srv://bolu:bolu123@imq.10yj3f7.mongodb.net/test', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define Schema for Tourist Center
const touristCenterSchema = new mongoose.Schema({
    label: String,
    description: String,
    image: String
});

const TouristCenter = mongoose.model('TouristCenter', touristCenterSchema);

app.use(bodyParser.json());
app.use(cors()); // Use cors middleware to allow access from any origin

// Middleware for authentication
const authenticateUser = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send('Unauthorized');
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).send('Unauthorized');
        }
        req.user = decoded;
        next();
    });
};


// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Dummy authentication for demonstration
    if (username === 'admin' && password === 'password') {
        const token = jwt.sign({ username }, secretKey);
        res.json({ token });
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Routes

// Create a tourist center
app.post('/touristCenters', async (req, res) => {
    try {
        const { label, description, image } = req.body;
        const touristCenter = new TouristCenter({ label, description, image });
        await touristCenter.save();
        res.status(201).json(touristCenter);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Get all tourist centers
app.get('/touristCenters', async (req, res) => {
    try {
        const touristCenters = await TouristCenter.find();
        res.json(touristCenters);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Get a particular tourist center
app.get('/touristCenters/:id', async (req, res) => {
    try {
        const touristCenter = await TouristCenter.findById(req.params.id);
        if (!touristCenter) {
            res.status(404).send('Tourist Center not found');
        } else {
            res.json(touristCenter);
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Update a tourist center
app.put('/touristCenters/:id', async (req, res) => {
    try {
        const { label, description, image } = req.body;
        const updatedTouristCenter = await TouristCenter.findByIdAndUpdate(req.params.id, { label, description, image }, { new: true });
        if (!updatedTouristCenter) {
            res.status(404).send('Tourist Center not found');
        } else {
            res.json(updatedTouristCenter);
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete a tourist center
app.delete('/touristCenters/:id', async (req, res) => {
    try {
        const deletedTouristCenter = await TouristCenter.findByIdAndDelete(req.params.id);
        if (!deletedTouristCenter) {
            res.status(404).send('Tourist Center not found');
        } else {
            res.sendStatus(204);
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
