import React, { useState } from 'react';
import './Bracket.css';

const Brackets = () => {
  const [teams, setTeams] = useState([
    { id: 1, name: 'Team 1' }, { id: 2, name: 'Team 2' },
    { id: 3, name: 'Team 3' }, { id: 4, name: 'Team 4' },
    { id: 5, name: 'Team 5' }, { id: 6, name: 'Team 6' },
    { id: 7, name: 'Team 7' }, { id: 8, name: 'Team 8' }
  ]);

  const [winners, setWinners] = useState({
    quarterfinals: [],
    semifinals: [],
    final: []
  });

  const handleTeamClick = (round, match, team) => {
    const newWinners = { ...winners };
    
    // Clear subsequent rounds when earlier round selection changes
    if (round === 'quarterfinals') {
      newWinners.semifinals = newWinners.semifinals.map((winner, idx) => 
        idx === Math.floor(match/2) ? null : winner
      );
      newWinners.final = [];
    } else if (round === 'semifinals') {
      newWinners.final = [];
    }
    
    // Update the current round winner
    newWinners[round][match] = team;
    setWinners(newWinners);
  };

  // Helper function to determine if a team is the winner of their match
  const isWinner = (round, match, teamName) => {
    return winners[round][match] === teamName;
  };

  return (
    <div className="bracket-container">
      {/* Quarterfinals */}
      <div className="bracket-round">
        <div className="round-title">Quarter Finals</div>
        {teams.map((team, index) => (
          index % 2 === 0 ? (
            <div key={index} className="bracket-match">
              <div
                className={`team-slot ${isWinner('quarterfinals', Math.floor(index/2), team.name) ? 'winner' : ''}`}
                onClick={() => handleTeamClick('quarterfinals', Math.floor(index/2), team.name)}
              >
                <div className="team-logo"></div>
                <span className="team-name">{team.name}</span>
              </div>
              <div
                className={`team-slot ${isWinner('quarterfinals', Math.floor(index/2), teams[index + 1].name) ? 'winner' : ''}`}
                onClick={() => handleTeamClick('quarterfinals', Math.floor(index/2), teams[index + 1].name)}
              >
                <div className="team-logo"></div>
                <span className="team-name">{teams[index + 1].name}</span>
              </div>
            </div>
          ) : null
        ))}
      </div>

      {/* Semifinals */}
      <div className="bracket-round">
        <div className="round-title">Semi Finals</div>
        {[0, 1].map((match) => (
          <div key={match} className="bracket-match">
            <div
              className={`team-slot ${isWinner('semifinals', match, winners.quarterfinals[match * 2]) ? 'winner' : ''}`}
              onClick={() => winners.quarterfinals[match * 2] && 
                handleTeamClick('semifinals', match, winners.quarterfinals[match * 2])}
            >
              <div className="team-logo"></div>
              <span className="team-name">
                {winners.quarterfinals[match * 2] || 'TBD'}
              </span>
            </div>
            <div
              className={`team-slot ${isWinner('semifinals', match, winners.quarterfinals[match * 2 + 1]) ? 'winner' : ''}`}
              onClick={() => winners.quarterfinals[match * 2 + 1] && 
                handleTeamClick('semifinals', match, winners.quarterfinals[match * 2 + 1])}
            >
              <div className="team-logo"></div>
              <span className="team-name">
                {winners.quarterfinals[match * 2 + 1] || 'TBD'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Final */}
      <div className="bracket-round">
        <div className="round-title">Finals</div>
        <div className="bracket-match">
          <div
            className={`team-slot ${isWinner('final', 0, winners.semifinals[0]) ? 'winner' : ''}`}
            onClick={() => winners.semifinals[0] && 
              handleTeamClick('final', 0, winners.semifinals[0])}
          >
            <div className="team-logo"></div>
            <span className="team-name">
              {winners.semifinals[0] || 'TBD'}
            </span>
          </div>
          <div
            className={`team-slot ${isWinner('final', 0, winners.semifinals[1]) ? 'winner' : ''}`}
            onClick={() => winners.semifinals[1] && 
              handleTeamClick('final', 0, winners.semifinals[1])}
          >
            <div className="team-logo"></div>
            <span className="team-name">
              {winners.semifinals[1] || 'TBD'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brackets;