import React from 'react';
import classnames from 'classnames';

const Drawer = ({open, children}) => {
  const drawer = classnames({ 'drawer': true, 'open': open });
  const overlay = classnames({ 'overlay': true, 'open': open });
  return (
    <div>
      <div className={drawer}>
        {children}
      </div>
      <div className={overlay} />
    </div>
  );
};


export default Drawer;
