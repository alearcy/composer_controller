import React from 'react';

const Label = ({ obj }) => <div style={{textAlign: obj.textAlign, color: obj.color}}>{obj.label}</div>;

export default Label;
