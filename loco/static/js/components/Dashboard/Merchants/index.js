import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";

import MerchantListCard from './MerchantListCard'
import MerchantListFilters from './MerchantListFilters'

class Merchants extends Component {
    
    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className="content-holder">
                <header className="header">
                    <h1 className="title">Merchants</h1>
                    <a className="header-team" href="/web/teams">
                        <p className="header-team-name">{this.props.team_name}</p>
                        <i className="material-icons header-team-icon">arrow_drop_down</i>
                    </a>
                    <section className="header-actions">
                        <Link to="/merchants/create" className="header-action">
                            <i className="material-icons header-action-icon">create</i>
                            <p className="header-action-name">NEW</p>
                        </Link>
                        <Link to="/merchants/csv" className="header-action">
                            <i className="material-icons header-action-icon">vertical_align_top</i>
                            <p className="header-action-name">UPLOAD</p>
                        </Link>
                    </section>
                    <section className="profile-menu">
                        <img src="/static/images/person_white.png" />
                    </section>
                </header>
                <section className="content-scroller">
                    <MerchantListFilters />
                    <MerchantListCard />
                </section>
            </div>            
        );
    }
}

export default Merchants = connect(
    (state) => ({team_name: state.dashboard.team_name}), 
    {}
)(Merchants)



