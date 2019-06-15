declare const module: any;

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { createBrowserHistory as createHistory } from 'history'
import { Provider } from 'react-redux';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { App } from './components';

import configureStore from './store/configureStore';

// создаем миддлевары ()
const browserHistory = createHistory();

// создаем стор
const store = configureStore();

const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <ConnectedRouter history={browserHistory}>
        <App />
      </ConnectedRouter>
    </Provider>,
    document.querySelector('app'),
  );
};

render();
