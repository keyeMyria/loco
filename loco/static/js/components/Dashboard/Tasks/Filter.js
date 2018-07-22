import React, { Component } from 'react';
import { connect } from 'react-redux';
import AutoComplete from 'material-ui/AutoComplete';

class Filter extends Component {

    constructor(props) {
        super(props)
        this.state = {
            openPopover: false,
        }; 
    }

    render() {
        let props = this.props;
        return (
            <section className="filter-chip active">
                <AutoComplete
                    floatingLabelText={props.label}
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={props.data}
                    maxSearchResults={10}
                    id={"filter" + props.key} />
                <i 
                    className="material-icons filter-chip-icon" 
                    onClick={(ev) => {props.remove(props.key)}}>close</i>
            </section>
        );
    }

}

export default connect(
    ((state) => ({  })) ,
    {}
)(Filter);



