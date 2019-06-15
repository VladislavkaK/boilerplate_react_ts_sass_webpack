import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from '../store/reducers';
// import rootSaga from '../sagas';

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();

  return {
    ...createStore(rootReducer, composeWithDevTools(
      applyMiddleware(sagaMiddleware),
    )),
    // runSaga: sagaMiddleware.run(rootSaga)
  }
};

export default configureStore;
