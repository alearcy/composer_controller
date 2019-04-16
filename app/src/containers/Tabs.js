import React from 'react';
import { connect } from 'react-redux';
import { getEditingMode } from '../store/selectors/boardSelectors';
import * as tabsActions from '../store/actions/tabsActions';
import Tab from '../components/Tab';
import { getCurrentTab, getTabs } from '../store/selectors/tabsSelectors';

const Tabs = ({ currentTab, tabs, isEditingMode, editTab, setCurrentTab }) => (
  <div className="tabs">
    {tabs.map(tab => <Tab key={tab.id}
                          tab={tab}
                          activeTab={currentTab.id}
                          tabsNumber={tabs.length}
                          isEditingMode={isEditingMode}
                          handleEditObj={() => editTab(tab)}
                          handleClickTab={() => setCurrentTab(tab)}
    >{tab.label}</Tab>)}
  </div>
);

const mapStateToProps = state => ({
  currentTab: getCurrentTab(state),
  tabs: getTabs(state),
  isEditingMode: getEditingMode(state)
});
const mapDispatchToProps = dispatch => ({
  editTab: tab => dispatch(tabsActions.editTab(tab)),
  setCurrentTab: tab => dispatch(tabsActions.setCurrentTab(tab))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tabs);
