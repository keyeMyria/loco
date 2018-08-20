import React, { Component } from 'react';
import { connect } from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import DeleteDialog from '../DeleteDialog';
import TaskListCard from '../Tasks/TaskListCard';
import UserLogCard from './UserLogCard';
import UserPlanCard from './UserPlanCard';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import { 
    getUserDetails, 
    clearState, 
    getUserTasksInit,
    getUserTasksNext,
    getUserTasksPrev,
    getUserLogsInit,
    getUserLogsNext,
    getUserLogsPrev ,
    getUserPlansInit,
    getUserPlansNext,
    getUserPlansPrev,
    removeUser } from '../../../reducer/users';

class UserDetail extends Component {
    
    constructor(props) {
        super(props); 
        this.state = {
            isOpenRemoveUserDialog: false
        };
    }

    formatDate = (date) => {
        var d = new Date(date);
        return d.toLocaleString();
    };

    closeRemoveUserDialog = () => {
        this.setState({
            isOpenRemoveUserDialog: false
        })
    };

    openRemoveUserDialog = () => {
        this.setState({
            isOpenRemoveUserDialog: true
        })
    };

    handleRemoveUser = () => {
        this.props.removeUser(this.props.match.params.id);
        this.setState({
            isOpenRemoveUserDialog: false
        })
    }

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

    viewUserPlans = () => {
        if (!this.props.userDetailsData) {
            return
        }

        return (
            <UserPlanCard
                listTitle={"Tour plan by " + this.props.userDetailsData.user.name}
                plans={this.props.userPlans}
                getUserPlansInit={() => this.props.getUserPlansInit(this.props.match.params.id)}
                getUserPlansNext={() => this.props.getUserPlansNext(this.props.match.params.id)} 
                getUserPlansPrev={() => this.props.getUserPlansPrev(this.props.match.params.id)} 
            />
        )
    }

    viewRemoveUserDialog = () => {
        if (!this.props.userDetailsData) {
            return
        }

        const removeUserDialogActions = [
          <FlatButton
            label="Cancel"
            primary={false}
            onClick={this.closeRemoveUserDialog}
          />,
          <FlatButton
            label="YES"
            primary={true}
            onClick={this.handleRemoveUser}
          />,
        ];

        return (
            <Dialog
              title="Remove user from team"
              actions={removeUserDialogActions}
              modal={false}
              open={this.state.isOpenRemoveUserDialog}
              onRequestClose={this.closeRemoveUserDialog}
            >
              {'Are you sure you want to remove "' + this.props.userDetailsData.user.name + '" from team?'}
            </Dialog>
        );
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

                { (props.removeUserSuccess) &&
                    <section className="success-msg-holder">
                        <p className="success-msg">
                        User removed from team successfully
                        </p>
                    </section>
                }

                { (props.removeUserError) &&
                    <section className="success-msg-holder">
                        <p className="success-msg">
                        {props.removeUserError}
                        </p>
                    </section>
                }

                <header className="header">
                    <h1 className="title">
                        {"User " + this.props.match.params.id}
                    </h1>
                    <section className="header-actions">
                        <p className="header-action" onClick={this.openRemoveUserDialog}>
                            <i className="material-icons header-action-icon">delete_outline</i>
                            <p className="header-action-name">Remove</p>
                        </p>
                        <p className="header-action" onClick={this.openDialog}>
                            <i className="material-icons header-action-icon">delete_outline</i>
                            <p className="header-action-name">Change Role</p>
                        </p>
                    </section>
                    {this.viewRemoveUserDialog()}
                </header>

                <section className="content-scroller">
                {this.viewUserDetails()}
                {this.viewUserTasks()}
                {this.viewUserLogs()}
                {this.viewUserPlans()}
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
        userPlans: state.users.userPlans,
        removeUserProgress: state.users.removeUserProgress,
        removeUserError: state.users.removeUserError,
        removeUserSuccess: state.users.removeUserSuccess,
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
        getUserPlansInit: getUserPlansInit,
        getUserPlansNext: getUserPlansNext,
        getUserPlansPrev: getUserPlansPrev,
        removeUser: removeUser,
    }
)(UserDetail)



