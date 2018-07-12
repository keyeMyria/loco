import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getItems } from '../../../reducer/dashboard';
import DataList from './DataList'

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
			<div>
                <header className="header">
				    <h1 className="title">Items</h1>
                </header>
                <DataList itemsData={this.state.itemsData} />
			</div>            
        );
	}
}

export default Items = connect(
    (state) => ({ itemsData: state.dashboard.itemsData, inProgress: state.dashboard.inProgress}), 
    {getItems: getItems}
)(Items)



