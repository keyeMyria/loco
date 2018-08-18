import { DateRangePicker } from 'react-dates';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {searchUsers} from '../../../reducer/users.js'

class UserListFilters extends Component {

    constructor(props) {
        super(props)
        this.state = {} 
    }

    handleQueryChange = (event) => {
        var query = event.target.value;
        this.props.searchUsers(query);
    }

    render() {
        let users = this.props.users;

        return (
            <section className="filter-bar user-filter-bar">
                <section className="section-query-filter">
                    <section className="query-filter-holder">
                        <i className="material-icons filter-query-icon">search</i>
                        <input className="filter-query-input" type="text" 
                            placeholder="Search" value={users.query} 
                            onChange={this.handleQueryChange} />
                    </section>
                </section>              
            </section>
        );
    }

}

export default connect(
    ((state) => ({ users: state.users })) ,
    {searchUsers: searchUsers,}
)(UserListFilters);



