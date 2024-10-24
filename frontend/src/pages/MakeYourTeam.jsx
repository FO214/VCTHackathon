import React, { useState, useEffect, useRef } from 'react';
import './MakeYourTeam.css';

let globalPlayers = [];

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
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:5000/get-all-players')
      .then(response => response.json())
      .then(data => {
        globalPlayers = data;
        console.log('Fetched players:', data);
      })
      .catch(error => {
        console.error('Error fetching team:', error);
      });
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage = {
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });

      const data = await response.json();
      
      const botMessage = {
        text: data.response,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
      <div className="main-content" style={{ marginRight: isChatOpen ? '384px' : '0', transition: 'margin-right 0.3s' }}>
        <h1 className="title">Make Your Team</h1>
        <div className="player-card-container">
          {[...Array(5)].map((_, i) => renderPlayerCard(i))}
        </div>
        <button className="submit-button" onClick={handleSubmitTeam}>
          Submit Team
        </button>
      </div>

      {/* Chat Component */}
      <div 
        className="chat-container"
        style={{
          position: 'fixed',
          right: isChatOpen ? '0' : '-384px',
          top: '0',
          marginTop: '10rem',
          width: '384px',
          height: '80vh',
          background: '#1a1a1a',
          transition: 'right 0.3s',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #e0c64f'
        }}
      >
        {/* Chat Header */}
        <div style={{
          background: '#e0c64f',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#1a1a1a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <span style={{ color: '#e0c64f' }}>^w^</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>BOOMBOT</span>
          </div>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            style={{ color: '#1a1a1a', fontSize: '24px', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {isChatOpen ? '×' : '◀'}
          </button>
        </div>

        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {messages.map((message, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                gap: '8px'
              }}
            >
              {!message.isUser && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#1a1a1a',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e0c64f'
                }}>
                  <span style={{ color: '#e0c64f', fontSize: '12px' }}>^w^</span>
                </div>
              )}
              <div style={{
                maxWidth: '70%',
                padding: '12px',
                borderRadius: '8px',
                background: message.isUser ? '#e0c64f' : '#333',
                color: message.isUser ? '#1a1a1a' : 'white'
              }}>
                {message.text}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div style={{
          padding: '16px',
          background: '#2a2a2a',
          borderTop: '1px solid #e0c64f'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Text"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #e0c64f',
                background: '#1a1a1a',
                color: 'white'
              }}
            />
            <button 
              onClick={sendMessage}
              style={{
                padding: '8px',
                background: '#e0c64f',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <svg 
                style={{ width: '24px', height: '24px', transform: 'rotate(90deg)' }}
                viewBox="0 0 20 20"
                fill="#1a1a1a"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeYourTeam;