import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [bins, setBins] = useState([]);
    const [newLevels, setNewLevels] = useState({});
    const [message, setMessage] = useState({ text: '', type: '' });
    const [user, setUser] = useState(null);
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [showMap, setShowMap] = useState(false); // ✅ NEW STATE for toggling map

    const showMessage = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const loginUser = () => {
        if (!username) {
            showMessage("Please enter a username to log in.", "error");
            return;
        }

        axios.get(`http://localhost:5000/api/users/${username}`)
            .then(res => {
                setUser(res.data);
                setUserId(res.data.id);
                showMessage(`Welcome back, ${res.data.username}!`);
            })
            .catch(() => showMessage('User not found. Please sign up.', 'error'));
    };

    const signUpUser = () => {
        if (!username) {
            showMessage('Username cannot be empty!', 'error');
            return;
        }

        axios.post('http://localhost:5000/api/users', { username })
            .then(res => {
                setUser(res.data);
                setUserId(res.data.id);
                setUsername('');
                showMessage('User created successfully!');
            })
            .catch(() => showMessage('Error creating user', 'error'));
    };

    useEffect(() => {
        axios.get('http://localhost:5000/api/bins')
            .then(res => setBins(res.data))
            .catch(() => showMessage('Failed to load bins. Check if the backend is running.', 'error'));
    }, []);

    const handleUpdate = (id) => {
        const level = parseInt(newLevels[id]);
        if (isNaN(level) || level < 0 || level > 100) {
            showMessage("Please enter a valid fill level (0-100).", "error");
            return;
        }

        axios.put(`http://localhost:5000/api/bins/${id}`, { fillLevel: level, userId })
            .then(() => {
                setBins(prev =>
                    prev.map(bin => bin.id === id ? { ...bin, fillLevel: level } : bin)
                );
                setNewLevels(prev => ({ ...prev, [id]: '' }));
                setUser(prevUser => ({
                    ...prevUser,
                    points: prevUser.points + 10
                }));
                showMessage("Fill level updated and points awarded!");
            })
            .catch(() => showMessage("Failed to update bin level.", "error"));
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this bin?")) {
            axios.delete(`http://localhost:5000/api/bins/${id}?userId=${userId}`)
                .then(() => {
                    setBins(prev => prev.filter(bin => bin.id !== id));
                    showMessage("Bin deleted successfully!");
                })
                .catch(() => showMessage("Failed to delete bin.", "error"));
        }
    };

    const sortedBins = [...bins].sort((a, b) => {
      const isOverflowA = a.fillLevel > 90 ? 1 : 0;   // Prioritize overflowing bins
      const isOverflowB = b.fillLevel > 90 ? 1 : 0;
      return isOverflowB - isOverflowA || b.fillLevel - a.fillLevel;
    });
    

    return (
        <div className="container">
            <h2>EcoTrack Bin Status Dashboard</h2>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Show/Hide Map Button */}
            <button onClick={() => setShowMap(prev => !prev)} className="auth-btn" style={{ marginBottom: '10px' }}>
                {showMap ? 'Hide Interactive Map' : 'Show Interactive Map'}
            </button>

            {/* Show Map when toggled */}
            {showMap && (
                <div style={{ height: '500px', marginBottom: '20px' }}>
                    <iframe
                        src="http://localhost:5000/map.html"
                        title="Interactive Map"
                        width="100%"
                        height="100%"
                        style={{ border: '1px solid #ccc' }}
                    />
                </div>
            )}

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

                    <div className="role-selection">
                        <button onClick={() => setUserRole('user')} className="auth-btn">Login as User</button>
                        <button onClick={() => setUserRole('admin')} className="auth-btn">Login as Admin</button>
                    </div>
                </div>
            ) : (
                <div>
                    <h3>Welcome {user.username} — Points: {user.points}</h3>
                    <button onClick={() => setUser(null)} className="auth-btn logout">Log Out</button>

                    {userRole === 'admin' && (
                        <div>
                            <h3>Admin Panel</h3>
                            <p>You have the ability to delete and update bins.</p>
                        </div>
                    )}
                </div>
            )}

<div className="leaderboard">
    {sortedBins.map(bin => (
        <div key={bin.id} className={`bin-card ${userRole === 'admin' && bin.fillLevel > 90 ? 'overflow-alert' : ''}`}>
            📍 <strong>{bin.location}</strong> — Fill Level: {bin.fillLevel}%
            {/* Visual Overflow Alert for Admins */}
            {userRole === 'admin' && bin.fillLevel > 90 && (
                <span style={{ color: 'red', marginLeft: '10px', fontWeight: 'bold' }}>
                    ⚠️ Overflow Alert!
                </span>
            )}
        </div>
    ))}
</div>


            <h3>Update Bin Fill Level</h3>
            <div className="bin-update">
                {bins.map(bin => (
                    <div key={bin.id} className="update-card">
                        📍 <strong>{bin.location}</strong> — Current Fill Level: {bin.fillLevel}%
                        <div className="update-section">
                            <input
                                type="number"
                                placeholder="New level (0-100)"
                                value={newLevels[bin.id] || ''}
                                onChange={(e) => setNewLevels({ ...newLevels, [bin.id]: e.target.value })}
                                className="input-field"
                            />
                            <div className="btn-group">
                                <button onClick={() => handleUpdate(bin.id)} className="update-btn">Update</button>
                                {userRole === 'admin' && (
                                    <button onClick={() => handleDelete(bin.id)} className="delete-btn">Delete Bin</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;
