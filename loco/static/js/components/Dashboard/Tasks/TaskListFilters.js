import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DateRangePicker } from 'react-dates';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {searchTasks, filterTasks, filterTasksDate} from '../../../reducer/tasks.js'
import Filter from '../Filter';

const filterMap = {
    "City": "city",
    "State": "state",
    "Merchant": "merchant_name",
    "Agent": "created_by_name",
    "Merchant Type": "merchant_type",
    "Sales Type": "sales_type"
}

class TasktListFilters extends Component {

    constructor(props) {
        super(props)
        this.state = {
            openPopover: false,
            filters: [],
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
        this.props.searchTasks(query);
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
            filters: filters,
            openPopover: false,
        });
    }

    removefilter = (index) => {
        let filters = this.state.filters;
        filters.splice(index, 1);
        this.setState({
            filters: filters
        });
        
        this.props.filterTasks(filters);
    }

    onFilterChange = (searchText, index) => {
        let filters = this.state.filters;
        filters[index].value = searchText
        this.setState({
            filters: filters
        });

        this.props.filterTasks(filters);
    }

    onDatesChange = (startDate, endDate) => {
        let startDateString = "", endDateString = "";
        if(startDate) {
            startDateString =  startDate.toISOString();
        }
        if(endDate) {
            endDateString =  endDate.toISOString();
        }
        this.setState({ startDate, endDate, startDateString, endDateString });
        if(startDateString && endDateString) {
            this.props.filterTasksDate(startDateString, endDateString);
        }
    }

    render() {
        let tasks = this.props.tasks;
        
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
                            { Object.keys(filterMap).map(filter => {
                                return (
                                    <MenuItem 
                                        primaryText={filter} 
                                        onClick={(ev) => {this.handleFilterClick(ev, filter)}}
                                        key={filter} />
                                    )
                                })
                            }
                        </Menu>
                    </Popover>
                </section>
                <section className="section-query-filter">
                    <section className="query-filter-holder">
                        <i className="material-icons filter-query-icon">search</i>
                        <input className="filter-query-input" type="text" 
                            placeholder="Search" value={tasks.query} 
                            onChange={this.handleQueryChange} />
                    </section>
                </section>
                <section className="section-date-filter">
                    <section className="date-filter-holder">
                        <DateRangePicker
                          startDate={this.state.startDate}
                          startDateId="start_date_id"
                          endDate={this.state.endDate}
                          endDateId="end_date_id"
                          onDatesChange={({ startDate, endDate }) => this.onDatesChange(startDate, endDate)}
                          focusedInput={this.state.focusedInput}
                          onFocusChange={focusedInput => this.setState({ focusedInput })}
                        isOutsideRange={() => false}
                        numberOfMonths={1}
                        />
                    </section>
                </section>
                {   this.state.filters.map((filter, index) => {
                        return(
                            <Filter 
                                label={filter.type} 
                                data={filter.data}
                                key={index}
                                index={index}
                                remove={this.removefilter}
                                onQueryChange={this.onFilterChange} />
                        )
                    }) 
                }       
            </section>
        );
    }

}

export default connect(
    ((state) => ({ tasks: state.tasks })) ,
    {searchTasks: searchTasks, filterTasks: filterTasks, filterTasksDate: filterTasksDate}
)(TasktListFilters);



