import { createSelector } from 'reselect';

export const getElements = state => state.elements.elements || [];
export const getEditedElementId = state => state.elements.editedElementId;
export const getEditedElement = createSelector(
  getElements,
  getEditedElementId,
  (elements, id) => elements.find(e => e.id === id) || {}
);
