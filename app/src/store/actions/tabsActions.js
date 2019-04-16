import * as actions from '../../constants/actionConstants';

export function setCurrentTab(tab) {
  return {
    type: actions.SET_CURRENT_TAB,
    payload: tab,
  };
}

export function createTab() {
  return {
    type: actions.CREATE_TAB,
  };
}

export function loadTabs(tabs) {
  return {
    type: actions.LOAD_TABS,
    payload: tabs,
  };
}

export function editTab(tab) {
  return {
    type: actions.HANDLE_EDIT_TAB,
    payload: tab,
  };
}

export function tabFormRequest(form) {
  return {
    type: actions.TAB_FORM_REQUEST,
    payload: form,
  }
}

export function saveTabForm(values) {
  return {
    type: actions.SAVE_TAB_FORM,
    payload: values,
  };
}

export function setInitialTab() {
  return {
    type: actions.SET_INITIAL_TAB,
  };
}

export function importTabsFromFile(tabs) {
  return {
    type: actions.IMPORT_TABS_FROM_FILE,
    payload: tabs,
  }
}

export function deleteTab(id) {
  return {
    type: actions.DELETE_TAB,
    payload: id,
  }
}
