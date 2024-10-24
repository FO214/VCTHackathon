import React from 'react';
import meettheteam from '../assets/meettheteam.png'
import names from '../assets/names.png'

const MeetTheTeam = () => {
  return (
    <div className="App">
        <img style={{width:"1100px", height:"auto", marginLeft:"50px", marginBottom:"30px"}} src={meettheteam} alt="meettheteam" />
        <img style={{width:"1000px", height:"auto", marginLeft:"90px", marginBottom:"300px"}} src={names} alt="names" />
    </div>
  );
}

export default MeetTheTeam;
