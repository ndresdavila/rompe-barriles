// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import MainMenu from './components/MainMenu';
import GamePage from './components/GamePage';
import { UserProvider } from './context/UserContext'; // Importa el contexto

function App() {
  return (
    <UserProvider> {/* Envuelve tu aplicación con el UserProvider */}
      <Router>
        <Routes>
          <Route exact path="/" element={<LoginPage />} />
          <Route path="/menu" element={<MainMenu />} />
          <Route path="/game" element={<GamePage />} />
          {/* <Route path="/store" element={<StorePage />} /> */}
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
