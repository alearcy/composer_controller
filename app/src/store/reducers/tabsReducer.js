import createReducer from '../../helpers/create-reducer';
import { uuidGen } from '../../helpers/uuid-generator';
import { ElementTypes } from '../../constants/genericConstants';
import {
  CREATE_TAB,
  LOAD_TABS,
  SAVE_TAB_FORM,
  SET_CURRENT_TAB,
  HANDLE_EDIT_TAB,
  RESET_BOARD,
  SET_INITIAL_TAB, IMPORT_TABS_FROM_FILE, DELETE_TAB
} from '../../constants/actionConstants';

const initialState = {
  tabs: [{ id: uuidGen(), label: 'My board', type: ElementTypes.TAB }],
  currentTab: {},
  editedTab: {}
};

export default createReducer(initialState, {
  [RESET_BOARD]: () => ({ ...initialState, currentTab: initialState.tabs[0] }),
  [SET_CURRENT_TAB]: (state, action) => ({
    ...state,
    currentTab: action.payload || initialState.tabs[0]
  }),
  [SAVE_TAB_FORM]: (state, action) => ({
    ...state,
    tabs: state.tabs.map(el => el.id === action.payload.id ?
      { ...el, label: action.payload.label } : el)
  }),
  [LOAD_TABS]: (state, action) => {
    const tabs = !action.payload.length ? [{ id: uuidGen(), label: 'My board', type: ElementTypes.TAB }] : action.payload;
    return ({
      ...state,
      tabs,
    })
  } ,
  [CREATE_TAB]: (state) => {
    const id = uuidGen();
    const tab = { id, label: 'New board', type: ElementTypes.TAB };
    return ({
      ...state,
      tabs: [...state.tabs, tab],
      currentTab: tab
    });
  },
  [HANDLE_EDIT_TAB]: (state, action) => ({
    ...state,
    editedTab: action.payload
  }),
  [SET_INITIAL_TAB]: (state) => ({
    ...state,
    currentTab: state.tabs[0]
  }),
  [IMPORT_TABS_FROM_FILE]: (state, action) => ({
    ...state,
    tabs: action.payload,
  }),
  [DELETE_TAB]: (state, action) => ({
    ...state,
    tabs: state.tabs.filter(el => el.id !== action.payload )
  }),

});
