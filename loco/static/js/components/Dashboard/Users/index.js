import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import AccountMenu from '../../common/accountMenu';
import UserListCard from './UserListCard';
import UserListFilters from './UserListFilters';

import {clearState, getUsersInit, getUsersNext, getUsersPrev} from '../../../reducer/users';

class Users extends Component {
    
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        this.props.clearState();
    }

    closeAddUserDialog = () => {
        this.setState({
            openAddUserDialog: false
        })
    };

    render() {
        const addUserActions = [
              <FlatButton
                label="Done"
                primary={true}
                keyboardFocused={true}
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
                        <p className="header-action" onClick={this.openDialog}>
                            <i className="material-icons header-action-icon">delete_outline</i>
                            <p className="header-action-name">Add user</p>
                        </p>
                        <Dialog
                            title="Add user"
                            actions={addUserActions}
                            modal={false}
                            open={this.state.openAddUserDialog}
                            onRequestClose={this.closeAddUserDialog}
                        >
                          Share following link with user on a mobile device
                        </Dialog>
                    </section>
                    
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
    (state) => ({team_name: state.dashboard.team_name, users: state.users}), 
    {
        clearState:clearState, 
        getUsersInit: getUsersInit, 
        getUsersNext: getUsersNext, 
        getUsersPrev:getUsersPrev
    }
)(Users)



