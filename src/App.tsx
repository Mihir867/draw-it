import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import keycloak from './keycloak';
import HomePage from './Homepage';
import Canvas from './Canvas';
import './index.css';
import Keycloak from 'keycloak-js';

/*
  Init Options
*/
let initOptions = {
  url: 'http://localhost:8080/',
  realm: 'master',
  clientId: 'my-react-first-app',
};

let kc = new Keycloak(initOptions);

// Initialize Keycloak
kc.init({
  onLoad: 'login-required', // Supported values: 'check-sso', 'login-required'
  checkLoginIframe: true,
  pkceMethod: 'S256',
}).then((auth) => {
  if (!auth) {
    window.location.reload(); // Reload if not authenticated
  } else {
    /* Remove below logs if you are using this on production */
    console.info("Authenticated");
    console.log('auth', auth);
    console.log('Keycloak', kc);
    console.log('Access Token', kc.token);

    // Set the Authorization header for your API requests
    const apiUrl = 'http://your-api.com/endpoint';
    const headers = {
      'Authorization': `Bearer ${kc.token}`,
      'Content-Type': 'application/json',
    };

    // Example of making a fetch request
    fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    })
    .then(response => response.json())
    .then(data => {
      console.log('API Response:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });

    // Handle token expiration
    kc.onTokenExpired = () => {
      console.log('Token expired');
      kc.updateToken(30).then((refreshed) => {
        if (refreshed) {
          console.log('Token refreshed');
          // Update the Authorization header with the new token
          headers['Authorization'] = `Bearer ${kc.token}`;
        } else {
          console.warn('Token not refreshed, still valid');
        }
      }).catch(() => {
        console.error('Failed to refresh token');
      });
    };
  }
}).catch(() => {
  /* Notify the user if necessary */
  console.error("Authentication Failed");
});
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
