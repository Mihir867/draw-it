import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import keycloak from './keycloak';
import HomePage from './Homepage';
import ProtectedComponent from './ProtectedComponent';
import LoginPage from './LoginPage';
import { Excalidraw } from "@excalidraw/excalidraw";



// const PrivateRoute = ({ children }: { children: JSX.Element }) => {
//   return keycloak.authenticated ? children : <Navigate to="/login" />;
// };

const App: React.FC = () => {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/canvas" element={<Excalidraw />} />
        <Route
          path="/protected"
          element={
            
              <ProtectedComponent />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
