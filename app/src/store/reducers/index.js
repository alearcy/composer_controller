import { combineReducers } from 'redux';
import boardReducer from './boardReducer';
import devicessReducer from './devicesReducer';
import elementsReducer from './elementsReducer';
import tabsReducer from './tabsReducer';

const reducers = combineReducers({
  board   : boardReducer,
  elements: elementsReducer,
  tabs    : tabsReducer,
  devices : devicessReducer,
});

export default reducers;
