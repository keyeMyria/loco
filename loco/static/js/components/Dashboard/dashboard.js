import 'react-dates/initialize';
import React, { Component } from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Sidebar from './sidebar';

export default class Dashboard extends Component {

    render() {

        return (
            <MuiThemeProvider>
            	<Sidebar />
            </MuiThemeProvider>
        );
	}
}



