import { DateRangePicker } from 'react-dates';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {searchItems} from '../../../reducer/items.js'

class ItemListFilters extends Component {

    constructor(props) {
        super(props)
        this.state = {} 
    }

    handleQueryChange = (event) => {
        var query = event.target.value;
        this.props.searchItems(query);
    }

    render() {
        let items = this.props.items;

        return (
            <section className="filter-bar item-filter-bar">
                <section className="section-query-filter">
                    <section className="query-filter-holder">
                        <i className="material-icons filter-query-icon">search</i>
                        <input className="filter-query-input" type="text" 
                            placeholder="Search" value={items.query} 
                            onChange={this.handleQueryChange} />
                    </section>
                </section>              
            </section>
        );
    }

}

export default connect(
    ((state) => ({ items: state.items })) ,
    {searchItems: searchItems,}
)(ItemListFilters);



