import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import createStore from './store/store';
import ApiClient from './apiclient/ApiClient';
import {getTeams} from './reducer/teams.js'

const client = new ApiClient();
const store = createStore(null, client, window.__data);


class UserTeams extends React.Component {

    constructor(props)
    {
        super(props);
    }

    render()
    {

        return (
            <form className="login-form">
		      <input className="login-phone" value={this.state.phone} onChange={this.handlePhoneChange} type="number" name="phone" placeholder="Phone" />
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

const UserTeamsContainer = connect(
    ((state) => ({ teams: state.teams })) ,
    {getTeams: getTeams,}
)(UserTeams);

if (window.mountUserTeams){
    ReactDOM.render(
            <Provider store={store} key="provider">
                <UserTeamsContainer {...pageProps} />
            </Provider>,
            window.mountUserTeams
        );
}
