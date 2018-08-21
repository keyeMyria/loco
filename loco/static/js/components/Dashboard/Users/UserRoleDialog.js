import React, { Component } from 'react';
import { connect } from 'react-redux';

import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import {changeUserRole} from '../../../reducer/users';

class UserRoleDialog extends Component {
  state = {
    open: true,
    role: this.props.role ? "member" :  "admin"
  };

  handleOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    this.props.closeDialog();
    this.setState({open: false});
  };

  handleChange = (event, value) => {
    this.setState({
      role: value
    });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.success) {
      window.location.reload();
    }
  }

  handleSubmit = (event) => {
    this.props.changeUserRole(this.props.user_id, this.props.team_id, this.state.role);
  }

  render() {
    const closeStyle = {
      position: 'absolute',
      top: '12px',
      right: '16px',
      cursor: 'pointer'
    }

    const headStyle = {
      textAlign: 'center',
      fontSize: '20px',
      fontWeight: 'bold'
    }

    const numStyle = {
      textAlign: 'center',
      marginTop: '8px'
    }

    const buttonStyle = {
      textAlign: 'center',
      display: 'block',
    }

    const containerStyle = {
      width: '100%',
      height: '100%',
      paddingTop: '8px'
    }

    const contentStyle = {
      width: '320px'
    };

    const titleStyle = {
      padding: '16px',
      fontWeight: 'bold',
    }

    const radioButtonStyle = {
      marginBottom: 16,
    }

    return (
      <div style={containerStyle}>
          <Dialog
            title="Change Role"
            modal={false}
            open={this.state.open}
            onRequestClose={this.handleClose}
            contentStyle = {contentStyle}
            titleStyle = {titleStyle} >

            <i 
              className="material-icons" 
              style={closeStyle}
              onClick={() => this.handleClose()}>close</i>

            { this.props.showProgress
              ? (
                  <CircularProgress size={60} thickness={7} />
                )
              : (
                  <div>
                    <RadioButtonGroup 
                      name="role" 
                      defaultSelected={this.state.role}
                      onChange={this.handleChange}>

                      <RadioButton
                        value="member"
                        label="Member"
                        style={radioButtonStyle}/>

                      <RadioButton
                        value="admin"
                        label="Admin"
                        style={radioButtonStyle} />

                    </RadioButtonGroup>

                    <RaisedButton 
                      label="Submit" 
                      primary={true} 
                      style={buttonStyle} 
                      onClick={this.handleSubmit} />
                  </div>
                )
            }
          </Dialog>
      </div>
    );
  }
}

export default UserRoleDialog = connect(
    (state) => ({ 
        team_id: state.dashboard.team_id,
        showProgress: state.users.changeUserRoleProgress,
        success: state.users.changeUserRoleSuccess,
    }), 
    {
        changeUserRole: changeUserRole,
    }
)(UserRoleDialog)