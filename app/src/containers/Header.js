import React from 'react';
import { connect } from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { getEditingMode } from '../store/selectors/boardSelectors';
import * as boardActions from '../store/actions/boardActions';
import * as elementsActions from '../store/actions/elementsAction';
import * as tabsActions from '../store/actions/tabsActions';
import { getCurrentTab } from '../store/selectors/tabsSelectors';

const Header = ({
                  isEditingMode,
                  exitEditingMode,
                  handleEditingMode,
                  createButton,
                  createSlider,
                  createLabel,
                  createTab,
                  saveLayout,
                  currentTab,
                  handleSettingsForm
                }) => (
  <div className="header">
    <div className="tools">
      {isEditingMode ?
        <div>
          <button type="button" onPointerDown={createTab}>
            New tab
          </button>
          <button type="button" onPointerDown={() => createButton(currentTab)}>
            New button
          </button>
          <button type="button" onPointerDown={() => createSlider(currentTab)}>
            New slider
          </button>
          <button type="button" onPointerDown={() => createLabel(currentTab)}>
            New label
          </button>
          <button type="button" onPointerDown={saveLayout} className="confirm">
            Save
          </button>
          <button type="button" onPointerDown={exitEditingMode} className="neutral">
            Cancel
          </button>
        </div>
        : null}
    </div>
    {!isEditingMode ?
      <div className="editButton" onPointerDown={handleEditingMode}>
        <FontAwesomeIcon icon="pen"/>
      </div>

      : null}
    <span>|</span>
    <div className="settingsButton" onPointerDown={handleSettingsForm}>
      <FontAwesomeIcon icon="cogs"/>
    </div>
  </div>
);

const mapStateToProps = state => ({
  isEditingMode: getEditingMode(state),
  currentTab   : getCurrentTab(state)
});
const mapDispatchToProps = dispatch => ({
  handleEditingMode : () => dispatch(boardActions.handleEditingMode()),
  createButton      : currentTab => dispatch(elementsActions.createButton(currentTab)),
  createSlider      : currentTab => dispatch(elementsActions.createSlider(currentTab)),
  createLabel       : currentTab => dispatch(elementsActions.createLabel(currentTab)),
  createTab         : () => dispatch(tabsActions.createTab()),
  exitEditingMode   : () => dispatch(boardActions.exitEditingMode()),
  saveLayout        : () => dispatch(boardActions.saveLayout()),
  handleSettingsForm: () => dispatch(boardActions.handleSettingsForm())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
