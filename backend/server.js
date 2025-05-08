const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Simulated Bin Data (Replace with a Database Later)
let bins = [
    { id: 1, location: 'Main Gate', fillLevel: 40 },
    { id: 2, location: 'Cafeteria', fillLevel: 70 },
    { id: 3, location: 'Building 4', fillLevel: 20 },
    { id: 4, location: 'NAB', fillLevel: 55 },
];

// Simulated Users Data (Replace with a Database Later)
let users = [
    { id: 1, username: 'john_doe', points: 50 },
    { id: 2, username: 'jane_smith', points: 30 },
];

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Get All Bins
app.get('/api/bins', (req, res) => {
    res.json(bins);
});

// Get User by Username (Login)
app.get('/api/users/:username', (req, res) => {
    const user = users.find(u => u.username === req.params.username);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
});

// Create User (Simulate Sign-Up)
app.post('/api/users', (req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }
    const newUser = {
        id: users.length + 1,
        username,
        points: 0,
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Update Bin Fill Level and Track Points for Users
app.put('/api/bins/:id', (req, res) => {
    const binId = parseInt(req.params.id);
    const { fillLevel, userId } = req.body; // Including userId for tracking points

    // Find the bin by ID
    const bin = bins.find(b => b.id === binId);
    if (!bin) {
        return res.status(404).json({ error: 'Bin not found' });
    }

    // Update the fill level
    bin.fillLevel = fillLevel;

    // Find the user by userId and update points
    const user = users.find(u => u.id === userId);
    if (user) {
        user.points += 10; // Add 10 points for each update (adjust as necessary)
    }

    res.json({ message: 'Fill level updated and points awarded', bin, user });
});

// Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
