import React from 'react';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Tab = ({activeTab, handleClickTab, tab, isEditingMode, handleEditObj}) => {
  const tabClasses = classnames({'tab': true, 'active': activeTab === tab.id});
  return <div className={tabClasses} onPointerDown={handleClickTab}>
    {isEditingMode ? <span className="editTab" onPointerDown={handleEditObj}>
      <FontAwesomeIcon icon="pen"/>
      </span> : null}<span>{tab.label}</span>
    </div>
};

export default Tab;
