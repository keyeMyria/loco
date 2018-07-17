import { DateRangePicker } from 'react-dates';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {searchMerchants} from '../../../reducer/merchants.js'

class MerchantListFilters extends Component {

    constructor(props) {
        super(props)
        this.state = {} 
    }

    handleQueryChange = (event) => {
        var query = event.target.value;
        this.props.searchMerchants(query);
    }

    render() {
        let merchants = this.props.merchants;

        return (
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
                        <input className="filter-query-input" type="text" 
                            placeholder="Search" value={merchants.query} 
                            onChange={this.handleQueryChange} />
                    </section>
                </section>
                <section className="section-date-filter">
                    <section className="date-filter-holder">
                        <DateRangePicker
                          startDate={this.state.startDate}
                          startDateId="your_unique_start_date_id"
                          endDate={this.state.endDate}
                          endDateId="your_unique_end_date_id"
                          onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })}
                          focusedInput={this.state.focusedInput}
                          onFocusChange={focusedInput => this.setState({ focusedInput })}
                        />
                    </section>
                </section>                    
            </section>
        );
    }

}

export default connect(
    ((state) => ({ merchants: state.merchants })) ,
    {searchMerchants: searchMerchants,}
)(MerchantListFilters);



