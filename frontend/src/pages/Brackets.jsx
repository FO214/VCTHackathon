import React, { useState, useEffect } from 'react';
import './Bracket.css';

const initialize_brackets = () => {
  return fetch('http://localhost:5000/get-teams')
    .then(response => response.json())
    .then(data => {
      console.log('Fetched teams:', data);
      
      // Extract team names and randomly select 8 unique teams
      const teamNames = data.map(team => team);
      
      // Shuffle the array
      const shuffledTeams = teamNames.sort(() => Math.random() - 0.5);
      
      // Pick the first 8 unique teams from the shuffled array
      const selectedTeamNames = Array.from(new Set(shuffledTeams)).slice(0, 8);
      const random = Math.floor(Math.random() * 8);
      selectedTeamNames[random] = { Team: "Your Team" };

      const formattedTeams = selectedTeamNames.map((team, index) => ({
        id: index + 1,
        name: team.Team
      }));
      
      console.log('Selected teams:', selectedTeamNames);
      return formattedTeams;
    });
};

const initalize_quarterfinal_matches = async (teams) => {
  // Quarter finals to semi finals
  let semis = [];
  console.log('Initializing matches with teams:', teams);
  
  for (let i = 0; i < 4; i++) {
    console.log('Competing teams: ',{ team1: teams[2 * i], team2: teams[2 * i + 1] })
    let prompt = `${teams[2 * i].name},${teams[2 * i + 1].name}`;
    console.log(prompt);
    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
    await sleep(10000);
    
    await fetch('http://localhost:5000/eval-winner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"prompt": prompt})
    })
    .then(response => response.json())
    .then(data => {
      console.log('Winner:', data);
      if (teams[2 * i].name === data) {
        semis.push(teams[2 * i]);
      } else {
        semis.push(teams[2 * i + 1]);
      }
    })
    .catch(error => console.error('Error evaluating winner:', error));
  }

  console.log('Semifinal teams:', semis);
  return semis;
};

const initalize_semi_matches = async (teams) => {
  // Semi finals to finals
  let finals = [];
  console.log('Initializing matches with teams:', teams);
  
  for (let i = 0; i < 2; i++) {
    console.log('Competing teams: ',{ team1: teams[2 * i], team2: teams[2 * i + 1] })
    let prompt = `${teams[2 * i].name},${teams[2 * i + 1].name}`;
    console.log(prompt);
    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
    await sleep(10000);
    
    await fetch('http://localhost:5000/eval-winner', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"prompt": prompt})
    })
    .then(response => response.json())
    .then(data => {
      console.log('Winner:', data);
      if (teams[2 * i].name === data) {
        finals.push(teams[2 * i]);
      } else {
        finals.push(teams[2 * i + 1]);
      }
    })
    .catch(error => console.error('Error evaluating winner:', error));
  }

  console.log('Finals teams:', finals);
  return finals;
};

const initalize_final_matches = async (teams) => {
  // Semi finals to finals
  let winner = [];
  console.log('Initializing matches with teams:', teams);
  console.log('Competing teams: ',{ team1: teams[0], team2: teams[1] })
  let prompt = `${teams[0].name},${teams[1].name}`;
  console.log(prompt);
  const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
  await sleep(10000);
  
  await fetch('http://localhost:5000/eval-winner', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"prompt": prompt})
  })
  .then(response => response.json())
  .then(data => {
    console.log('Winner:', data);
    if (teams[0].name === data) {
      winner.push(teams[0]);
    } else {
      winner.push(teams[1]);
    }
  })
  .catch(error => console.error('Error evaluating winner:', error));
  console.log('winner: ', winner);
  return winner;
};

const Brackets = () => {
  const [teams, setTeams] = useState([]);
  const [winners, setWinners] = useState({
    quarterfinals: [],
    semifinals: [],
    final: []
  });

  useEffect(() => {
    initialize_brackets().then(temp => setTeams(temp));
  }, []);

  useEffect(() => {
    if (teams.length > 0) {
      initalize_quarterfinal_matches(teams).then(temp => setWinners(prevWinners => ({ ...prevWinners, quarterfinals: temp })));
    }
  }, [teams]); // Dependency on teams

  useEffect(() => {
    if (winners.quarterfinals.length > 0) {
      initalize_semi_matches(winners.quarterfinals).then(temp => setWinners(prevWinners => ({ ...prevWinners, semifinals: temp })));
    }
  }, [winners.quarterfinals]); // Dependency on quarterfinals

  useEffect(() => {
    if (winners.semifinals.length > 0) {
      initalize_final_matches(winners.semifinals).then(temp => setWinners(prevWinners => ({ ...prevWinners, final: temp })));
    } 
  }, [winners.semifinals]); // Dependency on semifinals

  // Helper function to determine if a team is the winner of their match
  const isWinner = (round, match, teamName) => {
    return winners[round][match] && winners[round][match].name === teamName;
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
              >
                <div className="team-logo"></div>
                <span className="team-name">{team.name}</span>
              </div>
              <div
                className={`team-slot ${isWinner('quarterfinals', Math.floor(index/2), teams[index + 1].name) ? 'winner' : ''}`}
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
        {winners.quarterfinals.map((team, index) => (
          index % 2 === 0 ? (
            <div key={index} className="bracket-match">
              <div
                className={`team-slot ${isWinner('semifinals', Math.floor(index/2), team.name) ? 'winner' : ''}`}
              >
                <div className="team-logo"></div>
                <span className="team-name">{team.name}</span>
              </div>
              <div
                className={`team-slot ${isWinner('semifinals', Math.floor(index/2), winners.quarterfinals[index + 1].name) ? 'winner' : ''}`}
              >
                <div className="team-logo"></div>
                <span className="team-name">{winners.quarterfinals[index + 1].name}</span>
              </div>
            </div>
          ) : null
        ))}
      </div>

      {/* Final */}
      <div className="bracket-round">
        <div className="round-title">Finals</div>
        {winners.semifinals.map((team, index) => (
          index % 2 === 0 ? (
            <div key={index} className="bracket-match">
              <div
                className={`team-slot ${isWinner('final', Math.floor(index/2), team.name) ? 'winner' : ''}`}
              >
                <div className="team-logo"></div>
                <span className="team-name">{team.name}</span>
              </div>
              <div
                className={`team-slot ${isWinner('final', Math.floor(index/2), winners.semifinals[index + 1].name) ? 'winner' : ''}`}
              >
                <div className="team-logo"></div>
                <span className="team-name">{winners.semifinals[index + 1].name}</span>
              </div>
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
};

export default Brackets;
