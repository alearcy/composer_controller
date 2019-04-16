import React from 'react';

const OscButton = ({ obj, onPointerDown }) => (
  <div className="oscButton-wrapper" onPointerDown={onPointerDown}>
    {obj.label}
  </div>
);

export default OscButton;
