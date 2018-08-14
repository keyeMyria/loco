import React, { Component } from 'react';
import { connect } from 'react-redux';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {logout} from '../../reducer/auth';

class AccountMenu extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            openAccountMenu: false
        }
    }

    handleAccountMenu = (event) => {
        event.preventDefault();
        this.setState({
            openAccountMenu: !this.state.openAccountMenu,
            anchorAccountMenu: event.currentTarget,
        });
    }

    accountMenuClose = () => {
        this.setState({
            openAccountMenu: false
        });
    }

    logout = () => {
        this.props.logout()
    }

    render() {

        return (
            <section className="profile-menu">
                <img onClick={this.handleAccountMenu} src="/static/images/person_white.png" />
                <Popover
                    open={this.state.openAccountMenu}
                    anchorEl={this.state.anchorAccountMenu}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.accountMenuClose}
                    animation={PopoverAnimationVertical} >
                    <Menu>
                        <MenuItem 
                            primaryText="Logout" 
                            onClick={this.logout} />
                    </Menu>
                </Popover>
            </section>          
        );
    }
}

export default AccountMenu = connect(
    (state) => ({}), 
    {
        logout:logout,
    }
)(AccountMenu)



