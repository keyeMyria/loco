import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import { getTeams } from '../../reducer/teams.js'

class UserTeams extends Component {

    componentDidMount() {
        this.props.getTeams();
    }

    render()
    {
        var teams = this.props.teams.teams.map((team) => 
            <a 
                className="user-team" 
                href={'/web/teams/' + team.team.id}
                key={team.team.id}>

                <p className="user-team-name">{team.team.name}</p>
                <p className="user-team-role">{team.role}</p>
            </a>
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
                     <Link to={"/create" } className="user-team-action" >
                        <i className="material-icons user-team-icon">group</i>
                        <p className="user-team-name">Create new team</p>
                    </Link>
                     <Link to={"/join" } className="user-team-action">
                        <i className="material-icons user-team-icon">group_add</i>
                        <p className="user-team-name">Join a team</p>
                    </Link>
                    {teams}
                </ul>
            )
        }
        
        return (
            <section className="section-user-teams">
                <h1>Your teams</h1>
                {content}
            </section>
        );
    }
}

export default UserTeams = connect(
    ((state) => ({ teams: state.teams })) ,
    {getTeams: getTeams,}
)(UserTeams);