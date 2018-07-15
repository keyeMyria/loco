import React, { Component } from 'react';
import { connect } from 'react-redux';
import ItemList from './ItemList'
import Paginator from '../Paginator'
import {getItemsInit, getItemsNext, getItemsPrev} from '../../../reducer/items.js'

class ItemListCard extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.getItemsInit('61', this.props.items.limit);
    }

    render() {
        let items = this.props.items;
        var content = (
            <section className="list-card-content">
                <ItemList itemsData={items.data.slice(items.start, items.end)} />
                <Paginator 
                    start={items.start}
                    end={items.end}
                    limit={items.limit}
                    totalCount={items.totalCount} 
                    currentCount={items.currentCount} 
                    getNext={this.props.getItemsNext}
                    getPrev={this.props.getItemsPrev}
                    hasMoreItems={this.props.hasMoreItems} />
            </section>
        );

        if (items.inProgress) {
            content = (
                <section className="list-card-loader-holder">
                    <section className="loader list-card-loader"></section>
                </section>
            );
        }

        return (
            <section className="list-card item-list-card">
                {content}
            </section>
        );
    }

}

export default connect(
    ((state) => ({ items: state.items })) ,
    {getItemsInit: getItemsInit, getItemsNext: getItemsNext, getItemsPrev:getItemsPrev}
)(ItemListCard);



