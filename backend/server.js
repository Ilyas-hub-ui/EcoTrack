const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));


let bins = [
    { id: 1, location: 'Main Gate', fillLevel: 40, latitude: 33.5344, longitude: -5.1052 },
    { id: 2, location: 'Cafeteria', fillLevel: 70, latitude: 33.5351, longitude: -5.0998 },
    { id: 3, location: 'Building 4', fillLevel: 20, latitude: 33.5363, longitude: -5.1025 },
    { id: 4, location: 'NAB', fillLevel: 55, latitude: 33.5338, longitude: -5.1003 },
];


// Simulated Users Data with `isAdmin` flag
let users = [
    { id: 1, username: 'john_doe', points: 50, isAdmin: false },
    { id: 2, username: 'admin_user', points: 100, isAdmin: true },  // Admin User
    { id: 3, username: 'jane_smith', points: 30, isAdmin: false },
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
        isAdmin: false, // New users are not admins by default
    };
    users.push(newUser);
    res.status(201).json(newUser);
});

// Update Bin Fill Level and Track Points for Users
app.put('/api/bins/:id', (req, res) => {
    const binId = parseInt(req.params.id);
    const { fillLevel, userId } = req.body;

    const bin = bins.find(b => b.id === binId);
    if (!bin) {
        return res.status(404).json({ error: 'Bin not found' });
    }

    bin.fillLevel = fillLevel;

    const user = users.find(u => u.id === userId);
    if (user) {
        user.points += 10; // Add points for updating fill level
    }

    res.json({ message: 'Fill level updated and points awarded', bin, user });
});

// Handle DELETE request to remove a bin (Admin-only)
app.delete('/api/bins/:id', (req, res) => {
    const binId = parseInt(req.params.id);
    const { userId } = req.body;  // Get userId from request body

    // Check if the user is an admin
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
        bins = bins.filter(bin => bin.id !== binId);
        res.json({ message: 'Bin deleted successfully!' });
    } else {
        res.status(403).json({ message: 'Only admins can delete bins.' });
    }
});

// Start the Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
