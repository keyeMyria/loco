import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from "react-router-dom";
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import { createTeam } from '../../reducer/teams.js'

class CreateTeam extends Component {

    constructor(props) {
        super(props);

        this.state = {
            name: "",
            nameErrorText: ""
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.teamData && nextProps.teamData.id) {
            window.location.href = "/web/teams/" + nextProps.teamData.id;
        }
    }

    onNameChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            "name": val,
            nameErrorText: ""
        });
    }

    handleSubmit = (ev) => {
        if (!this.state.name) {
            this.setState({
                nameErrorText: 'Please enter a valid name.',
            })
        } else{
            this.props.createTeam(this.state.name);
        }
    }

    render()
    {
        const style = {
            margin: 12,
            display: "block",
            marginTop: "32px"
        };

        const buttonStyle = {
            backgroundColor : "#CB202D"
        }

        return (
            <section className="section-user-teams">
                <h1>Create Team</h1>
                { this.props.inProgress
                    ? (
                        <section className="detail-card">
                            <section className="detail-card-loader-holder">
                                <section className="loader detail-card-loader"></section>
                            </section>
                        </section>
                    )
                    : (
                        <div className="section-team-form-card">
                            <TextField
                                hintText=""
                                onChange={this.onNameChange}
                                value={this.state.name}
                                errorText={this.state.nameErrorText}
                                floatingLabelText="Team Name"
                                style={{ display:"block"}}
                                name="description" />
                            <RaisedButton 
                                label="CREATE A NEW TEAM" 
                                primary={true} 
                                style={style} 
                                backgroundColor = "#CB202D"
                                buttonStyle = {buttonStyle}
                                onClick={this.handleSubmit} />
                        </div>
                        )
                }
            </section>
        );
    }
}

export default CreateTeam = connect(
    ((state) => ({ inProgress: state.teams.inProgress, teamData: state.teams.teamData })) ,
    { createTeam: createTeam}
)(CreateTeam);