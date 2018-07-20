import React, { Component } from 'react';
import { connect } from 'react-redux';
import JobList from './JobList'
import {getMerchantUploads} from '../../reducer/merchants.js'

class JobListCard extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.getUploads();
    }

    render() {    
        console.log(this.props);    
        var content = (
            <section className="list-card-content">
                <JobList data={this.props.data} />
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

export default connect(
    ((state) => ({ 
        inProgress: state.merchants.getUploadsProgress,
        data: state.merchants.uploads
    })) ,
    {getUploads: getMerchantUploads}
)(JobListCard);

