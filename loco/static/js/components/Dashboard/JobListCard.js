import React, { Component } from 'react';
import { connect } from 'react-redux';
import JobList from './JobList'
import {getMerchantUploads} from '../../reducer/merchants.js'

export default class JobListCard extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.getUploads();
    }

    render() {   
        var content = (
            <section className="list-card-content">
                <JobList data={this.props.data} refresh={this.props.getUploads} />
            </section>
        );

        if (this.props.inProgress) {
            content = (
                <section className="list-card-loader-holder">
                    <section className="loader list-card-loader"></section>
                </section>
            );
        }

        return (
            <section className="list-card">
                {content}
            </section>
        );
    }

}
