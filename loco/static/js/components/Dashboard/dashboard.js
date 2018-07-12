import React, { Component } from 'react';
import { connect } from 'react-redux';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Sidebar from './sidebar';
import { initTeamId } from '../../reducer/dashboard';

class Dashboard extends Component {

	constructor(props) {
        super(props);
        this.props.initTeamId(this.props.team_id);
    }

    render() {

        return (
            <MuiThemeProvider>
            	<Sidebar />
            </MuiThemeProvider>
        );
	}
}

export default Dashboard = connect(
    (state) => ({}), 
    {initTeamId: initTeamId}
)(Dashboard)


