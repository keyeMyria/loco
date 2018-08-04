import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import createStore from './store/store';
import ApiClient from './apiclient/ApiClient';
import {login} from './reducer/auth.js'

const client = new ApiClient();
const store = createStore(null, client, window.__data);


class UserLogin extends React.Component {

    constructor(props)
    {
        super(props);
        this.state = {
        	phone: '',
        	password: '',
        	error: ''
        };
    }

    handlePhoneChange = (event) => {
    	this.setState({phone: event.target.value});
	}

    handlePasswordChange = (event) => {
    	this.setState({password: event.target.value});
	}

    checkValidNumber = (number) => {
    	if (!number) {
    		return false
    	}

        return /(9|8|7)[0-9]{9}/.test(number)
    }

    handleLogin = (e) => {
    	e.preventDefault();
    	if (this.props.auth.inProgress) {
    		return
    	}
    	
    	this.setState({error:''})
    	if(!this.checkValidNumber(this.state.phone)) {
    		this.setState({error:'*Please enter a 10 digit phone number'})
    	} else if (!this.state.password) {
    		this.setState({error:'*Please enter a valid password'})
    	} else {
    		console.log(this.props);
    		this.props.login(this.state.phone, this.state.password);
    	}

    }

    render()
    {
    	var loginActionClass = "login-action ";
    	var loginActionContent = "Login"
    	if (this.props.auth.inProgress) {
    		loginActionClass = loginActionClass + "disabled";
    		loginActionContent = (
    			<div className="loader"></div>
    		)
    	}

        if (this.props.auth.isLoggedIn) {
            window.location.href = "/";
        }

        return (
            <form className="login-form">
		      <input className="login-phone" value={this.state.phone} onChange={this.handlePhoneChange} type="text" name="phone" placeholder="Phone" />
		      <input className="login-password" value={this.state.password} onChange={this.handlePasswordChange} type="password" name="password" placeholder="Password" />
		      <div className="login-error">
		      	{this.state.error || this.props.auth.error}
		      </div>
		      <button className={loginActionClass} onClick={this.handleLogin}>
		      	{loginActionContent}
		      </button>
		    </form>
        );
	}
}

const UserLoginContainer = connect(
    ((state) => ({ auth: state.auth })) ,
    {login: login,}
)(UserLogin);

if (window.mountUserLogin){
    ReactDOM.render(
            <Provider store={store} key="provider">
                <UserLoginContainer {...pageProps} />
            </Provider>,
            window.mountUserLogin
        );
}
