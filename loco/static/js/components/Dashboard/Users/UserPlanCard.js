import React, { Component } from 'react';
import { connect } from 'react-redux';
import UserPlanList from './UserPlanList'
import Paginator from '../Paginator'

export default class UserPlanCard extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.getUserPlansInit();
    }

    viewListTitle = () => {
        if (this.props.listTitle) {
            return <h3 className="list-card-title">{this.props.listTitle}</h3>
        }
    };

    render() {
        let plans = this.props.plans;
        var content = (
            <section className="list-card-content">
                {this.viewListTitle()}
                <UserPlanList data={plans.data.slice(plans.start, plans.end)} />
                <Paginator 
                    start={plans.start}
                    end={plans.end}
                    limit={plans.limit}
                    totalCount={plans.totalCount}
                    csvURL={plans.csvURL}
                    getNext={this.props.getUserPlansNext}
                    getPrev={this.props.getUserPlansPrev}/>
            </section>
        );

        if (plans.inProgress) {
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