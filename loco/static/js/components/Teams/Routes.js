import React, { Component } from 'react';
import { Route } from "react-router-dom";

import CreateTeam from './CreateTeam';
import JoinTeam from './JoinTeam';
import UserTeams from './UserTeams';

export default class Routes extends Component {

    render() {

        return (
            <div className="content">
            	<Route exact path="/" component={UserTeams}/>
                <Route exact path="/create" component={CreateTeam}/>
                <Route exact path="/join" component={JoinTeam}/>
            </div>
        );
	}
}


