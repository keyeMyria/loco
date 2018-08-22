import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from "react-router-dom";
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import { joinTeam } from '../../reducer/teams.js'

class JoinTeam extends Component {

    constructor(props) {
        super(props);

        this.state = {
            code: "",
            codeErrorText: ""
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.joinTeamData && nextProps.joinTeamData.team && nextProps.joinTeamData.team.id) {
            window.location.href = "/web/teams/" + nextProps.joinTeamData.team.id;
        }
    }

    onCodeChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            code: val,
            codeErrorText: ""
        });
    }

    handleSubmit = (ev) => {
        if (!this.state.code) {
            this.setState({
                codeErrorText: 'Please enter a valid code.',
            })
        } else{
            this.props.joinTeam(this.state.code);
        }
    }

    render()
    {
        const style = {
            margin: 12,
            display: "block",
            width: "100px",
            marginTop: "32px"
        };

        const buttonStyle = {
            backgroundColor : "#CB202D"
        }

        return (
            <section className="section-user-teams">
                <h1>Join A Team</h1>

                { this.props.error &&
                    <section className="success-msg-holder" >
                        <p className="success-msg error-msg">{ this.props.error }</p>
                    </section>
                }

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
                                hintText="Enter Team Invite Code"
                                onChange={this.onCodeChange}
                                value={this.state.code}
                                errorText={this.state.codeErrorText}
                                floatingLabelText="Team Invite Code"
                                style={{ display:"block"}}
                                name="code" />
                            <RaisedButton 
                                label="SUBMIT" 
                                primary={true} 
                                style={style} 
                                buttonStyle = {buttonStyle}
                                backgroundColor = "#CB202D"
                                onClick={this.handleSubmit} />
                        </div>
                        )
                }
            </section>
        );
    }
}

export default JoinTeam = connect(
    ((state) => ({ 
        inProgress: state.teams.inProgress, 
        joinTeamData: state.teams.joinTeamData,
        error: state.teams.joinTeamError,
    })) ,
    {
        joinTeam: joinTeam,
    }
)(JoinTeam);