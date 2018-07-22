import React, { Component } from 'react';
import { connect } from 'react-redux';
import AutoComplete from 'material-ui/AutoComplete';

class Filter extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchText: ""
        }; 
    }

    handleChange = (searchText, index) => {
        this.props.onQueryChange(searchText, index);
        this.setState({
            searchText: searchText
        });

    };

    render() {
        let props = this.props;
        return (
            <section className="filter-chip active">
                <AutoComplete
                    floatingLabelText = {props.label}
                    filter = {AutoComplete.fuzzyFilter}
                    dataSource = {props.data}
                    maxSearchResults = {10}
                    onUpdateInput = {(searchText, data, params) => {this.handleChange(searchText, props.index)}}
                    searchText = {this.state.searchText}
                    id = {"filter" + props.key} />
                <i 
                    className="material-icons filter-chip-icon" 
                    onClick = {(ev) => {props.remove(props.key)}}>close</i>
            </section>
        );
    }

}

export default connect(
    ((state) => ({  })) ,
    {}
)(Filter);



