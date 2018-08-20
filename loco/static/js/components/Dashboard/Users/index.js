import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import AccountMenu from '../../common/accountMenu';
import UserListCard from './UserListCard';
import UserListFilters from './UserListFilters';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

import {clearState, getUsersInit, getUsersNext, getUsersPrev} from '../../../reducer/users';

class Users extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isOpenAddUserDialog: false
        };
    }

    componentWillMount() {
        this.props.clearState();
    }

    closeAddUserDialog = () => {
        this.setState({
            isOpenAddUserDialog: false
        })
    };

    openAddUserDialog = () => {
        this.setState({
            isOpenAddUserDialog: true
        })
    };

    render() {
        const addUserDialogActions = [
          <FlatButton
            label="Done"
            primary={true}
            onClick={this.closeAddUserDialog}
          />,
        ];

        return (
            <div className="content-holder">
                <header className="header">
                    <h1 className="title">Users</h1>
                    <a className="header-team" href="/web/teams">
                        <p className="header-team-name">{this.props.team_name}</p>
                        <i className="material-icons header-team-icon">arrow_drop_down</i>
                    </a>

                    <section className="header-actions">
                        <p className="header-action" onClick={this.openAddUserDialog}>
                            <i className="material-icons header-action-icon">person_add</i>
                            <p className="header-action-name">Add user</p>
                        </p>
                    </section>

                    <Dialog
                      title="Add new user"
                      actions={addUserDialogActions}
                      modal={false}
                      open={this.state.isOpenAddUserDialog}
                      onRequestClose={this.closeAddUserDialog}
                    >
                      {'User code "' + this.props.team_code + '" to join new team. Please share this code with new users.'}
                    </Dialog>
                    
                    <AccountMenu />
                </header>
                <section className="content-scroller">
                    <UserListFilters />
                    <UserListCard 
                        users={this.props.users}
                        getUsersInit={this.props.getUsersInit}
                        getUsersNext={this.props.getUsersNext} 
                        getUsersPrev={this.props.getUsersPrev} 
                    />
                </section>
            </div>            
        );
    }
}

export default Users = connect(
    (state) => ({
        team_name: state.dashboard.team_name, 
        team_code: state.dashboard.team_code, 
        users: state.users
    }), 
    {
        clearState:clearState, 
        getUsersInit: getUsersInit, 
        getUsersNext: getUsersNext, 
        getUsersPrev:getUsersPrev
    }
)(Users)



