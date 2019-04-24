import React from 'react';

const Footer = ({status, midiMsg, oscMsg, loading}) => (
    <div className="footer">
        {loading ? <div>Loading...</div> : <div>{status}</div>}
        <div className="midi-devices-box">
            <div><span className="midi-title">MIDI MESSAGE:</span><span className="midi-value">{midiMsg ? midiMsg : 'waiting'}</span></div>
            <div><span className="midi-title">OSC MESSAGE:</span><span className="midi-value">{oscMsg ? oscMsg : 'waiting'}</span></div>
        </div>
    </div>
);

export default Footer;
