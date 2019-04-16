import * as actions from '../../constants/actionConstants';

export function lockElement(obj) {
  return {
    type: actions.LOCK_ELEMENT,
    payload: obj.id
  };
}

export function updateElementSize(ref, id) {
  return {
    type: actions.UPDATE_ELEMENT_SIZE,
    payload: {
      ref,
      id
    }
  };
}

export function updateElementPos(pos, id) {
  return {
    type: actions.UPDATE_ELEMENT_POS,
    payload: {
      pos,
      id
    }
  };
}

export function loadElements(elements) {
  return {
    type: actions.LOAD_ELEMENTS,
    payload: elements
  };
}

export function saveElementForm(values) {
  return {
    type: actions.SAVE_ELEMENT_FORM,
    payload: values
  };
}

export function editElement(id) {
  return {
    type: actions.HANDLE_EDIT_ELEMENT,
    payload: id
  };
}

export function elementFormRequest(form) {
  return {
    type: actions.ELEMENT_FORM_REQUEST,
    payload: form
  };
}

export function createButton(currentTab) {
  return {
    type: actions.CREATE_BUTTON,
    payload: currentTab
  };
}

export function createSlider(currentTab) {
  return {
    type: actions.CREATE_SLIDER,
    payload: currentTab
  };
}

export function createLabel(currentTab) {
  return {
    type: actions.CREATE_LABEL,
    payload: currentTab
  };
}

export function importElementFromFile(elements) {
  return {
    type: actions.IMPORT_ELEMENTS_FROM_FILE,
    payload: elements,
  }
}

export function deleteElement(id) {
  return {
    type: actions.DELETE_ELEMENT,
    payload: id,
  }
}

export function deleteElementsFromTab(id) {
  return {
    type: actions.DELETE_ELEMENTS_FROM_TAB,
    payload: id,
  }
}
