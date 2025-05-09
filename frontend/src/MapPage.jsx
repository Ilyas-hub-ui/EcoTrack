// src/pages/MapPage.jsx
import React from 'react';

const MapPage = () => {
  return (
    <div style={{ height: '100vh', border: 'none' }}>
      <iframe
        src="http://localhost:5000/map.html"
        title="EcoTrack Map"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default MapPage;
