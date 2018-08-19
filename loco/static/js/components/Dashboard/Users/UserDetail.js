import React, { Component } from 'react';
import { connect } from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import DeleteDialog from '../DeleteDialog';
import TaskListCard from '../Tasks/TaskListCard';
import UserLogCard from './UserLogCard';

import { 
    getUserDetails, 
    clearState, 
    getUserTasksInit,
    getUserTasksNext,
    getUserTasksPrev,
    getUserLogsInit,
    getUserLogsNext,
    getUserLogsPrev } from '../../../reducer/users';

class UserDetail extends Component {
    
    constructor(props) {
        super(props); 
    }

    formatDate = (date) => {
        var d = new Date(date);
        return d.toLocaleString();
    };

    componentWillMount() {
        this.props.clearState();
        if(this.props.match.params.id) {
            this.props.getUserDetails(this.props.match.params.id);    
        }
        
    };

    onSerialChange = (ev, val) => {
        ev.preventDefault();
        this.setState({
            "serial": val
        });
    };

    viewUserDetails = () => {
    	if (this.props.getUserDetailsProgress) {
    		return (
                <section className="detail-card">
                    <section className="detail-card-loader-holder">
                        <section className="loader detail-card-loader"></section>
                    </section>
                </section>
            )
    	}

    	if (this.props.userDetailsData) {
    		let user = this.props.userDetailsData;
    		return (
                <section className="detail-card">
                    <div className="detail-card-content">
                        <article className="detail">
                            <img className="detail-img" src={user.user.photo} />
                        </article>
                        <article className="detail">
                            <p className="detail-title">Name</p>
                            <p className="detail-value">
                                {user.user.name}
                            </p>
                        </article>
                        <article className="detail">
                            <p className="detail-title">Role</p>
                            <p className="detail-value">
                                {user.role}
                            </p>
                        </article>
                        <article className="detail">
                            <p className="detail-title">Joined on</p>
                            <p className="detail-value">
                                {this.formatDate(user.created)}
                            </p>
                        </article>
                    </div>
                </section>
            )
    	}
    };

    viewUserTasks = () => {
        if (!this.props.userDetailsData) {
            return
        }

        return (
            <TaskListCard
                listTitle={"Orders by " + this.props.userDetailsData.user.name}
                tasks={this.props.userTasks}
                getTasksInit={() => this.props.getUserTasksInit(this.props.match.params.id)}
                getTasksNext={() => this.props.getUserTasksNext(this.props.match.params.id)} 
                getTasksPrev={() => this.props.getUserTasksPrev(this.props.match.params.id)} 
            />
        )
    }

    viewUserLogs = () => {
        if (!this.props.userDetailsData) {
            return
        }

        return (
            <UserLogCard
                listTitle={"Attendance sheet for " + this.props.userDetailsData.user.name}
                logs={this.props.userLogs}
                getUserLogsInit={() => this.props.getUserLogsInit(this.props.match.params.id)}
                getUserLogsNext={() => this.props.getUserLogsNext(this.props.match.params.id)} 
                getUserLogsPrev={() => this.props.getUserLogsPrev(this.props.match.params.id)} 
            />
        )
    }

    render() {

        const style = {
            margin: 12,
            display: "block",
            width: "60px",
            marginTop: "20px"
        };

        let props = this.props;
        return (
            <div className="content-holder">
                <header className="header">
                    <h1 className="title">
                        {"User " + this.props.match.params.id}
                    </h1>
                    <section className="header-actions">
                        <p className="header-action" onClick={this.openDialog}>
                            <i className="material-icons header-action-icon">delete_outline</i>
                            <p className="header-action-name">Remove</p>
                        </p>
                        <p className="header-action" onClick={this.openDialog}>
                            <i className="material-icons header-action-icon">delete_outline</i>
                            <p className="header-action-name">Change Role</p>
                        </p>
                    </section>
                </header>

                <section className="content-scroller">
                {this.viewUserDetails()}
                {this.viewUserTasks()}
                {this.viewUserLogs()}
                </section>
            </div>            
        );
    }
}

export default UserDetail = connect(
    (state) => ({ 
        team_id: state.dashboard.team_id, 
        userDetailsData: state.users.userDetailsData, 
        getUserDetailsProgress: state.users.getUserDetailsProgress, 
        userTasks: state.users.userTasks,
        userLogs: state.users.userLogs,
    }), 
    {
        getUserDetails: getUserDetails, 
        clearState: clearState, 
        getUserTasksInit: getUserTasksInit,
        getUserTasksNext: getUserTasksNext,
        getUserTasksPrev: getUserTasksPrev,
        getUserLogsInit: getUserLogsInit,
        getUserLogsNext: getUserLogsNext,
        getUserLogsPrev: getUserLogsPrev,
    }
)(UserDetail)



