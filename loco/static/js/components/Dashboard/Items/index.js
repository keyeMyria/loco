import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import { DateRangePicker } from 'react-dates';

import ItemListCard from './ItemListCard'
import ItemListFilters from './ItemListFilters'

class Items extends Component {
    
    constructor(props) {
        super(props);
    }

    render() {

        return (
			<div className="content-holder">
                <header className="header">
				    <h1 className="title">Items</h1>
                    <a className="header-team" href="/web/teams">
                        <p className="header-team-name">{this.props.team_name}</p>
                        <i className="material-icons header-team-icon">arrow_drop_down</i>
                    </a>
                    <section className="profile-menu">
                        <img src="/static/images/person_white.png" />
                    </section>
                </header>
                <section className="content-scroller">
                    <ItemListFilters />
                    <Link to="/items/create" className="create-link">CREATE ITEM</Link>
                    <ItemListCard />
                </section>
			</div>            
        );
	}
}

export default Items = connect(
    (state) => ({team_name: state.dashboard.team_name}), 
    {}
)(Items)



