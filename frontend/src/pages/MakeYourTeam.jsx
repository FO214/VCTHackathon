import React, { useState, useEffect } from 'react';
import './MakeYourTeam.css';

let globalPlayers = []; // Declare this outside the component

const get_agent = (player) => {
  console.log(player);
  if (player == "N/A") {
    return "None";
  }
  let agent = player.slice(2);
  agent = agent.slice(0, agent.indexOf("'"));
  return agent;
}

const MakeYourTeam = () => {
  const [selectedPlayers, setSelectedPlayers] = useState(Array.from({length: 5}, () => null));
  const [dropdownOpen, setDropdownOpen] = useState(Array.from({length: 5}, () => false));

  useEffect(() => {
    fetch('http://localhost:5000/get-all-players')
      .then(response => response.json())
      .then(data => {
        globalPlayers = data; // Update the global players array
        console.log('Fetched players:', data);
      })
      .catch(error => {
        console.error('Error fetching team:', error);
      });
  }, []);

  const handleSelectPlayer = (index, player) => {
    const newPlayers = [...selectedPlayers];
    newPlayers[index] = player;
    setSelectedPlayers(newPlayers);
    toggleDropdown(index);
  };

  const toggleDropdown = (index) => {
    const newDropdownState = [...dropdownOpen];
    newDropdownState[index] = !newDropdownState[index];
    setDropdownOpen(newDropdownState);
  };

  const handleSubmitTeam = () => {
    if (selectedPlayers.some(player => player === null)) {
      alert('Please select all players before submitting!');
      return;
    }
  
    let team = {};
    selectedPlayers.forEach((player, index) => {
      if (player) {
        team[`player${index + 1}`] = {"IGN": player.IGN};
      }
    });
  
    console.log("Sending team:", team);
  
    fetch('http://localhost:5000/upload-user-team', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(team),
    })
      .then(response => response.json())
      .then(data => {
        alert('Team successfully submitted!');
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };  

  const renderPlayerCard = (index) => (
    <div key={index} className="player-card">
      {!selectedPlayers[index] ? (
        <>
          <div className="add-button" onClick={() => toggleDropdown(index)}>
            <span>+</span>
          </div>
          {dropdownOpen[index] && (
            <div className="dropdown-menu">
              {globalPlayers.map((player, i) => (
                <div
                  key={i}
                  className="dropdown-item"
                  onClick={() => handleSelectPlayer(index, player)}
                >
                  {player.Name} ({player.IGN})
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="player-info">
          <p>{selectedPlayers[index].Name}</p>
          <p>IGN: {selectedPlayers[index].IGN}</p>
          <p>Agent 1: {get_agent(selectedPlayers[index]["Agent 1"])}</p>
          <p>Agent 2: {get_agent(selectedPlayers[index]["Agent 2"])}</p>
          <p>Agent 3: {get_agent(selectedPlayers[index]["Agent 3"])}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="make-your-team-container">
      <h1 className="title">Make Your Team</h1>
      <div className="player-card-container">
        {[...Array(5)].map((_, i) => renderPlayerCard(i))}
      </div>
      <button className="submit-button" onClick={handleSubmitTeam}>
        Submit Team
      </button>
    </div>
  );
};

export default MakeYourTeam;
