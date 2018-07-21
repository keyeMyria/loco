import 'react-dates/initialize';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { HashRouter } from "react-router-dom";

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Sidebar from './Sidebar';
import Routes from "./Routes";
import { initTeamId } from '../../reducer/dashboard';

class Dashboard extends Component {

	constructor(props) {
        super(props);
        this.props.initTeamId(this.props.team_id, this.props.team_name);
    }

    render() {

        return (
            <HashRouter>
                <MuiThemeProvider>
                    <div className="dashboard-holder">
                	   <Sidebar />
                       <Routes />
                    </div>
                </MuiThemeProvider>
            </HashRouter>
        );
	}
}

export default Dashboard = connect(
    (state) => ({}), 
    {initTeamId: initTeamId}
)(Dashboard)


