import 'react-dates/initialize';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BrowserRouter } from "react-router-dom";

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
            <BrowserRouter basename={`/web/teams/${this.props.team_id}`}>
                <MuiThemeProvider>
                    <div className="dashboard-holder">
                	   <Sidebar />
                       <Routes />
                    </div>
                </MuiThemeProvider>
            </BrowserRouter>
        );
	}
}

export default Dashboard = connect(
    (state) => ({}), 
    {initTeamId: initTeamId}
)(Dashboard)


