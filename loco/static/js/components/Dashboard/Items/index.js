import React, { Component } from 'react';

import { getItems } from '../reducer/dashboard';
import DataList from './DataList'

class Items extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
        } 
    }

    componentWillMount() {
        this.props.getItems("61");
    }

    render() {

        return (
			<div>
                <header className="header">
				    <h1 className="title">Items</h1>
                </header>
                <DataList />
			</div>            
        );
	}
}

export default Items = connect(
    (state) => ({ itemsData: state.dashboard.itemsData, inProgress: state.dashboard.inProgress}), 
    {getItems: getItems}
)(Items)



