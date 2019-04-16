import { takeLatest, put, select, call } from 'redux-saga/effects';
import axios from 'axios';
import {
  DELETE_ELEMENT,
  DELETE_TAB, EXIT_EDITING_ELEMENT,
  EXIT_EDITING_MODE, HANDLE_EDIT_ELEMENT, HANDLE_EDIT_TAB, IMPORT_FROM_BKP,
  INIT_BOARD, INIT_BOARD_DONE, LOAD_ELEMENTS, LOAD_TABS,
  RESET_BOARD, SAVE_ELEMENT_FORM,
  SAVE_LAYOUT, SAVE_SETTINGS_FORM, SAVE_TAB_FORM
} from '../../constants/actionConstants';
import {getElements, getEditedElement} from '../selectors/elementsSelectors';
import {getTabs} from '../selectors/tabsSelectors';
import {getEditingMode, getPublicIp, getSettings} from '../selectors/boardSelectors';
import {
  handleEditingMode,
  initBoardDone,
  handleLoading,
  handleCloseDrawer,
  handleConfirmation,
} from '../actions/boardActions';
import {
  deleteElementsFromTab,
  elementFormRequest,
  importElementFromFile,
  loadElements
} from '../actions/elementsAction';
import { loadTabs, tabFormRequest, setInitialTab, importTabsFromFile } from '../actions/tabsActions';
import {DrawerForms, ElementTypes} from '../../constants/genericConstants';
import { importSettingsFromFile, loadSettings } from '../actions';

function* saveLayoutSaga() {
  yield put(handleLoading(true));
  const isEditingMode = yield select(getEditingMode);
  try {
    const elementsStore = yield select(getElements);
    const tabsStore = yield select(getTabs);
    const settingsStore = yield select(getSettings);
    const publicIp = yield select(getPublicIp);
    const ip = process.env.NODE_ENV !== 'production' ? 'http://' + publicIp : '';
    axios.post(ip + '/db', {
      elements: elementsStore,
      tabs: tabsStore,
      settings: settingsStore
    })
  } catch (e) {
    console.error('Error saving layout', e);
  }
  if (isEditingMode) yield put(handleEditingMode());
  yield put(handleLoading(false));
}

function* initBoardSaga() {
  yield put(handleLoading(true));
  try {
    const publicIp = yield select(getPublicIp);
    const response = process.env.NODE_ENV !== 'production'
        ? yield call(axios.get, 'http://' + publicIp + '/db')
        : yield call(axios.get, '/db');
    const data = response.data;
    yield put(loadElements(data.elements));
    yield put(loadTabs(data.tabs));
    yield put(loadSettings(data.settings));
    yield put(setInitialTab());
    yield put(initBoardDone());
  } catch (e) {
    console.error('Error initializing layout', e);
  }
  yield put(handleLoading(false));
}

function* closeDrawerSaga() {
  yield put(handleCloseDrawer());
  yield put(handleConfirmation(false));
}

function* elementFormRequestSaga() {
  const element = yield select(getEditedElement);
  if (element.type === ElementTypes.BTN) {
    yield put(elementFormRequest(DrawerForms.BUTTON_FORM));
  } else if (element.type === ElementTypes.SLIDER) {
    yield put(elementFormRequest(DrawerForms.SLIDER_FORM));
  } else {
    yield put(elementFormRequest(DrawerForms.LABEL_FORM));
  }
}

function* tabFormRequestSaga() {
  yield put(tabFormRequest(DrawerForms.TAB_FORM));
}

function* importFromFileSaga(action) {
  const elements = action.payload.elements;
  const tabs = action.payload.tabs;
  const settings = action.payload.settings;
  yield put(importElementFromFile(elements));
  yield put(importTabsFromFile(tabs));
  yield put(importSettingsFromFile(settings));
  yield call(saveLayoutSaga);
  try {
    yield put(setInitialTab());
  } catch (e) {
    console.error('Error saving layout', e);
  }
}

function* deleteElemnentsFromTabSaga(action) {
  yield put(deleteElementsFromTab(action.payload));
  yield put(setInitialTab());
}

export default function* boardSagasWatcher() {
  yield takeLatest([SAVE_LAYOUT, SAVE_SETTINGS_FORM], saveLayoutSaga);
  yield takeLatest(INIT_BOARD, initBoardSaga);
  yield takeLatest(INIT_BOARD_DONE, saveLayoutSaga);
  yield takeLatest(EXIT_EDITING_MODE, initBoardSaga);
  yield takeLatest(RESET_BOARD, saveLayoutSaga);
  yield takeLatest([SAVE_ELEMENT_FORM, SAVE_TAB_FORM, LOAD_ELEMENTS, LOAD_TABS, SAVE_SETTINGS_FORM], closeDrawerSaga);
  yield takeLatest(HANDLE_EDIT_ELEMENT, elementFormRequestSaga);
  yield takeLatest(HANDLE_EDIT_TAB, tabFormRequestSaga);
  yield takeLatest(IMPORT_FROM_BKP, importFromFileSaga);
  yield takeLatest(DELETE_TAB, deleteElemnentsFromTabSaga);
  yield takeLatest([DELETE_TAB, DELETE_ELEMENT, EXIT_EDITING_ELEMENT], closeDrawerSaga);
}
