import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import createStore from './store/store';
import ApiClient from './apiclient/ApiClient';
import {signup, getOtp} from './reducer/auth.js'

const client = new ApiClient();
const store = createStore(null, client, window.__data);


class UserSignup extends React.Component {

    constructor(props)
    {
        super(props);
        this.state = {
        	phone: '',
            phoneLocked: false,
            otp: '',
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

    handleOtpChange = (event) => {
        this.setState({otp: event.target.value});
    }

    checkValidPhone = (number) => {
        if (!number) {
            return false
        }

        return /(9|8|7)[0-9]{9}/.test(number)
    }

    checkValidOTP = (number) => {
        if (!number) {
            return false
        }

        return /[0-9]{4}/.test(number)
    }

    handleSignup = (e) => {
    	e.preventDefault();
    	if (this.props.auth.inProgress) {
    		return
    	}
    	
    	this.setState({error:''})
    	if(!this.checkValidOTP(this.state.otp)) {
            this.setState({error:'*Please enter a valid OTP'})
        } else if (!this.state.password) {
    		this.setState({error:'*Please enter a valid password'})
    	} else {
    		this.props.signup(this.state.phone, 
                this.state.otp,
                this.props.auth.getOtpUser.name, 
                this.state.password);
    	}

    }

    handleGetOTP = (e) => {
        e.preventDefault();
        if (this.props.auth.getOtpProgress) {
            return
        }
        
        this.setState({error:''})
        if(!this.checkValidPhone(this.state.phone)) {
            this.setState({error:'*Please enter a 10 digit phone number'})
        } else {
            this.props.getOtp(this.state.phone);
        }
    }

    viewAction = () => {
        if (this.props.auth.getOtpSuccess) {
            if (!this.props.auth.getOtpUser) {
                return
            }

            var signupActionClass = "login-action ";
            var signupActionContent = "Submit"
            if (this.props.auth.signupProgress) {
                signupActionClass = signupActionClass + "disabled";
                signupActionContent = (
                    <div className="loader"></div>
                )
            }

            return (
                <button className={signupActionClass} onClick={this.handleSignup}>
                    {signupActionContent}
                </button>
            )

        } else {
            var signupActionClass = "login-action ";
            var signupActionContent = "Get OTP"
            if (this.props.auth.getOtpProgress) {
                signupActionClass = signupActionClass + "disabled";
                signupActionContent = (
                    <div className="loader"></div>
                )
            }

            return (
                <button className={signupActionClass} onClick={this.handleGetOTP}>
                    {signupActionContent}
                </button>
            )
        }
    }

    viewInputs = () => {
        if (!this.props.auth.getOtpSuccess) {
            return (
                <input value={this.state.phone} 
                    onChange={this.handlePhoneChange} type="number" 
                    name="phone" placeholder="Phone" />
            )
        } else {
            if (!this.props.auth.getOtpUser) {
                return (
                    <div className="login-error">
                        There is no account found for this number. Please create new account.
                    </div>
                )
            }
            
            return (
                <div>
                    <input value={this.state.otp} 
                        onChange={this.handleOtpChange} type="number" 
                        name="otp" placeholder="Enter OTP" />
                    <input value={this.state.password} 
                        onChange={this.handlePasswordChange} type="password" 
                        name="password" placeholder="New Password" />
                </div>
            )
        }

    }

    render()
    {
        if (this.props.auth.isLoggedIn) {
            window.location.href = "/";
        }

        return (
            <div className="login">
                <h2 className="login-title">Set new password</h2>
                <form className="login-form">
    		      {this.viewInputs()}
    		      <div className="login-error">
    		      	{this.state.error || this.props.auth.signupError || this.props.auth.getOtpError}
    		      </div>
    		      {this.viewAction()}
    		    </form>
            </div>
        );
	}
}

const UserSignupContainer = connect(
    ((state) => ({ auth: state.auth })) ,
    {signup: signup, getOtp: getOtp}
)(UserSignup);

if (window.mountUserPassword){
    ReactDOM.render(
            <Provider store={store} key="provider">
                <UserSignupContainer {...pageProps} />
            </Provider>,
            window.mountUserPassword
        );
}
