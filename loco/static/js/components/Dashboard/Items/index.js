import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DateRangePicker } from 'react-dates';

import { getItems } from '../../../reducer/dashboard';
import ItemListCard from './ItemListCard'

class Items extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            "itemsData": []
        } 
    }

    componentWillMount() {
        this.props.getItems("61");
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.itemsData) {
            this.state.itemsData = nextProps.itemsData
        }
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
                <section className="filter-bar">
                    <section className="section-chip-filter">
                        <section className="filter-chip">
                            <p className="filter-chip-text">Filter</p>
                            <i className="material-icons filter-chip-icon">filter_list</i>
                        </section>
                        <section className="filter-chip active">
                            <p className="filter-chip-text">Filter</p>
                            <i className="material-icons filter-chip-icon">close</i>
                        </section>                        
                    </section>
                    <section className="section-query-filter">
                        <section className="query-filter-holder">
                            <i className="material-icons filter-query-icon">search</i>
                            <input className="filter-query-input" type="text" placeholder="Search" />
                        </section>
                    </section>
                    <section className="section-date-filter">
                        <section className="date-filter-holder">
                            <DateRangePicker
                              startDate={this.state.startDate} // momentPropTypes.momentObj or null,
                              startDateId="your_unique_start_date_id" // PropTypes.string.isRequired,
                              endDate={this.state.endDate} // momentPropTypes.momentObj or null,
                              endDateId="your_unique_end_date_id" // PropTypes.string.isRequired,
                              onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })} // PropTypes.func.isRequired,
                              focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
                              onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
                            />
                        </section>
                    </section>                    
                </section>
                <ItemListCard itemsData={this.state.itemsData} />
			</div>            
        );
	}
}

export default Items = connect(
    (state) => ({ itemsData: state.dashboard.itemsData, inProgress: state.dashboard.inProgress}), 
    {getItems: getItems}
)(Items)



