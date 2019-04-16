import React from 'react';

const Footer = ({ status, midiOut, midiIn, loading }) => (
  <div className="footer">
    <div>{status}</div>
      {loading ? <div>Loading...</div> : null}
    <div className="midi-devices-box">
      <div><span className="midi-title">MIDI-IN:</span><span className="midi-value">{midiIn || 'No device'}</span></div>
      <div><span className="midi-title">MIDI-OUT:</span><span className="midi-value">{midiOut || 'No device'}</span></div>
    </div>
  </div>
);

export default Footer;
