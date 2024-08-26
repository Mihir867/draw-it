import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import keycloak from './keycloak';
import HomePage from './Homepage';
import Canvas from './Canvas';
import './index.css';

const App: React.FC = () => {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/canvas/*" element={<Canvas />} />
        
       
      </Routes>
    </Router>
  );
};

export default App;
