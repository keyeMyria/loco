import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import createStore from './store/store';
import ApiClient from './apiclient/ApiClient';
import Dashboard from './components/Dashboard/dashboard'

const client = new ApiClient();
const store = createStore(null, client, window.__data);

injectTapEventPlugin();

if (window.mountDashboard){
    ReactDOM.render(
            <Provider store={store} key="provider">
                <Dashboard {...pageProps} />
            </Provider>,
            window.mountDashboard
        );
}
