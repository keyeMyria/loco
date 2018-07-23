import React, { Component } from 'react';
import { connect } from 'react-redux';
import AutoComplete from 'material-ui/AutoComplete';
import TextField from 'material-ui/TextField';

class Filter extends Component {

    constructor(props) {
        super(props)
        this.state = {
            searchText: ""
        }; 
    }

    handleChange = (e, index) => {
        var searchText = e.target.value;
        this.props.onQueryChange(searchText, index);
        this.setState({
            searchText: searchText
        });

    };

    render() {
        let props = this.props;
        return (
            <section className="filter-chip active">
                <TextField
                    value={this.state.searchText}
                    floatingLabelText={props.label}
                    style={{width: '156px'}}
                    onChange={(e) => {this.handleChange(e, props.index)}} />
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



