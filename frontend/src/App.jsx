import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Login from './components/Login';
import HowToPlay from './pages/HowToPlay';
import Brackets from './pages/Brackets';
import MakeYourTeam from './pages/MakeYourTeam';
import MeetTheTeam from './pages/MeetTheTeam';
import "./assets/Valorant.ttf"

function App() {
  return (
    <Router>
      <div className="container">
        <NavBar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/brackets" element={<Brackets />} />
          <Route path="/make-your-team" element={<MakeYourTeam />} />
          <Route path="/meet-the-team" element={<MeetTheTeam />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
