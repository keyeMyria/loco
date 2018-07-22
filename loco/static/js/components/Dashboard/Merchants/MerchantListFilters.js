import React, { Component } from 'react';
import { connect } from 'react-redux';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {searchMerchants, filterMerchants} from '../../../reducer/merchants.js'
import Filter from '../Filter';

const filterMap = {
    "City": "city",
    "State": "state"
}

class MerchantListFilters extends Component {

    constructor(props) {
        super(props)
        this.state = {
            openPopover: false,
            filters: []
        };
    }

    handleClick = (event) => {
        event.preventDefault();
        this.setState({
            openPopover: true,
            anchorEl: event.currentTarget,
        });
    }

    handleRequestClose = () => {
        this.setState({
            openPopover: false,
        });
    }

    handleQueryChange = (event) => {
        var query = event.target.value;
        this.props.searchMerchants(query);
    }

    handleFilterClick = (event, type) => {
        event.preventDefault();
        let filters = this.state.filters
        let filter = {
            type: type,
            name: filterMap[type],
            value: "",
            data: []
        }

        filters.push(filter);

        this.setState({
            filters: filters
        });
    }

    removefilter = (index) => {
        let filters = this.state.filters;
        filters.splice(index, 1);
        this.setState({
            filters: filters
        });
    }

    onQueryChange = (searchText, index) => {
        let filters = this.state.filters;
        filters[index].value = searchText
        this.setState({
            filters: filters
        });

        this.props.filterMerchants(filters);
    };

    render() {
        let merchants = this.props.merchants;

        return (
            <section className="filter-bar">
                <section className="section-chip-filter">
                    <section className="filter-chip filter-chip-main" onClick={this.handleClick}>
                        <p className="filter-chip-text">Filter</p>
                        <i className="material-icons filter-chip-icon">filter_list</i>
                    </section>
                    <Popover
                        open={this.state.openPopover}
                        anchorEl={this.state.anchorEl}
                        anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                        targetOrigin={{horizontal: 'left', vertical: 'top'}}
                        onRequestClose={this.handleRequestClose}
                        animation={PopoverAnimationVertical} >
                        
                        <Menu>
                            <MenuItem 
                                primaryText="City" 
                                onClick={(ev) => {this.handleFilterClick(ev, "City")}} />
                            <MenuItem 
                                primaryText="State" 
                                onClick={(ev) => {this.handleFilterClick(ev, "State")}} />
                        </Menu>
                    </Popover>
                </section>
                <section className="section-query-filter">
                    <section className="query-filter-holder">
                        <i className="material-icons filter-query-icon">search</i>
                        <input className="filter-query-input" type="text" 
                            placeholder="Search" value={merchants.query} 
                            onChange={this.handleQueryChange} />
                    </section>
                </section>
                <section>
                    {   this.state.filters.map((filter, index) => {
                            return(
                                <Filter 
                                    label={filter.type} 
                                    data={filter.data}
                                    key={index}
                                    index={index}
                                    remove={this.removefilter}
                                    onQueryChange={this.onQueryChange} />
                            )
                        }) 
                    }
                </section>
            </section>
        );
    }

}

export default connect(
    ((state) => ({ merchants: state.merchants })) ,
    {searchMerchants: searchMerchants, filterMerchants:filterMerchants}
)(MerchantListFilters);



