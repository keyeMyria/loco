import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createStore from './store/store';
import ApiClient from './apiclient/ApiClient';
import Teams from './components/Teams/teams';

const client = new ApiClient();
const store = createStore(null, client, window.__data);

if (window.mountUserTeams){
    ReactDOM.render(
            <Provider store={store} key="provider">
                <Teams {...pageProps} />
            </Provider>,
            window.mountUserTeams
        );
}