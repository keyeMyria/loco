import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import createStore from './store/store';
import ApiClient from './apiclient/ApiClient';
import {getTeams} from './reducer/teams.js'

const client = new ApiClient();
const store = createStore(null, client, window.__data);


class UserTeams extends React.Component {

    constructor(props)
    {
        super(props);
    }

    componentDidMount() {
        this.props.getTeams();
    }

    render()
    {
        var teams = this.props.teams.teams.map((team) => 
            <a className="user-team" href={'/web/teams/' + team.team.id}>{team.team.name}</a>
        );

        let content;
        if (this.props.teams.inProgress) {
            content = (
                <div className="teams-loader-container">
                    <div className="loader teams-loader"></div>
                </div>
            )
        } else {
            content = (
                <ul className="user-teams">
                    {teams}
                </ul>
            )
        }
        
        return (
            <section className="section-user-teams">
                <h1>Select team</h1>
                {content}
            </section>
        );
	}
}

const UserTeamsContainer = connect(
    ((state) => ({ teams: state.teams })) ,
    {getTeams: getTeams,}
)(UserTeams);


if (window.mountUserTeams){
    ReactDOM.render(
            <Provider store={store} key="provider">
                <UserTeamsContainer {...pageProps} />
            </Provider>,
            window.mountUserTeams
        );
}
