import React, { Component } from 'react';
import ItemList from './ItemList'
import Paginator from '../Paginator'

export default class ItemListCard extends Component {

    render() {
        return (
            <section className="list-card item-list-card">
                <ItemList itemsData={this.props.itemsData} />
                <Paginator currentPage={this.props.pagination} />
            </section>         
        );
    }
}



