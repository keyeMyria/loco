import React, { Component } from 'react';
import { connect } from 'react-redux';
import MerchantList from './MerchantList'
import Paginator from '../Paginator'
import {getMerchantsInit, getMerchantsNext, getMerchantsPrev} from '../../../reducer/merchants.js'

class MerchantListCard extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.getMerchantsInit();
    }

    render() {
        let merchants = this.props.merchants;
        var content = (
            <section className="list-card-content">
                <MerchantList merchantsData={merchants.data.slice(merchants.start, merchants.end)} />
                <Paginator 
                    start={merchants.start}
                    end={merchants.end}
                    limit={merchants.limit}
                    totalCount={merchants.totalCount}
                    csvURL={merchants.csvURL}
                    getNext={this.props.getMerchantsNext}
                    getPrev={this.props.getMerchantsPrev}/>
            </section>
        );

        if (merchants.inProgress) {
            content = (
                <section className="list-card-loader-holder">
                    <section className="loader list-card-loader"></section>
                </section>
            );
        }

        return (
            <section className="list-card merchant-list-card">
                {content}
            </section>
        );
    }

}

export default connect(
    ((state) => ({ merchants: state.merchants })) ,
    {getMerchantsInit: getMerchantsInit, getMerchantsNext: getMerchantsNext, getMerchantsPrev:getMerchantsPrev}
)(MerchantListCard);



