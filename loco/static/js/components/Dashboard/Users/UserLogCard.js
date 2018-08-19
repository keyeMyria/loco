import React, { Component } from 'react';
import { connect } from 'react-redux';
import UserLogList from './UserLogList'
import Paginator from '../Paginator'

export default class UserLogCard extends Component {

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.props.getUserLogsInit();
    }

    viewListTitle = () => {
        if (this.props.listTitle) {
            return <h3 className="list-card-title">{this.props.listTitle}</h3>
        }
    };

    render() {
        let logs = this.props.logs;
        var content = (
            <section className="list-card-content">
                {this.viewListTitle()}
                <UserLogList data={logs.data.slice(logs.start, logs.end)} />
                <Paginator 
                    start={logs.start}
                    end={logs.end}
                    limit={logs.limit}
                    totalCount={logs.totalCount}
                    csvURL={logs.csvURL}
                    getNext={this.props.getUserLogsNext}
                    getPrev={this.props.getUserLogsPrev}/>
            </section>
        );

        if (logs.inProgress) {
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