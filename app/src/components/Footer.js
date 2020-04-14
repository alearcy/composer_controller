import React from 'react';

const Footer = ({status, midiMsg, loading}) => (
    <div className="footer">
        {loading ? <div>Loading...</div> : <div>{status}</div>}
        <div className="midi-devices-box">
            <div><span className="midi-title">MIDI MESSAGE:</span><span className="midi-value">{midiMsg ? midiMsg : 'waiting'}</span></div>
        </div>
    </div>
);

export default Footer;
