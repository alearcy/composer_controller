import React from 'react';

const Footer = ({ status, oscMsg, loading }) => (
  <div className="footer">
    {loading ? <div>Loading...</div> : <div>{status}</div>}
    <div className="midi-devices-box">
      <div>
        <span className="midi-title">OSC MONITOR:</span>
        <span className="midi-value">{oscMsg ? oscMsg : "waiting"}</span>
      </div>
    </div>
  </div>
);

export default Footer;
