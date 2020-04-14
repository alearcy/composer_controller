import * as actions from '../../constants/actionConstants';

export function handleEditingMode() {
  return {
    type: actions.HANDLE_EDITING_MODE
  };
}

export function handleVisibilityMode() {
  return {
    type: actions.HANDLE_VISIBILITY_MODE
  };
}

export function exitEditingMode() {
  return {
    type   : actions.EXIT_EDITING_MODE,
    payload: false
  };
}

export function saveLayout() {
  return {
    type: actions.SAVE_LAYOUT
  };
}

export function loadSettings(settings) {
  return {
    type   : actions.LOAD_SETTINGS,
    payload: settings
  };
}

export function resetBoard() {
  return {
    type: actions.RESET_BOARD
  };
}

export function initBoard() {
  return {
    type: actions.INIT_BOARD
  };
}

export function initBoardDone() {
  return {
    type: actions.INIT_BOARD_DONE
  };
}

export function handleLoading(loading) {
  return {
    type   : actions.HANDLE_LOADING,
    payload: loading
  };
}

export function handleCloseDrawer() {
  return {
    type: actions.HANDLE_CLOSE_DRAWER
  };
}

export function handleOpenDrawer() {
  return {
    type: actions.HANDLE_OPEN_DRAWER
  };
}

export function exitEditingElement() {
  return {
    type: actions.EXIT_EDITING_ELEMENT
  };
}

export function saveSettingsForm(settings) {
  return {
    type   : actions.SAVE_SETTINGS_FORM,
    payload: settings
  };
}

export function importFromBkp(objs) {
  return {
    type   : actions.IMPORT_FROM_BKP,
    payload: objs
  };
}

export function importSettingsFromFile(settings) {
  return {
    type   : actions.IMPORT_SETTINGS_FROM_FILE,
    payload: settings
  };
}

export function handleConfirmation(status) {
  return {
    type: actions.HANDLE_CONFIRMATION,
    payload: status,
  }
}

export function setPublicIp(value) {
  return {
    type: actions.SET_IP,
    payload: value,
  }
}
