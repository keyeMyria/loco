import React, { Component } from 'react';
import { connect } from 'react-redux';

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
                    <section className="header-team">
                        <p className="header-team-name">Austro</p>
                        <i className="material-icons header-team-icon">arrow_drop_down</i>
                    </section>
                    <section class="profile-menu">
                        <img src="/static/images/person_white.png" />
                    </section>
                </header>
                <section className="content-scroller">
                    <ItemListFilters />
                    <ItemListCard />
                </section>
			</div>            
        );
	}
}

export default Items = connect(
    (state) => ({inProgress: state.dashboard.inProgress}), 
    {}
)(Items)



