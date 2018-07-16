import 'react-dates/initialize';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, NavLink, HashRouter } from "react-router-dom";

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Sidebar from './Sidebar';
import Merchants from "./Merchants/index";
import MerchantDetail from "./Merchants/MerchantDetail";
import Items from "./Items/index";
import ItemDetail from "./Items/ItemDetail";
import Orders from "./Orders/index";
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


