import React, { useState, useEffect } from 'react';
import './MakeYourTeam.css';

const players = [
  { ign: "C0M", realName: "Corbin Lee", agents: ["Sova", "Viper", "Fade"] },
  { ign: "B0B", realName: "Bob Jones", agents: ["Phoenix", "Jett", "Raze"] },
  { ign: "L0G", realName: "Logan Smith", agents: ["Brimstone", "Cypher", "Killjoy"] },
  { ign: "Z0E", realName: "Zoe Lee", agents: ["Reyna", "Omen", "Sage"] },
  { ign: "T0M", realName: "Tom White", agents: ["Astra", "Yoru", "Breach"] },
];

const MakeYourTeam = () => {
  const [selectedPlayers, setSelectedPlayers] = useState(Array(5).fill(null));
  const [dropdownOpen, setDropdownOpen] = useState(Array(5).fill(false));

  // Fetch current team from API on load
  useEffect(() => {
    fetch('https://example.com/api/getTeam') // Replace with your actual backend API endpoint
      .then((response) => response.json())
      .then((data) => {
        // Assuming the API returns an array of selected players
        setSelectedPlayers(data);
      })
      .catch((error) => {
        console.error('Error fetching team:', error);
      });
  }, []);

  const handleSelectPlayer = (index, player) => {
    const newPlayers = [...selectedPlayers];
    newPlayers[index] = player;
    setSelectedPlayers(newPlayers);
    toggleDropdown(index); // Close the dropdown after selection
  };

  const toggleDropdown = (index) => {
    const newDropdownState = [...dropdownOpen];
    newDropdownState[index] = !newDropdownState[index];
    setDropdownOpen(newDropdownState);
  };

  const handleSubmitTeam = () => {
    if (selectedPlayers.some((player) => player === null)) {
      alert('Please select all players before submitting!');
      return;
    }

    // Simulate sending to a backend API
    fetch('https://example.com/api/submitTeam', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedPlayers),
    })
      .then((response) => response.json())
      .then((data) => {
        alert('Team successfully submitted!');
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="make-your-team-container">
      <h1 className="title">Make Your Team</h1>
      <div className="player-card-container">
        {selectedPlayers.map((selectedPlayer, index) => (
          <div key={index} className="player-card">
            {!selectedPlayer ? (
              <>
                <div className="add-button" onClick={() => toggleDropdown(index)}>
                  <span>+</span>
                </div>
                {dropdownOpen[index] && (
                  <div className="dropdown-menu">
                    {players.map((player, i) => (
                      <div
                        key={i}
                        className="dropdown-item"
                        onClick={() => handleSelectPlayer(index, player)}
                      >
                        {player.realName} ({player.ign})
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="player-info">
                <p>{selectedPlayer.realName}</p>
                <p>IGN: {selectedPlayer.ign}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <button className="submit-button" onClick={handleSubmitTeam}>
        Submit Team
      </button>
    </div>
  );
};

export default MakeYourTeam;
