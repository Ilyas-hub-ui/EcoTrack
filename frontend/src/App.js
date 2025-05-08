import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import binIcon from './bin-icon.png';  // Import bin icon image

function App() {
    const [bins, setBins] = useState([]);
    const [newLevels, setNewLevels] = useState({});
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);  // Store user info here
    const [username, setUsername] = useState(''); // For sign up
    const [userId, setUserId] = useState(null);  // To store user ID after sign in

    // Simulate login (In a real-world scenario, use JWT or other secure methods)
    const loginUser = () => {
        if (!username) {
            alert("Please enter a username to log in.");
            return;
        }

        axios.get(`http://localhost:5000/api/users/${username}`)
            .then(res => {
                setUser(res.data);  // Store logged-in user data
                setUserId(res.data.id);  // Store user ID
            })
            .catch(err => setError('User not found. Please sign up.'));
    };

    const signUpUser = () => {
        if (!username) {
            alert('Username cannot be empty!');
            return;
        }

        // Sign up new user
        axios.post('http://localhost:5000/api/users', { username })
            .then(res => {
                setUser(res.data);
                setUserId(res.data.id);
                setUsername('');
                alert('User created successfully!');
            })
            .catch(err => setError('Error creating user'));
    };

    // Fetch Bin Data on Component Mount
    useEffect(() => {
        axios.get('http://localhost:5000/api/bins')
            .then(res => setBins(res.data))
            .catch(() => setError('Failed to load bins. Check if the backend is running.'));
    }, []);

    // Handle Bin Updates
    const handleUpdate = (id) => {
        const level = parseInt(newLevels[id]);
        if (isNaN(level) || level < 0 || level > 100) {
            alert("Please enter a valid fill level (0-100).");
            return;
        }

        axios.put(`http://localhost:5000/api/bins/${id}`, { fillLevel: level, userId })
            .then(() => {
                setBins(prev =>
                    prev.map(bin => bin.id === id ? { ...bin, fillLevel: level } : bin)
                );
                setNewLevels(prev => ({ ...newLevels, [id]: '' }));
                setUser(prevUser => ({
                    ...prevUser,
                    points: prevUser.points + 10 // Add points to the user locally
                }));
                alert("Fill level updated successfully and points awarded!");
            })
            .catch(err => {
                console.error(err);
                alert("Failed to update bin level.");
            });
    };

    // Sort bins by fill level for the leaderboard
    const sortedBins = [...bins].sort((a, b) => b.fillLevel - a.fillLevel);

    return (
        <div className="container">
            <h2>EcoTrack Bin Status Dashboard</h2>
            {error && <p className="error">{error}</p>}

            {/* Sign-Up/Sign-In Form */}
            {!user ? (
                <div className="auth-container">
                    <h3>Sign Up or Log In</h3>
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={signUpUser} className="auth-btn">Sign Up</button>
                    <button onClick={loginUser} className="auth-btn">Log In</button>
                </div>
            ) : (
                <div>
                    <h3>Welcome {user.username} — Points: {user.points}</h3>
                    <button onClick={() => setUser(null)} className="auth-btn">Log Out</button>
                </div>
            )}

            {/* Leaderboard */}
            <h3>Leaderboard</h3>
            <div className="leaderboard">
                {sortedBins.map(bin => (
                    <div key={bin.id} className="bin-card">
                        <img src={binIcon} alt="Bin Icon" className="bin-icon" />
                        <div>
                            📍 <strong>{bin.location}</strong> — Fill Level: {bin.fillLevel}%
                        </div>
                    </div>
                ))}
            </div>

            {/* Update Bin Fill Level */}
            <h3>Update Bin Fill Level</h3>
            <div className="bin-update">
                {bins.map(bin => (
                    <div key={bin.id} className="bin-update-card">
                        <img src={binIcon} alt="Bin Icon" className="bin-icon" />
                        📍 <strong>{bin.location}</strong> — Current Fill Level: {bin.fillLevel}%
                        <div>
                            <input
                                type="number"
                                placeholder="New level (0-100)"
                                value={newLevels[bin.id] || ''}
                                onChange={(e) => setNewLevels({ ...newLevels, [bin.id]: e.target.value })}
                                className="input-field"
                            />
                            <button onClick={() => handleUpdate(bin.id)} className="update-btn">Update</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
