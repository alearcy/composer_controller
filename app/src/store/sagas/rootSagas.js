import { all } from 'redux-saga/effects';
import boardSagasWatcher from './boardSagas';

export default function* rootSaga() {
  yield all([
    boardSagasWatcher(),
  ]);
}
